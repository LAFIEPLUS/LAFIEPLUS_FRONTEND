import { useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Lock, Eye, EyeOff, CheckCircle, AlertCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import styles from './Auth.module.css';

export default function ResetPassword() {
  const { token: paramToken } = useParams();
  const [searchParams] = useSearchParams();
  const token = paramToken || searchParams.get('token') || '';

  const { login } = useAuth();
  const navigate = useNavigate();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }
    if (password !== confirm) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);
    try {
      const res = await authAPI.resetPassword(token, { password });
      const authToken = res.data?.data?.token;

      if (authToken) {
        try {
          localStorage.setItem('lafieplus_token', authToken);
          const me = await authAPI.getMe();
          const user = me.data?.data?.user;
          if (user) {
            login(authToken, user);
            toast.success('Password reset successful!');
            const path = user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard';
            navigate(path);
            return;
          }
          localStorage.removeItem('lafieplus_token');
        } catch {
          localStorage.removeItem('lafieplus_token');
        }
      }

      setDone(true);
      toast.success('Password reset successful!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired reset link. Please request a new one.');
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className={styles.page}>
        <div className={styles.left}>
          <div className={styles.leftContent}>
            <div className={styles.logoMark}>
              <div className={styles.logoIcon}>+</div>
              <span><span className={styles.orange}>Lafie</span><span className={styles.green}>plus</span></span>
            </div>
            <h2 className={styles.leftTitle}>Reset your password securely.</h2>
            <p className={styles.leftDesc}>Use the link from your email to set a new password.</p>
          </div>
          <div className={styles.leftBg} />
        </div>
        <div className={styles.right}>
          <div className={styles.formBox}>
            <div className={styles.successBox}>
              <div className={styles.successIcon} style={{ color: '#DC2626' }}><AlertCircle size={32} /></div>
              <h2>Invalid reset link</h2>
              <p>This password reset link is missing or invalid. Request a new one to continue.</p>
              <Link to="/forgot-password" style={{ display: 'block', marginTop: 24 }}>
                <Button fullWidth>Request new link</Button>
              </Link>
              <Link to="/login" style={{ display: 'block', marginTop: 12 }}>
                <Button fullWidth variant="outline">Back to Sign In</Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <div className={styles.left}>
        <div className={styles.leftContent}>
          <div className={styles.logoMark}>
            <div className={styles.logoIcon}>+</div>
            <span><span className={styles.orange}>Lafie</span><span className={styles.green}>plus</span></span>
          </div>
          <h2 className={styles.leftTitle}>Choose a new password.</h2>
          <p className={styles.leftDesc}>Pick something strong and unique — you'll use it to sign in next time.</p>
        </div>
        <div className={styles.leftBg} />
      </div>

      <div className={styles.right}>
        <div className={styles.formBox}>
          {done ? (
            <div className={styles.successBox}>
              <div className={styles.successIcon}><CheckCircle size={32} /></div>
              <h2>Password updated</h2>
              <p>Your password has been reset successfully. You can now sign in with your new password.</p>
              <Link to="/login" style={{ display: 'block', marginTop: 24 }}>
                <Button fullWidth>Sign In</Button>
              </Link>
            </div>
          ) : (
            <>
              <h1 className={styles.title}>Reset password</h1>
              <p className={styles.subtitle}>Enter your new password below.</p>

              <form onSubmit={handleSubmit} className={styles.form}>
                <div className={styles.pwGroup}>
                  <Input
                    label="New password"
                    type={showPw ? 'text' : 'password'}
                    placeholder="Min. 6 characters"
                    icon={Lock}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" className={styles.pwToggle} onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <div className={styles.pwGroup}>
                  <Input
                    label="Confirm password"
                    type={showConfirm ? 'text' : 'password'}
                    placeholder="Re-enter password"
                    icon={Lock}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    required
                    minLength={6}
                  />
                  <button type="button" className={styles.pwToggle} onClick={() => setShowConfirm(!showConfirm)}>
                    {showConfirm ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>

                <Button type="submit" fullWidth loading={loading} size="lg">Reset Password</Button>
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
