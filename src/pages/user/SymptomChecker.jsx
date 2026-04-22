import { useState } from 'react';
import { Building2, MessageSquare } from 'lucide-react';
import { Activity, Plus, X, AlertTriangle, CheckCircle, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import { symptomAPI } from '../../api/index.js';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Button from '../../components/ui/Button.jsx';
import Card from '../../components/ui/Card.jsx';
import { RiskBadge } from '../../components/ui/Badge.jsx';
import styles from './SymptomChecker.module.css';

const commonSymptoms = ['Headache', 'Fever', 'Cough', 'Fatigue', 'Nausea', 'Vomiting', 'Diarrhoea', 'Chest pain', 'Shortness of breath', 'Abdominal pain', 'Back pain', 'Dizziness', 'Rash', 'Sore throat', 'Loss of appetite'];

const riskConfig = {
  low:       { color: '#3A7D0A', bg: '#EDF7E3', icon: CheckCircle, label: 'Low Risk' },
  moderate:  { color: '#D97706', bg: '#FEF3C7', icon: AlertTriangle, label: 'Moderate Risk' },
  high:      { color: '#DC2626', bg: '#FEE2E2', icon: AlertTriangle, label: 'High Risk' },
  emergency: { color: '#7C3AED', bg: '#EDE9FE', icon: AlertTriangle, label: 'Emergency' },
};

export default function SymptomChecker() {
  const [symptoms, setSymptoms] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const addSymptom = (s) => {
    const trimmed = s.trim();
    if (!trimmed || symptoms.includes(trimmed)) return;
    setSymptoms(p => [...p, trimmed]);
    setInput('');
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') { e.preventDefault(); addSymptom(input); }
    if (e.key === ',' && input) { e.preventDefault(); addSymptom(input.replace(',', '')); }
  };

  const remove = (s) => setSymptoms(p => p.filter(x => x !== s));

  const handleCheck = async () => {
    if (symptoms.length === 0) { toast.error('Add at least one symptom'); return; }
    setLoading(true);
    try {
      const res = await symptomAPI.check(symptoms);
      const data = res.data?.data || {};
      setResult({
        sessionId: data.sessionId,
        riskLevel: data.riskLevel,
        summary: data.summary,
        nextSteps: data.nextSteps || [],
        preventiveTips: data.preventiveTips || [],
        seekCareImmediately: !!data.seekCareImmediately,
        recommendConsultation: !!data.recommendConsultation,
        symptoms: [...symptoms],
      });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Check failed');
    } finally {
      setLoading(false);
    }
  };

  const reset = () => { setResult(null); setSymptoms([]); };
  const cfg = result ? (riskConfig[result.riskLevel] || riskConfig.moderate) : null;

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <div className={styles.headerIcon}><Activity size={22} /></div>
          <div>
            <h1 className={styles.title}>Symptom Checker</h1>
            <p className={styles.subtitle}>Enter your symptoms for AI-powered health guidance.</p>
          </div>
        </div>

        {!result ? (
          <div className={styles.checkerGrid}>
            <Card className={styles.mainCard}>
              <h2 className={styles.sectionTitle}>What are you experiencing?</h2>
              <div className={styles.inputRow}>
                <input className={styles.symptomInput} value={input}
                  onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                  placeholder="Type a symptom and press Enter..." />
                <button className={styles.addBtn} onClick={() => addSymptom(input)}>
                  <Plus size={18} />
                </button>
              </div>

              {symptoms.length > 0 && (
                <div className={styles.tags}>
                  {symptoms.map(s => (
                    <span key={s} className={styles.tag}>
                      {s}
                      <button onClick={() => remove(s)}><X size={12} /></button>
                    </span>
                  ))}
                </div>
              )}

              <Button onClick={handleCheck} loading={loading} fullWidth size="lg"
                className={styles.checkBtn} disabled={symptoms.length === 0}>
                <Activity size={18} /> Analyse Symptoms
              </Button>

              {symptoms.length === 0 && (
                <p className={styles.hint}>Add symptoms above or pick from common ones →</p>
              )}
            </Card>

            <Card className={styles.suggestCard}>
              <h2 className={styles.sectionTitle}>Common symptoms</h2>
              <div className={styles.suggestions}>
                {commonSymptoms.map(s => (
                  <button key={s}
                    className={[styles.suggestion, symptoms.includes(s) ? styles.selected : ''].join(' ')}
                    onClick={() => symptoms.includes(s) ? remove(s) : setSymptoms(p => [...p, s])}>
                    {symptoms.includes(s) && <X size={11} />}
                    {s}
                  </button>
                ))}
              </div>
            </Card>
          </div>
        ) : (
          <div className={styles.resultBox} style={{ '--risk-color': cfg.color, '--risk-bg': cfg.bg }}>
            <Card className={styles.resultCard}>
              <div className={styles.resultHeader} style={{ background: cfg.bg }}>
                <cfg.icon size={32} style={{ color: cfg.color }} />
                <div>
                  <RiskBadge level={result.riskLevel} />
                  <h2 className={styles.resultTitle} style={{ color: cfg.color }}>{cfg.label}</h2>
                </div>
              </div>

              <div className={styles.resultBody}>
                <div className={styles.symptomsChecked}>
                  <p className={styles.resultLabel}>Symptoms analysed</p>
                  <div className={styles.tags}>
                    {result.symptoms.map(s => <span key={s} className={styles.tagChecked}>{s}</span>)}
                  </div>
                </div>

                <div className={styles.resultSection}>
                  <p className={styles.resultLabel}>Summary</p>
                  <p className={styles.resultSummary}>{result.summary}</p>
                </div>

                {result.nextSteps?.length > 0 && (
                  <div className={styles.resultSection}>
                    <p className={styles.resultLabel}>Recommended next steps</p>
                    <ul className={styles.stepList}>
                      {result.nextSteps.map((s, i) => (
                        <li key={i}><span className={styles.stepNum}>{i + 1}</span>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.preventiveTips?.length > 0 && (
                  <div className={styles.resultSection}>
                    <p className={styles.resultLabel}>Preventive tips</p>
                    <ul className={styles.tipList}>
                      {result.preventiveTips.map((t, i) => (
                        <li key={i}><CheckCircle size={14} />{t}</li>
                      ))}
                    </ul>
                  </div>
                )}

                {result.seekCareImmediately && (
                  <div className={styles.emergencyAlert}>
                    <AlertTriangle size={18} /> Seek emergency care immediately!
                  </div>
                )}

                <div className={styles.resultActions}>
                  <Button variant="outline" onClick={reset}>Check Again</Button>
                  <Link to="/facilities">
                    <Button variant="green"><Building2 size={16} /> Find Facility <ArrowRight size={14} /></Button>
                  </Link>
                  <Link to="/consultations">
                    <Button><MessageSquare size={16} /> Talk to Partner <ArrowRight size={14} /></Button>
                  </Link>
                </div>
              </div>
            </Card>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
