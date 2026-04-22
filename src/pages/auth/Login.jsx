import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import styles from './Auth.module.css';

export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPw, setShowPw] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await authAPI.login(form);
      console.log("FULL RESPONSE:", res.data);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success(`Welcome back, ${user.name}!`);
      const path = user.role === 'admin' ? '/admin' : user.role === 'partner' ? '/partner' : '/dashboard';
      navigate(path);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
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
          <h2 className={styles.leftTitle}>Your health,<br />our priority.</h2>
          <p className={styles.leftDesc}>AI-assisted guidance, expert consultations and trusted health resources — available 24/7.</p>
          <div className={styles.leftFeatures}>
            {['Symptom checker & AI guidance', 'Connect with health partners', 'Find facilities near you'].map(f => (
              <div key={f} className={styles.leftFeature}>
                <span className={styles.tick}>✓</span>{f}
              </div>
            ))}
          </div>
        </div>
        <div className={styles.leftBg} />
      </div>

      <div className={styles.right}>
        <div className={styles.formBox}>
          <h1 className={styles.title}>Sign in</h1>
          <p className={styles.subtitle}>Welcome back — enter your details to continue.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input label="Email address" type="email" placeholder="you@email.com" icon={Mail}
              value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} required />
            <div className={styles.pwGroup}>
              <Input label="Password" type={showPw ? 'text' : 'password'} placeholder="Your password" icon={Lock}
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} required />
              <button type="button" className={styles.pwToggle} onClick={() => setShowPw(!showPw)}>
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
            <div className={styles.forgot}>
              <Link to="/forgot-password">Forgot password?</Link>
            </div>
            <Button type="submit" fullWidth loading={loading} size="lg">Sign In</Button>
          </form>

          <p className={styles.switchText}>
            Don't have an account? <Link to="/register" className={styles.switchLink}>Create one</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
