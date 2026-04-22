import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Activity, BookOpen, Building2,
  MessageSquare, GitBranch, Users, FileText,
  BarChart2, X, ChevronRight, UserCheck, Stethoscope
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import styles from './Sidebar.module.css';

const userNav = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/symptoms', icon: Activity, label: 'Symptom Checker' },
  { to: '/library', icon: BookOpen, label: 'Health Library' },
  { to: '/facilities', icon: Building2, label: 'Find Facilities' },
  { to: '/consultations', icon: MessageSquare, label: 'Consultations' },
  { to: '/referrals', icon: GitBranch, label: 'Referrals' },
];

const partnerNav = [
  { to: '/partner', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/partner/consultations', icon: MessageSquare, label: 'Consultations' },
  { to: '/partner/referrals', icon: GitBranch, label: 'Referrals' },
  { to: '/library', icon: BookOpen, label: 'Health Library' },
  { to: '/facilities', icon: Building2, label: 'Facilities' },
];

const adminNav = [
  { to: '/admin', icon: BarChart2, label: 'Overview' },
  { to: '/admin/users', icon: Users, label: 'Users' },
  { to: '/admin/content', icon: FileText, label: 'Content' },
  { to: '/admin/facilities', icon: Building2, label: 'Facilities' },
  { to: '/admin/consultations', icon: MessageSquare, label: 'Consultations' },
  { to: '/admin/referrals', icon: GitBranch, label: 'Referrals' },
];

export default function Sidebar({ open, onClose }) {
  const { user } = useAuth();
  const nav = user?.role === 'admin' ? adminNav : user?.role === 'partner' ? partnerNav : userNav;

  return (
    <>
      {open && <div className={styles.overlay} onClick={onClose} />}
      <aside className={[styles.sidebar, open ? styles.open : ''].join(' ')}>
        <div className={styles.header}>
          <div className={styles.logo}>
            <div className={styles.logoIcon}><span>+</span></div>
            <span>
              <span className={styles.orange}>Lafie</span>
              <span className={styles.green}>plus</span>
            </span>
          </div>
          <button className={styles.closeBtn} onClick={onClose}><X size={18} /></button>
        </div>

        <div className={styles.roleTag}>
          {user?.role === 'admin' ? <><BarChart2 size={12} /> Admin Panel</> :
           user?.role === 'partner' ? <><Stethoscope size={12} /> Partner Portal</> :
           <><UserCheck size={12} /> My Health</>}
        </div>

        <nav className={styles.nav}>
          {nav.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to} to={to} end={to === '/dashboard' || to === '/partner' || to === '/admin'}
              className={({ isActive }) => [styles.navItem, isActive ? styles.active : ''].join(' ')}
              onClick={onClose}
            >
              <Icon size={18} />
              <span>{label}</span>
              <ChevronRight size={14} className={styles.arrow} />
            </NavLink>
          ))}
        </nav>

        <div className={styles.footer}>
          <div className={styles.footerCard}>
            <p className={styles.footerTitle}>Need help?</p>
            <p className={styles.footerText}>Connecting Health, Creating Futures.</p>
          </div>
        </div>
      </aside>
    </>
  );
}
