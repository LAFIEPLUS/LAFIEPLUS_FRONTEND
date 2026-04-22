import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, FileText, Building2, MessageSquare, GitBranch, TrendingUp, ArrowRight } from 'lucide-react';
import { userAPI, consultationAPI, referralAPI, libraryAPI } from '../../api/index.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import styles from './AdminDashboard.module.css';

export default function AdminDashboard() {
  const [stats, setStats] = useState({ users: 0, consultations: 0, referrals: 0, articles: 0 });
  const [users, setUsers] = useState([]);
  const [consultations, setConsultations] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const [uRes, cRes, rRes, aRes] = await Promise.allSettled([
        userAPI.getAllUsers({ limit: 5, page: 1 }),
        consultationAPI.getAll({ limit: 5, page: 1 }),
        referralAPI.getAll({ limit: 5, page: 1 }),
        libraryAPI.getArticles({ limit: 1, page: 1 }),
      ]);

      const uData = uRes.status === 'fulfilled' ? (uRes.value.data?.data || {}) : {};
      const cData = cRes.status === 'fulfilled' ? (cRes.value.data?.data || {}) : {};
      const rData = rRes.status === 'fulfilled' ? (rRes.value.data?.data || {}) : {};
      const aData = aRes.status === 'fulfilled' ? (aRes.value.data?.data || {}) : {};

      const recentUsers = uData.users || [];
      const recentConsultations = cData.consultations || [];
      const recentReferrals = rData.referrals || [];

      setUsers(recentUsers);
      setConsultations(recentConsultations);
      setReferrals(recentReferrals);
      setStats({
        users: uData.pagination?.total ?? uData.total ?? recentUsers.length ?? 0,
        consultations: cData.pagination?.total ?? cData.total ?? recentConsultations.length ?? 0,
        referrals: rData.pagination?.total ?? rData.total ?? recentReferrals.length ?? 0,
        articles: aData.pagination?.total ?? aData.total ?? 0,
      });
      setLoading(false);
    };
    load();
  }, []);

  const statCards = [
    { icon: Users, label: 'Total Users', value: stats.users ?? '—', to: '/admin/users', color: 'orange' },
    { icon: MessageSquare, label: 'Consultations', value: stats.consultations ?? '—', to: '/admin/consultations', color: 'green' },
    { icon: GitBranch, label: 'Referrals', value: stats.referrals ?? '—', to: '/admin/referrals', color: 'orange' },
    { icon: FileText, label: 'Content', value: 'Manage', to: '/admin/content', color: 'green' },
  ];

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.role}>Admin Panel</p>
            <h1 className={styles.title}>Platform Overview</h1>
            <p className={styles.subtitle}>Monitor users, content, and system activity.</p>
          </div>
          <div className={styles.badge}><TrendingUp size={14} /> Live</div>
        </div>

        <div className={styles.statsGrid}>
          {statCards.map(({ icon: Icon, label, value, to, color }) => (
            <Link key={to} to={to} className={[styles.statCard, styles[color]].join(' ')}>
              <div className={styles.statIcon}><Icon size={20} /></div>
              <div className={styles.statInfo}>
                <span className={styles.statValue}>{value}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
              <ArrowRight size={16} className={styles.statArrow} />
            </Link>
          ))}
        </div>

        <div className={styles.grid}>
          {/* RECENT USERS */}
          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}><Users size={16} />Recent Users</h2>
              <Link to="/admin/users" className={styles.viewAll}>Manage →</Link>
            </div>
            {loading ? <div className={styles.skeleton} /> :
             users.map(u => (
              <div key={u._id} className={styles.userRow}>
                <div className={styles.userAvatar}>{u.name[0]}</div>
                <div className={styles.userInfo}>
                  <span className={styles.userName}>{u.name}</span>
                  <span className={styles.userEmail}>{u.email || u.phone}</span>
                </div>
                <div className={styles.userRole}>{u.role}</div>
                <div className={[styles.userStatus, u.isActive ? styles.active : styles.inactive].join(' ')}>
                  {u.isActive ? 'Active' : 'Inactive'}
                </div>
              </div>
            ))}
          </Card>

          {/* RECENT CONSULTATIONS */}
          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}><MessageSquare size={16} />Recent Consultations</h2>
              <Link to="/admin/consultations" className={styles.viewAll}>View all →</Link>
            </div>
            {loading ? <div className={styles.skeleton} /> :
             consultations.length === 0 ? <p className={styles.none}>No consultations</p> :
             consultations.map(c => (
              <div key={c._id} className={styles.consultRow}>
                <div className={styles.consultInfo}>
                  <span className={styles.userName}>{c.userId?.name || 'User'}</span>
                  <span className={styles.userEmail}>{c.concern.substring(0, 50)}...</span>
                </div>
                <StatusBadge status={c.status} />
              </div>
            ))}
          </Card>

          {/* RECENT REFERRALS */}
          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}><GitBranch size={16} />Recent Referrals</h2>
              <Link to="/admin/referrals" className={styles.viewAll}>View all →</Link>
            </div>
            {loading ? <div className={styles.skeleton} /> :
             referrals.length === 0 ? <p className={styles.none}>No referrals</p> :
             referrals.map(r => (
              <div key={r._id} className={styles.referralRow}>
                <div>
                  <span className={styles.userName}>{r.userId?.name || 'Patient'}</span>
                  <span className={styles.userEmail}>{r.facilityId?.name || 'Facility'}</span>
                </div>
                <div className={styles.refRight}>
                  <StatusBadge status={r.status} />
                  <span className={[styles.urgency, styles[r.urgency]].join(' ')}>{r.urgency}</span>
                </div>
              </div>
            ))}
          </Card>

          {/* QUICK LINKS */}
          <Card className={styles.quickCard}>
            <h2 className={styles.cardTitle} style={{ marginBottom: 16 }}>Quick Actions</h2>
            {[
              { to: '/admin/users', icon: Users, label: 'Manage Users', desc: 'View, edit, delete users' },
              { to: '/admin/content', icon: FileText, label: 'Manage Content', desc: 'Articles & health library' },
              { to: '/admin/facilities', icon: Building2, label: 'Manage Facilities', desc: 'Add / update facilities' },
            ].map(({ to, icon: Icon, label, desc }) => (
              <Link key={to} to={to} className={styles.quickLink}>
                <Icon size={18} />
                <div><p>{label}</p><p>{desc}</p></div>
                <ArrowRight size={14} />
              </Link>
            ))}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
