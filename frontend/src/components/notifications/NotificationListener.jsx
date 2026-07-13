/*
 * NotificationListener.jsx — Global socket-driven toast notifications.
 *
 * Renders nothing. Subscribes to the live Socket.io connection (useSocket) and
 * surfaces two server events as sonner toasts: `quote_request` (a new quote on
 * one of the builder's projects, with a "View" action + quotes-cache invalidate)
 * and `verification_update` (approve → success toast, reject → error toast with
 * the reason), both refreshing the user snapshot. Listeners are torn down on
 * unmount or when the socket instance changes. Mounted inside the router so it
 * can navigate.
 */
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useSocket } from '../../context/SocketContext';
import { useAuth } from '../../context/AuthContext';
import { invalidate } from '../../lib/api';

export default function NotificationListener() {
  const { socket } = useSocket();
  const { refreshUser } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!socket) return undefined;

    function onQuoteRequest({ projectName, userName }) {
      toast.info('New quote request', {
        description: `${userName || 'Someone'} requested a quote on ${projectName || 'your project'}`,
        action: {
          label: 'View',
          onClick: () => navigate('/dashboard/quote-requests'),
        },
      });
      // Drop the cached quotes list so the page refetches with the new request.
      invalidate('/api/v1/quotes');
    }

    function onVerificationUpdate({ status, reason }) {
      if (status === 'approved') {
        toast.success('Your builder account is verified — you can now list projects');
      } else if (status === 'rejected') {
        toast.error('Verification rejected', { description: reason });
      }
      // Pull the new verification_status / is_verified onto the user snapshot.
      refreshUser().catch(() => {});
    }

    socket.on('quote_request', onQuoteRequest);
    socket.on('verification_update', onVerificationUpdate);

    return () => {
      socket.off('quote_request', onQuoteRequest);
      socket.off('verification_update', onVerificationUpdate);
    };
  }, [socket, navigate, refreshUser]);

  return null;
}
