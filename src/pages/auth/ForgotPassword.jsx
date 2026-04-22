import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Mail, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/index.js';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import styles from './Auth.module.css';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await authAPI.forgotPassword(email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.logoMark}>
            <div className={styles.logoIcon}>+</div>
            <span><span className={styles.orange}>Lafie</span><span className={styles.green}>plus</span></span>
          </div>
          <h2 className={styles.leftTitle}>Reset your password securely.</h2>
          <p className={styles.leftDesc}>We'll send you a secure link to reset your password within minutes.</p>
        </div>
        <div className={styles.leftBg} />
      </div>
      <div className={styles.right}>
        <div className={styles.formBox}>
          {sent ? (
            <div className={styles.successBox}>
              <div className={styles.successIcon}><CheckCircle size={32} /></div>
              <h2>Check your email</h2>
              <p>We sent a password reset link to <strong>{email}</strong>. Check your inbox — it expires in 10 minutes.</p>
              <Link to="/login" style={{ display: 'block', marginTop: 24 }}>
                <Button fullWidth variant="outline">Back to Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className={styles.title}>Forgot password?</h1>
              <p className={styles.subtitle}>Enter your email and we'll send you a reset link.</p>
              <form onSubmit={handleSubmit} className={styles.form}>
                <Input label="Email address" type="email" placeholder="you@email.com"
                  icon={Mail} value={email} onChange={e => setEmail(e.target.value)} required />
                <Button type="submit" fullWidth loading={loading} size="lg">Send Reset Link</Button>
              </form>
              <p className={styles.switchText}>
                Remember it? <Link to="/login" className={styles.switchLink}>Sign in</Link>
              </p>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
