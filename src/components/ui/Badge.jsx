import styles from './Badge.module.css';

export default function Badge({ children, variant = 'default', className = '' }) {
  return (
    <span className={[styles.badge, styles[variant], className].join(' ')}>
      {children}
    </span>
  );
}

export function RiskBadge({ level }) {
  const map = {
    low: { label: 'Low Risk', variant: 'low' },
    moderate: { label: 'Moderate', variant: 'moderate' },
    high: { label: 'High Risk', variant: 'high' },
    emergency: { label: 'Emergency', variant: 'emergency' },
  };
  const { label, variant } = map[level] || { label: level, variant: 'default' };
  return <Badge variant={variant}>{label}</Badge>;
}

export function StatusBadge({ status }) {
  const map = {
    pending: 'warning',
    active: 'success',
    closed: 'default',
    cancelled: 'danger',
    accepted: 'success',
    completed: 'success',
    published: 'success',
    draft: 'warning',
    archived: 'default',
  };
  return <Badge variant={map[status] || 'default'}>{status}</Badge>;
}
