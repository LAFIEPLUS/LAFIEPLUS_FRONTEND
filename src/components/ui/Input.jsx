import styles from './Input.module.css';

export default function Input({ label, error, icon: Icon, ...props }) {
  return (
    <div className={styles.group}>
      {label && <label className={styles.label}>{label}</label>}
      <div className={styles.wrapper}>
        {Icon && <Icon className={styles.icon} size={16} />}
        <input className={[styles.input, Icon ? styles.withIcon : '', error ? styles.hasError : ''].join(' ')} {...props} />
      </div>
      {error && <p className={styles.error}>{error}</p>}
    </div>
  );
}
