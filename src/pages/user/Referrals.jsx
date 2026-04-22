import { useState, useEffect } from 'react';
import { GitBranch, MapPin, Clock, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { referralAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import styles from './Referrals.module.css';

const urgencyConfig = {
  routine: { color: 'var(--green)', label: 'Routine' },
  urgent: { color: 'var(--warning)', label: 'Urgent' },
  emergency: { color: 'var(--danger)', label: 'Emergency' },
};

const STATUS_TRANSITIONS = {
  pending: ['accepted', 'cancelled'],
  accepted: ['completed', 'cancelled'],
  completed: [],
  cancelled: [],
};

export default function Referrals() {
  const { user } = useAuth();
  const [referrals, setReferrals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState(null);
  const [updating, setUpdating] = useState(false);

  const loadReferrals = () => {
    setLoading(true);
    referralAPI.getAll()
      .then(r => setReferrals(r.data.data.referrals || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    loadReferrals();
  }, []);

  const canUpdateStatus = user?.role === 'partner' || user?.role === 'admin';
  const nextStatuses = selected ? (STATUS_TRANSITIONS[selected.status] || []) : [];

  const handleUpdateStatus = async (status) => {
    if (!selected?._id) return;
    const note = window.prompt(`Optional note for changing status to "${status}":`, '') || '';
    setUpdating(true);
    try {
      const res = await referralAPI.updateStatus(selected._id, { status, note });
      const updated = res.data?.data?.referral;
      const next = referrals.map((r) => (r._id === selected._id ? { ...r, ...updated } : r));
      setReferrals(next);
      const freshSelected = updated ? { ...selected, ...updated } : selected;
      setSelected(freshSelected);
      toast.success(`Referral status updated to ${status}`);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update referral status');
    } finally {
      setUpdating(false);
    }
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerIcon}><GitBranch size={22} /></div>
          <div>
            <h1 className={styles.title}>My Referrals</h1>
            <p className={styles.subtitle}>Track your health facility referrals and their status.</p>
          </div>
        </div>

        {loading ? (
          <div className={styles.loadList}>{[...Array(3)].map((_, i) => <div key={i} className={styles.skeleton} />)}</div>
        ) : referrals.length === 0 ? (
          <Card className={styles.empty}>
            <GitBranch size={40} />
            <h3>No referrals yet</h3>
            <p>Referrals from your health partners will appear here.</p>
          </Card>
        ) : (
          <div className={styles.layout}>
            <div className={styles.list}>
              {referrals.map(r => {
                const urg = urgencyConfig[r.urgency] || urgencyConfig.routine;
                return (
                  <div key={r._id}
                    className={[styles.referralCard, selected?._id === r._id ? styles.active : ''].join(' ')}
                    onClick={() => setSelected(r)}>
                    <div className={styles.referralTop}>
                      <div className={styles.facilityName}>{r.facilityId?.name || 'Unknown Facility'}</div>
                      <StatusBadge status={r.status} />
                    </div>
                    <p className={styles.reason}>{r.reason.substring(0, 80)}{r.reason.length > 80 ? '...' : ''}</p>
                    <div className={styles.referralMeta}>
                      {r.facilityId?.address && <span><MapPin size={12} />{r.facilityId.address.substring(0, 30)}</span>}
                      <span style={{ color: urg.color }}><AlertCircle size={12} />{urg.label}</span>
                      <span><Clock size={12} />{new Date(r.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>

            {selected && (
              <Card className={styles.detail}>
                <div className={styles.detailHeader}>
                  <h2>{selected.facilityId?.name}</h2>
                  <StatusBadge status={selected.status} />
                </div>
                <div className={styles.detailSection}>
                  <p className={styles.detailLabel}>Reason for Referral</p>
                  <p className={styles.detailValue}>{selected.reason}</p>
                </div>
                {selected.facilityId?.address && (
                  <div className={styles.detailSection}>
                    <p className={styles.detailLabel}>Facility Address</p>
                    <p className={styles.detailValue}><MapPin size={14} />{selected.facilityId.address}</p>
                  </div>
                )}
                {selected.facilityId?.phone && (
                  <div className={styles.detailSection}>
                    <p className={styles.detailLabel}>Contact</p>
                    <a href={`tel:${selected.facilityId.phone}`} className={styles.phoneLink}>
                      {selected.facilityId.phone}
                    </a>
                  </div>
                )}
                <div className={styles.detailSection}>
                  <p className={styles.detailLabel}>Urgency</p>
                  <span style={{ color: urgencyConfig[selected.urgency]?.color, fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                    {urgencyConfig[selected.urgency]?.label}
                  </span>
                </div>
                <div className={styles.detailSection}>
                  <p className={styles.detailLabel}>Issued by</p>
                  <p className={styles.detailValue}>{selected.issuedBy?.name || 'Health Partner'}</p>
                </div>
                {canUpdateStatus && nextStatuses.length > 0 && (
                  <div className={styles.detailSection}>
                    <p className={styles.detailLabel}>Update Status</p>
                    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                      {nextStatuses.map((status) => (
                        <Button key={status} size="sm" loading={updating} onClick={() => handleUpdateStatus(status)}>
                          Mark as {status}
                        </Button>
                      ))}
                    </div>
                  </div>
                )}
                <div className={styles.timeline}>
                  <p className={styles.detailLabel}>Status History</p>
                  {selected.statusHistory?.map((h, i) => (
                    <div key={i} className={styles.timelineItem}>
                      <div className={styles.timelineDot} />
                      <div>
                        <span className={styles.timelineStatus}>{h.status}</span>
                        <span className={styles.timelineDate}>{new Date(h.changedAt).toLocaleString()}</span>
                        {h.note && <p className={styles.timelineNote}>{h.note}</p>}
                      </div>
                    </div>
                  ))}
                </div>
                {selected.appointmentDate && (
                  <div className={styles.appointmentBox}>
                    <Clock size={16} />
                    <div>
                      <p className={styles.detailLabel}>Appointment</p>
                      <p className={styles.detailValue}>{new Date(selected.appointmentDate).toLocaleString()}</p>
                    </div>
                  </div>
                )}
              </Card>
            )}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
