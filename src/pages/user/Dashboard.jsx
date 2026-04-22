import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Activity, BookOpen, Building2, MessageSquare, GitBranch, ArrowRight, TrendingUp, AlertCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { symptomAPI, consultationAPI, referralAPI } from '../../api/index.js';
import Card from '../../components/ui/Card.jsx';
import { RiskBadge, StatusBadge } from '../../components/ui/Badge.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import styles from './Dashboard.module.css';

const quickActions = [
  { to: '/symptoms', icon: Activity, label: 'Check Symptoms', desc: 'AI-powered analysis', color: 'orange' },
  { to: '/library', icon: BookOpen, label: 'Health Library', desc: 'Browse articles', color: 'green' },
  { to: '/facilities', icon: Building2, label: 'Find Facility', desc: 'Near you', color: 'orange' },
  { to: '/consultations', icon: MessageSquare, label: 'Consultation', desc: 'Talk to a partner', color: 'green' },
];

export default function Dashboard() {
  const { user } = useAuth();
  const [recentSessions, setRecentSessions] = useState([]);
  const [activeConsultations, setActiveConsultations] = useState([]);
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      symptomAPI.getHistory({ limit: 3 }),
      consultationAPI.getAll({ limit: 3, status: 'active' }),
      referralAPI.getAll({ limit: 3 }),
    ]).then(([s, c, r]) => {
      setRecentSessions(s.data.data.sessions || []);
      setActiveConsultations(c.data.data.consultations || []);
      setReferrals(r.data.data.referrals || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 18 ? 'Good afternoon' : 'Good evening';

  return (
    <DashboardLayout>
      <div className={styles.page}>
        {/* HEADER */}
        <div className={styles.header}>
          <div>
            <p className={styles.greeting}>{greeting} 👋</p>
            <h1 className={styles.name}>{user?.name}</h1>
            <p className={styles.subtitle}>How are you feeling today?</p>
          </div>
          <Link to="/symptoms" className={styles.checkBtn}>
            <Activity size={18} /> Start Symptom Check
          </Link>
        </div>

        {/* HEALTH PROFILE NOTICE */}
        {!user?.healthProfile?.age && (
          <div className={styles.notice}>
            <AlertCircle size={16} />
            <span>Complete your health profile for better AI recommendations.</span>
            <Link to="/profile" className={styles.noticeLink}>Update now →</Link>
          </div>
        )}

        {/* QUICK ACTIONS */}
        <div className={styles.quickGrid}>
          {quickActions.map(({ to, icon: Icon, label, desc, color }) => (
            <Link key={to} to={to} className={[styles.quickCard, styles[color]].join(' ')}>
              <div className={styles.quickIcon}><Icon size={22} /></div>
              <div>
                <p className={styles.quickLabel}>{label}</p>
                <p className={styles.quickDesc}>{desc}</p>
              </div>
              <ArrowRight size={16} className={styles.quickArrow} />
            </Link>
          ))}
        </div>

        <div className={styles.grid}>
          {/* RECENT SYMPTOM CHECKS */}
          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}><Activity size={18} />Recent Checks</h2>
              <Link to="/symptoms" className={styles.viewAll}>View all</Link>
            </div>
            {loading ? <div className={styles.skeleton} /> :
             recentSessions.length === 0 ? (
              <div className={styles.empty}>
                <Activity size={32} />
                <p>No symptom checks yet</p>
                <Link to="/symptoms"><button className={styles.emptyBtn}>Check now</button></Link>
              </div>
            ) : recentSessions.map(s => (
              <div key={s._id} className={styles.sessionRow}>
                <div className={styles.sessionSymptoms}>{s.symptoms.slice(0, 3).join(', ')}{s.symptoms.length > 3 ? '...' : ''}</div>
                <div className={styles.sessionRight}>
                  <RiskBadge level={s.riskLevel} />
                  <span className={styles.sessionDate}>{new Date(s.createdAt).toLocaleDateString()}</span>
                </div>
              </div>
            ))}
          </Card>

          {/* ACTIVE CONSULTATIONS */}
          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}><MessageSquare size={18} />Consultations</h2>
              <Link to="/consultations" className={styles.viewAll}>View all</Link>
            </div>
            {loading ? <div className={styles.skeleton} /> :
             activeConsultations.length === 0 ? (
              <div className={styles.empty}>
                <MessageSquare size={32} />
                <p>No active consultations</p>
                <Link to="/consultations"><button className={styles.emptyBtn}>Request one</button></Link>
              </div>
            ) : activeConsultations.map(c => (
              <Link key={c._id} to={`/consultations/${c._id}`} className={styles.consultRow}>
                <div className={styles.consultAvatar}>{c.partnerId?.name?.[0] || '?'}</div>
                <div className={styles.consultInfo}>
                  <p className={styles.consultPartner}>{c.partnerId?.name || 'Awaiting partner'}</p>
                  <p className={styles.consultConcern}>{c.concern.substring(0, 50)}...</p>
                </div>
                <StatusBadge status={c.status} />
              </Link>
            ))}
          </Card>

          {/* REFERRALS */}
          <Card>
            <div className={styles.cardHead}>
              <h2 className={styles.cardTitle}><GitBranch size={18} />Referrals</h2>
              <Link to="/referrals" className={styles.viewAll}>View all</Link>
            </div>
            {loading ? <div className={styles.skeleton} /> :
             referrals.length === 0 ? (
              <div className={styles.empty}><GitBranch size={32} /><p>No referrals yet</p></div>
            ) : referrals.map(r => (
              <div key={r._id} className={styles.referralRow}>
                <div className={styles.referralFacility}>{r.facilityId?.name || 'Unknown facility'}</div>
                <div className={styles.referralRight}>
                  <StatusBadge status={r.status} />
                  <span className={[styles.urgencyDot, styles[r.urgency]].join(' ')} title={r.urgency} />
                </div>
              </div>
            ))}
          </Card>

          {/* HEALTH TIP */}
          <Card className={styles.tipCard}>
            <div className={styles.tipInner}>
              <TrendingUp size={28} className={styles.tipIcon} />
              <div>
                <h3 className={styles.tipTitle}>Daily Health Tip</h3>
                <p className={styles.tipText}>Drinking 8 glasses of water daily supports kidney function, skin health, and energy levels. Start your morning with a full glass before anything else.</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </DashboardLayout>
  );
}
