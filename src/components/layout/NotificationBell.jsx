import { useState, useEffect, useRef } from 'react';
import { Bell, MessageSquare, GitBranch, X, CheckCheck } from 'lucide-react';
import { Link } from 'react-router-dom';
import { consultationAPI, referralAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './NotificationBell.module.css';

export default function NotificationBell() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [loading, setLoading] = useState(false);
  const ref = useRef();

  const buildNotifications = (consultations, referrals) => {
    const notifs = [];

    consultations.forEach(c => {
      if (c.status === 'pending' && user?.role === 'partner') {
        notifs.push({
          id: `c-pending-${c._id}`,
          icon: 'consultation',
          title: 'New consultation request',
          desc: `${c.userId?.name || 'A patient'} needs help with: ${c.concern.substring(0, 50)}...`,
          link: `/consultations/${c._id}`,
          time: c.createdAt,
          read: false,
        });
      }
      if (c.status === 'active' && c.messages?.length > 0) {
        const lastMsg = c.messages[c.messages.length - 1];
        const sid = String(lastMsg.senderId?._id ?? lastMsg.senderId ?? '');
        const uid = String(user?.id ?? user?._id ?? '');
        const isOtherSender = sid && uid && sid !== uid;
        if (isOtherSender && !lastMsg.readAt) {
          notifs.push({
            id: `c-msg-${c._id}`,
            icon: 'message',
            title: 'New message',
            desc: `${user?.role === 'partner' ? c.userId?.name : c.partnerId?.name || 'Your partner'} sent a message`,
            link: `/consultations/${c._id}`,
            time: lastMsg.sentAt || lastMsg.createdAt,
            read: false,
          });
        }
      }
      if (c.status === 'active' && user?.role === 'user' && c.acceptedAt) {
        const recent = Date.now() - new Date(c.acceptedAt).getTime() < 3600000;
        if (recent) {
          notifs.push({
            id: `c-accepted-${c._id}`,
            icon: 'consultation',
            title: 'Consultation accepted',
            desc: `${c.partnerId?.name || 'A partner'} accepted your consultation request`,
            link: `/consultations/${c._id}`,
            time: c.acceptedAt,
            read: false,
          });
        }
      }
    });

    referrals.forEach(r => {
      if (r.status === 'pending' && user?.role === 'user') {
        notifs.push({
          id: `r-${r._id}`,
          icon: 'referral',
          title: 'New referral',
          desc: `You've been referred to ${r.facilityId?.name || 'a facility'}`,
          link: `/referrals`,
          time: r.createdAt,
          read: false,
        });
      }
    });

    notifs.sort((a, b) => new Date(b.time) - new Date(a.time));
    return notifs.slice(0, 10);
  };

  const fetchNotifications = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [cRes, rRes] = await Promise.all([
        consultationAPI.getAll({ limit: 10 }),
        referralAPI.getAll({ limit: 10 }),
      ]);
      const c = cRes.data.data.consultations || [];
      const r = rRes.data.data.referrals || [];
      const notifs = buildNotifications(c, r);
      setNotifications(notifs);
      setUnread(notifs.filter(n => !n.read).length);
    } catch { /* silent */ }
    finally { setLoading(false); }
  };

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 30000); // poll every 30s
    return () => clearInterval(interval);
  }, [user]);

  // Close on outside click
  useEffect(() => {
    const handler = (e) => { if (ref.current && !ref.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const markAllRead = () => {
    setNotifications(p => p.map(n => ({ ...n, read: true })));
    setUnread(0);
  };

  const timeAgo = (date) => {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  };

  return (
    <div className={styles.wrap} ref={ref}>
      <button className={styles.bellBtn} onClick={() => { setOpen(!open); if (!open) fetchNotifications(); }}>
        <Bell size={18} />
        {unread > 0 && <span className={styles.badge}>{unread > 9 ? '9+' : unread}</span>}
      </button>

      {open && (
        <div className={styles.panel}>
          <div className={styles.panelHead}>
            <h3>Notifications</h3>
            <div className={styles.panelActions}>
              {unread > 0 && (
                <button className={styles.markRead} onClick={markAllRead}>
                  <CheckCheck size={14} /> Mark all read
                </button>
              )}
              <button className={styles.closeBtn} onClick={() => setOpen(false)}>
                <X size={16} />
              </button>
            </div>
          </div>

          <div className={styles.list}>
            {loading && notifications.length === 0 ? (
              <div className={styles.loading}><div className={styles.spinner} /></div>
            ) : notifications.length === 0 ? (
              <div className={styles.empty}>
                <Bell size={28} />
                <p>No notifications yet</p>
              </div>
            ) : notifications.map(n => (
              <Link key={n.id} to={n.link}
                className={[styles.notif, !n.read ? styles.unread : ''].join(' ')}
                onClick={() => {
                  setNotifications(p => p.map(x => x.id === n.id ? { ...x, read: true } : x));
                  setUnread(p => Math.max(0, p - 1));
                  setOpen(false);
                }}>
                <div className={[styles.notifIcon, styles[n.icon]].join(' ')}>
                  {n.icon === 'consultation' && <MessageSquare size={14} />}
                  {n.icon === 'message' && <MessageSquare size={14} />}
                  {n.icon === 'referral' && <GitBranch size={14} />}
                </div>
                <div className={styles.notifBody}>
                  <p className={styles.notifTitle}>{n.title}</p>
                  <p className={styles.notifDesc}>{n.desc}</p>
                  <span className={styles.notifTime}>{timeAgo(n.time)}</span>
                </div>
                {!n.read && <span className={styles.unreadDot} />}
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}