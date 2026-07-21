#!/usr/bin/env bash
#
# ec2-bootstrap.sh — EC2 user-data for the backend host (Amazon Linux 2023).
#
# Installs docker + the compose and buildx plugins, adds swap, and clones the
# repo to /opt/builderai. Runs once at first boot; deploys afterwards go through
# scripts/deploy-ec2.sh via SSM Send-Command. There is no SSH access to this box.
#
# Pass with: aws ec2 run-instances --user-data file://scripts/ec2-bootstrap.sh
set -euxo pipefail
exec > >(tee /var/log/builderai-bootstrap.log) 2>&1

dnf update -y
dnf install -y docker git jq

systemctl enable --now docker

mkdir -p /usr/local/lib/docker/cli-plugins

# AL2023's docker package ships neither the compose v2 plugin nor buildx.
curl -SL https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64 \
  -o /usr/local/lib/docker/cli-plugins/docker-compose
chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

# buildx is not optional: compose v2 refuses to build without it, failing with
# "compose build requires buildx 0.17.0 or later". Its release assets carry the
# version in the filename, so there is no /latest/download/ shortcut like above.
BV=$(curl -s https://api.github.com/repos/docker/buildx/releases/latest | jq -r .tag_name)
curl -SL "https://github.com/docker/buildx/releases/download/${BV}/buildx-${BV}.linux-amd64" \
  -o /usr/local/lib/docker/cli-plugins/docker-buildx
chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

docker compose version
docker buildx version

# t3.micro has 1 GiB of RAM and this box runs node + postgres + redis, plus a
# `docker build` that briefly wants more than all of it. Without swap the build
# gets OOM-killed. 2 GiB costs nothing but disk.
if [ ! -f /swapfile ]; then
  dd if=/dev/zero of=/swapfile bs=1M count=2048
  chmod 600 /swapfile
  mkswap /swapfile
  swapon /swapfile
  echo '/swapfile none swap sw 0 0' >> /etc/fstab
fi

# Public repo, so no deploy key or token is needed on the box.
if [ ! -d /opt/builderai/.git ]; then
  git clone --depth 1 https://github.com/MohithGirish/builder.git /opt/builderai
fi
chmod +x /opt/builderai/scripts/*.sh

touch /var/log/builderai-bootstrap-complete
echo "BOOTSTRAP COMPLETE"
