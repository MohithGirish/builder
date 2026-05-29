/*
 * Footer.jsx — Global site footer component.
 *
 * Renders a four-column dark footer with the Builder.AI brand (logo, tagline,
 * contact info), Company links, Builders links, and Investors links. The
 * bottom bar shows the copyright notice and social media icon links. Displayed
 * on all public pages; hidden on dashboard, dealroom, auth, and onboarding
 * pages via route-conditional rendering in App.jsx.
 */
import { Link } from 'react-router-dom';
import { Building2, Mail, Phone, MapPin, Linkedin, Twitter, Instagram, Heart } from 'lucide-react';

const COMPANY = ['About Us', 'Contact', 'Privacy Policy', 'Careers'];
const BUILDER_LINKS = ['Join as Builder', 'List Projects', 'Get Verified', 'Success Stories'];
const INV_LINKS     = ['Join as Investor', 'Browse Projects', 'Analytics Dashboard', 'FAQ'];

export default function Footer() {
  return (
    <footer className="relative bg-slate-900 text-slate-300">
      {/* Top accent line */}
      <div className="h-1 w-full bg-gradient-to-r from-brand-500 via-brand-400 to-amber-400" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">

        {/* Brand */}
        <div>
          <Link to="/" className="flex items-center gap-2 mb-4 group w-fit">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-brand-gradient transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3">
              <Building2 size={16} className="text-white" />
            </div>
            <span className="text-white font-bold text-base">Builder.AI</span>
            <span className="text-xs text-slate-400 font-medium">Market</span>
          </Link>
          <p className="text-sm text-slate-400 leading-relaxed mb-5">
            India's premier AI-powered platform connecting verified builders and investors for
            real-estate, infrastructure, and venture projects.
          </p>
          <div className="space-y-2 text-sm text-slate-400">
            <div className="flex items-center gap-2"><Mail size={14} /><span>contact@builderai-market.com</span></div>
            <div className="flex items-center gap-2"><Phone size={14} /><span>+91 22 1234 5678</span></div>
            <div className="flex items-center gap-2"><MapPin size={14} /><span>Mumbai, India</span></div>
          </div>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Company</h4>
          <ul className="space-y-2">
            {COMPANY.map((l) => (
              <li key={l}><a href="#" className="text-sm text-slate-400 hover:text-brand-400 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Builders */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Builders</h4>
          <ul className="space-y-2">
            {BUILDER_LINKS.map((l) => (
              <li key={l}><a href="#" className="text-sm text-slate-400 hover:text-brand-400 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>

        {/* Investors */}
        <div>
          <h4 className="text-white font-semibold text-sm mb-4">Investors</h4>
          <ul className="space-y-2">
            {INV_LINKS.map((l) => (
              <li key={l}><a href="#" className="text-sm text-slate-400 hover:text-brand-400 transition-colors">{l}</a></li>
            ))}
          </ul>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3">
          <p className="text-xs text-slate-500 flex items-center gap-1.5">
            © 2025 Builder AI Market · Made with
            <Heart size={11} className="text-red-400 fill-red-400" />
            in India
          </p>
          <div className="flex items-center gap-3">
            {[
              { Icon: Linkedin,  label: 'LinkedIn' },
              { Icon: Twitter,   label: 'Twitter' },
              { Icon: Instagram, label: 'Instagram' },
            ].map(({ Icon, label }) => (
              <a key={label} href="#" aria-label={label} className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 hover:text-white hover:bg-brand-600 hover:-translate-y-0.5 transition-all">
                <Icon size={14} />
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
