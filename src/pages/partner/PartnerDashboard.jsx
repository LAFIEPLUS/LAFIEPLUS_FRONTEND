import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, GitBranch, ToggleLeft, ToggleRight, ArrowRight, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { partnerAPI, consultationAPI, referralAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import styles from './PartnerDashboard.module.css';

export default function PartnerDashboard() {
  const { user, updateUser } = useAuth();
  const [stats, setStats] = useState(null);
  const [pending, setPending] = useState([]);
  const [active, setActive] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);

  useEffect(() => {
    Promise.all([
      partnerAPI.getStats(),
      consultationAPI.getAll({ status: 'pending', limit: 5 }),
      consultationAPI.getAll({ status: 'active', limit: 5 }),
      referralAPI.getAll({ limit: 5 }),
    ]).then(([s, p, a, r]) => {
      setStats(s.data.data.stats);
      setPending(p.data.data.consultations || []);
      setActive(a.data.data.consultations || []);
      setReferrals(r.data.data.referrals || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const toggleAvailability = async () => {
    setToggling(true);
    try {
      const next = !user?.partnerInfo?.isAvailable;
      await partnerAPI.toggleAvailability(next);
      updateUser({ partnerInfo: { ...user?.partnerInfo, isAvailable: next } });
      toast.success(next ? 'You are now available' : 'You are now unavailable');
    } catch { toast.error('Failed to update availability'); }
    finally { setToggling(false); }
  };

  const isAvailable = user?.partnerInfo?.isAvailable;

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <p className={styles.role}>Partner Portal</p>
            <h1 className={styles.name}> {user?.name}</h1>
            <p className={styles.specialty}>{user?.partnerInfo?.specialty || 'Health Partner'}</p>
          </div>
          <button className={[styles.toggleBtn, isAvailable ? styles.available : styles.unavailable].join(' ')}
            onClick={toggleAvailability} disabled={toggling}>
            {isAvailable ? <ToggleRight size={22} /> : <ToggleLeft size={22} />}
            {isAvailable ? 'Available' : 'Unavailable'}
          </button>
        </div>

        {/* STATS */}
        <div className={styles.statsRow}>
          {[
            { label: 'Total Consultations', value: stats?.totalConsultations ?? '—', color: 'orange' },
            { label: 'Active Now', value: stats?.activeConsultations ?? '—', color: 'green' },
            { label: 'Closed', value: stats?.closedConsultations ?? '—', color: 'gray' },
            { label: 'Referrals Issued', value: stats?.totalReferrals ?? '—', color: 'orange' },
          ].map(({ label, value, color }) => (
            <div key={label} className={[styles.statCard, styles[color]].join(' ')}>
              <span className={styles.statValue}>{value}</span>
              <span className={styles.statLabel}>{label}</span>
            </div>
          ))}
        </div>

        <div className={styles.grid}>
          {/* PENDING */}
          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}><Clock size={16} />Pending Requests</h2>
              <Link to="/partner/consultations" className={styles.viewAll}>View all</Link>
            </div>
            {loading ? <div className={styles.skeleton} /> :
             pending.length === 0 ? <p className={styles.none}>No pending requests</p> :
             pending.map(c => (
              <Link key={c._id} to={`/consultations/${c._id}`} className={styles.consultRow}>
                <div className={styles.avatar}>{c.userId?.name?.[0] || '?'}</div>
                <div className={styles.consultInfo}>
                  <span className={styles.consultName}>{c.userId?.name || 'Patient'}</span>
                  <span className={styles.consultConcern}>{c.concern.substring(0, 60)}...</span>
                </div>
                <div className={styles.consultRight}>
                  <span className={styles.specialty}>{c.specialty}</span>
                  <ArrowRight size={14} className={styles.arrow} />
                </div>
              </Link>
            ))}
          </Card>

          {/* ACTIVE */}
          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}><MessageSquare size={16} />Active Consultations</h2>
              <Link to="/partner/consultations" className={styles.viewAll}>View all</Link>
            </div>
            {loading ? <div className={styles.skeleton} /> :
             active.length === 0 ? <p className={styles.none}>No active consultations</p> :
             active.map(c => (
              <Link key={c._id} to={`/consultations/${c._id}`} className={styles.consultRow}>
                <div className={styles.avatar}>{c.userId?.name?.[0] || '?'}</div>
                <div className={styles.consultInfo}>
                  <span className={styles.consultName}>{c.userId?.name || 'Patient'}</span>
                  <span className={styles.consultConcern}>{c.messages?.length || 0} messages</span>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </Card>

          {/* REFERRALS */}
          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}><GitBranch size={16} />Recent Referrals</h2>
              <Link to="/partner/referrals" className={styles.viewAll}>View all</Link>
            </div>
            {loading ? <div className={styles.skeleton} /> :
             referrals.length === 0 ? <p className={styles.none}>No referrals issued yet</p> :
             referrals.map(r => (
              <div key={r._id} className={styles.referralRow}>
                <div className={styles.referralInfo}>
                  <span className={styles.consultName}>{r.userId?.name || 'Patient'}</span>
                  <span className={styles.consultConcern}>{r.facilityId?.name}</span>
                </div>
                <StatusBadge status={r.status} />
              </div>
            ))}
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
