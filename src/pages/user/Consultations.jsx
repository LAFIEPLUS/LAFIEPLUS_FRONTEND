import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Plus, X, Send } from 'lucide-react';
import toast from 'react-hot-toast';
import { consultationAPI, partnerAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import styles from './Consultations.module.css';

export default function Consultations() {
  const { user } = useAuth();
  const [consultations, setConsultations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [partners, setPartners] = useState([]);
  const [form, setForm] = useState({ concern: '', specialty: 'general' });
  const [submitting, setSubmitting] = useState(false);

  const fetchAll = () => {
    setLoading(true);
    consultationAPI.getAll().then(r => setConsultations(r.data.data.consultations || []))
      .catch(() => {}).finally(() => setLoading(false));
  };

  useEffect(() => { fetchAll(); }, []);

  const openModal = () => {
    setShowModal(true);
    partnerAPI.getAvailable().then(r => setPartners(r.data.data.partners || [])).catch(() => {});
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await consultationAPI.create(form);
      toast.success('Consultation request submitted!');
      setShowModal(false);
      setForm({ concern: '', specialty: 'general' });
      fetchAll();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to create consultation');
    } finally { setSubmitting(false); }
  };

  const isPartner = user?.role === 'partner';

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div>
            <h1 className={styles.title}>Consultations</h1>
            <p className={styles.subtitle}>{isPartner ? 'Manage your patient consultations' : 'Connect with health partners for guidance'}</p>
          </div>
          {!isPartner && <Button onClick={openModal}><Plus size={16} /> Request Consultation</Button>}
        </div>

        {loading ? (
          <div className={styles.loading}><div className={styles.spinner} /></div>
        ) : consultations.length === 0 ? (
          <Card className={styles.empty}>
            <MessageSquare size={40} />
            <h3>No consultations yet</h3>
            <p>Request a consultation with one of our health partners to get personalised guidance.</p>
            {!isPartner && <Button onClick={openModal}><Plus size={16} /> New Consultation</Button>}
          </Card>
        ) : (
          <div className={styles.list}>
            {consultations.map(c => (
              <Link key={c._id} to={`/consultations/${c._id}`} className={styles.consultCard}>
                <div className={styles.consultAvatar}>
                  {isPartner ? c.userId?.name?.[0] : (c.partnerId?.name?.[0] || '?')}
                </div>
                <div className={styles.consultInfo}>
                  <div className={styles.consultTop}>
                    <span className={styles.consultName}>
                      {isPartner ? (c.userId?.name || 'Patient') : (c.partnerId?.name || 'Awaiting partner')}
                    </span>
                    <StatusBadge status={c.status} />
                  </div>
                  <p className={styles.consultConcern}>{c.concern.substring(0, 100)}{c.concern.length > 100 ? '...' : ''}</p>
                  <div className={styles.consultMeta}>
                    <span className={styles.specialty}>{c.specialty}</span>
                    <span className={styles.date}>{new Date(c.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
                <Send size={16} className={styles.arrow} />
              </Link>
            ))}
          </div>
        )}
      </div>

      {/* CREATE MODAL */}
      {showModal && (
        <div className={styles.overlay} onClick={() => setShowModal(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>New Consultation</h2>
              <button onClick={() => setShowModal(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleCreate} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Specialty needed</label>
                <select value={form.specialty} onChange={e => setForm(p => ({ ...p, specialty: e.target.value }))}>
                  <option value="general">General Medicine</option>
                  <option value="maternal">Maternal Health</option>
                  <option value="adolescent">Adolescent Health</option>
                  <option value="mental_health">Mental Health</option>
                </select>
              </div>
              <div className={styles.field}>
                <label>Describe your concern</label>
                <textarea rows={5} placeholder="Please describe what you're experiencing in as much detail as possible..."
                  value={form.concern} onChange={e => setForm(p => ({ ...p, concern: e.target.value }))} required minLength={10} />
              </div>
              {partners.length > 0 && (
                <div className={styles.partnerList}>
                  <p className={styles.partnerLabel}>Available partners ({partners.length})</p>
                  <div className={styles.partnerRow}>
                    {partners.slice(0, 3).map(p => (
                      <div key={p._id} className={styles.partnerChip}>
                        <span className={styles.partnerAvatar}>{p.name[0]}</span>
                        <div><p>{p.name}</p><p>{p.partnerInfo?.specialty}</p></div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setShowModal(false)}>Cancel</Button>
                <Button type="submit" loading={submitting}><Send size={15} /> Submit Request</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
