import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Send, ArrowLeft, X, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { consultationAPI, facilityAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import { StatusBadge } from '../../components/ui/Badge.jsx';
import styles from './ConsultationRoom.module.css';

export default function ConsultationRoom() {
  const { id } = useParams();
  const { user, token, loading: authLoading } = useAuth();
  const navigate = useNavigate();
  const bottomRef = useRef(null);
  const [consultation, setConsultation] = useState(null);
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showClose, setShowClose] = useState(false);
  const [closeForm, setCloseForm] = useState({
    closureNotes: '',
    createReferral: false,
    facilityId: '',
    referralReason: '',
    urgency: 'routine',
  });
  const [facilities, setFacilities] = useState([]);
  const [closing, setClosing] = useState(false);

  const userIdStr = String(user?.id ?? user?._id ?? '');

  const fetch = async () => {
    try {
      const [cRes, mRes] = await Promise.all([
        consultationAPI.getOne(id),
        consultationAPI.getMessages(id),
      ]);
      setConsultation(cRes.data.data.consultation);
      setMessages(mRes.data.data.messages || []);
    } catch { toast.error('Failed to load consultation'); }
    finally { setLoading(false); }
  };

  useEffect(() => {
    if (authLoading || !token) return;
    setLoading(true);
    fetch();
  }, [id, authLoading, token]);
  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);

  // Poll for new messages every 8 seconds when active
  useEffect(() => {
    if (!consultation || consultation.status !== 'active') return;
    const interval = setInterval(async () => {
      try {
        const r = await consultationAPI.getMessages(id);
        setMessages(r.data.data.messages || []);
      } catch {}
    }, 8000);
    return () => clearInterval(interval);
  }, [consultation, id]);

  useEffect(() => {
    if (!showClose) return;
    facilityAPI.getNearby({ lat: 7.9465, lng: -1.0232, radius: 500000 })
      .then((r) => setFacilities(r.data.data.facilities || []))
      .catch(() => setFacilities([]));
  }, [showClose]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!text.trim()) return;
    setSending(true);
    try {
      await consultationAPI.sendMessage(id, text.trim());
      setText('');
      const r = await consultationAPI.getMessages(id);
      setMessages(r.data.data.messages || []);
    } catch { toast.error('Failed to send message'); }
    finally { setSending(false); }
  };

  const handleAccept = async () => {
    try {
      await consultationAPI.accept(id);
      toast.success('Consultation accepted!');
      fetch();
    } catch { toast.error('Failed to accept'); }
  };

  const handleClose = async (e) => {
    e.preventDefault();
    if (closeForm.createReferral) {
      if (!closeForm.facilityId?.trim()) {
        toast.error('Select a facility for the referral');
        return;
      }
      if ((closeForm.referralReason || '').trim().length < 5) {
        toast.error('Referral reason must be at least 5 characters');
        return;
      }
    }
    const payload = {
      closureNotes: closeForm.closureNotes.trim(),
      createReferral: closeForm.createReferral,
      urgency: closeForm.urgency || 'routine',
    };
    if (closeForm.createReferral) {
      payload.facilityId = closeForm.facilityId.trim();
      payload.referralReason = closeForm.referralReason.trim();
    }
    setClosing(true);
    try {
      await consultationAPI.close(id, payload);
      toast.success('Consultation closed');
      setShowClose(false);
      setCloseForm({
        closureNotes: '',
        createReferral: false,
        facilityId: '',
        referralReason: '',
        urgency: 'routine',
      });
      fetch();
    } catch { toast.error('Failed to close consultation'); }
    finally { setClosing(false); }
  };

  const handleCancel = async () => {
    if (!confirm('Cancel this consultation?')) return;
    try {
      await consultationAPI.cancel(id);
      toast.success('Consultation cancelled');
      navigate(-1);
    } catch { toast.error('Failed to cancel'); }
  };

  if (loading) return <DashboardLayout><div className={styles.loadBox}><div className={styles.spinner} /></div></DashboardLayout>;
  if (!consultation) return <DashboardLayout><div className={styles.loadBox}><p>Consultation not found</p></div></DashboardLayout>;

  const isPartner = user?.role === 'partner';
  const canSend = consultation.status === 'active';
  const other = isPartner ? consultation.userId : consultation.partnerId;

  return (
    <DashboardLayout>
      <div className={styles.room}>
        {/* HEADER */}
        <div className={styles.roomHeader}>
          <button className={styles.backBtn} onClick={() => navigate(-1)}><ArrowLeft size={18} /></button>
          <div className={styles.otherAvatar}>{other?.name?.[0] || '?'}</div>
          <div className={styles.otherInfo}>
            <h2>{other?.name || (isPartner ? 'Patient' : 'Awaiting partner')}</h2>
            <p>{consultation.specialty} · <StatusBadge status={consultation.status} /></p>
          </div>
          <div className={styles.roomActions}>
            {isPartner && consultation.status === 'pending' && (
              <Button variant="green" size="sm" onClick={handleAccept}><CheckCircle size={14} /> Accept</Button>
            )}
            {isPartner && consultation.status === 'active' && (
              <Button size="sm" onClick={() => setShowClose(true)}>Close Consultation</Button>
            )}
            {(user?.role === 'user' || user?.role === 'admin') &&
              consultation.status !== 'closed' &&
              consultation.status !== 'cancelled' && (
              <Button variant="danger" size="sm" onClick={handleCancel}><X size={14} /> Cancel</Button>
            )}
          </div>
        </div>

        {/* CONCERN BANNER */}
        <div className={styles.concernBanner}>
          <strong>Concern:</strong> {consultation.concern}
        </div>

        {/* MESSAGES */}
        <div className={styles.messages}>
          {messages.length === 0 && (
            <div className={styles.noMessages}>
              <p>No messages yet.</p>
              <p>{isPartner
                ? (consultation.status === 'pending'
                  ? 'Accept this consultation to start messaging.'
                  : 'Send a message to begin the consultation.')
                : 'Waiting for a partner to accept your request.'}</p>
            </div>
          )}
          {messages.map((m) => {
            const sid = String(m.senderId?._id ?? m.senderId ?? '');
            const isMine = sid === userIdStr && userIdStr.length > 0;
            return (
              <div key={m._id} className={[styles.bubble, isMine ? styles.mine : styles.theirs].join(' ')}>
                <p>{m.content}</p>
                <span className={styles.bubbleTime}>{new Date(m.sentAt || m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
            );
          })}
          <div ref={bottomRef} />
        </div>

        {/* INPUT */}
        {canSend ? (
          <form className={styles.inputRow} onSubmit={handleSend}>
            <input className={styles.msgInput} placeholder="Type a message..." value={text}
              onChange={e => setText(e.target.value)} disabled={sending} />
            <button type="submit" className={styles.sendBtn} disabled={sending || !text.trim()}>
              <Send size={18} />
            </button>
          </form>
        ) : (
          <div className={styles.closedBar}>
            Consultation is {consultation.status}.
            {consultation.closureNotes && <span> Notes: {consultation.closureNotes}</span>}
          </div>
        )}
      </div>

      {/* CLOSE MODAL */}
      {showClose && (
        <div className={styles.overlay} onClick={() => setShowClose(false)}>
          <div className={styles.modal} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHead}>
              <h2>Close Consultation</h2>
              <button onClick={() => setShowClose(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleClose} className={styles.modalForm}>
              <div className={styles.field}>
                <label>Closure notes *</label>
                <textarea rows={4} required minLength={10}
                  placeholder="Summarise the consultation and any recommendations..."
                  value={closeForm.closureNotes}
                  onChange={e => setCloseForm(p => ({ ...p, closureNotes: e.target.value }))} />
              </div>
              <label className={styles.checkLabel}>
                <input type="checkbox" checked={closeForm.createReferral}
                  onChange={e => setCloseForm(p => ({ ...p, createReferral: e.target.checked }))} />
                Create a facility referral
              </label>
              {closeForm.createReferral && (
                <>
                  <div className={styles.field}>
                    <label>Facility *</label>
                    <select required={closeForm.createReferral} value={closeForm.facilityId}
                      onChange={e => setCloseForm(p => ({ ...p, facilityId: e.target.value }))}>
                      <option value="">Select a facility</option>
                      {facilities.map((f) => (
                        <option key={f._id} value={f._id}>{f.name} — {f.address?.slice(0, 40) || f.type}</option>
                      ))}
                    </select>
                  </div>
                  <div className={styles.field}>
                    <label>Referral reason *</label>
                    <textarea rows={3} required minLength={5}
                      placeholder="Why are you referring this patient?"
                      value={closeForm.referralReason}
                      onChange={e => setCloseForm(p => ({ ...p, referralReason: e.target.value }))} />
                  </div>
                  <div className={styles.field}>
                    <label>Urgency</label>
                    <select value={closeForm.urgency}
                      onChange={e => setCloseForm(p => ({ ...p, urgency: e.target.value }))}>
                      <option value="routine">Routine</option>
                      <option value="urgent">Urgent</option>
                      <option value="emergency">Emergency</option>
                    </select>
                  </div>
                </>
              )}
              <div className={styles.modalActions}>
                <Button type="button" variant="ghost" onClick={() => setShowClose(false)}>Cancel</Button>
                <Button type="submit" loading={closing}>Close Consultation</Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
