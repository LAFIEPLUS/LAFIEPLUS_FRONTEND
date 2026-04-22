import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { User, Mail, Phone, Lock } from 'lucide-react';
import toast from 'react-hot-toast';
import { authAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import styles from './Auth.module.css';

export default function Register() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', phone: '', password: '', role: 'user' });
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { name: form.name, password: form.password, role: form.role };
      if (form.email) payload.email = form.email;
      if (form.phone) payload.phone = form.phone;
      if (!form.email && !form.phone) { toast.error('Provide email or phone'); setLoading(false); return; }

      const res = await authAPI.register(payload);
      const { token, user } = res.data.data;
      login(token, user);
      toast.success('Account created! Welcome to Lafieplus.');
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
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
          <h2 className={styles.leftTitle}>Join thousands accessing better health.</h2>
          <p className={styles.leftDesc}>Create your free account and start your health journey today.</p>
          <div className={styles.leftFeatures}>
            {['Free to sign up', 'AI-powered symptom analysis', 'Trusted health information'].map(f => (
              <div key={f} className={styles.leftFeature}><span className={styles.tick}>✓</span>{f}</div>
            ))}
          </div>
        </div>
        <div className={styles.leftBg} />
      </div>

      <div className={styles.right}>
        <div className={styles.formBox}>
          <h1 className={styles.title}>Create account</h1>
          <p className={styles.subtitle}>Fill in your details to get started.</p>

          <form onSubmit={handleSubmit} className={styles.form}>
            <Input label="Full name" placeholder="Ama Mensah" icon={User} value={form.name} onChange={set('name')} required />
            <Input label="Email address" type="email" placeholder="you@email.com" icon={Mail} value={form.email} onChange={set('email')} />
            <Input label="Phone number" placeholder="+233 20 000 0000" icon={Phone} value={form.phone} onChange={set('phone')} />
            <p className={styles.hint}>Provide at least one of email or phone.</p>
            <Input label="Password" type="password" placeholder="Min. 6 characters" icon={Lock} value={form.password} onChange={set('password')} required />

            <div className={styles.roleSelect}>
              <label className={styles.roleLabel}>I am a</label>
              <div className={styles.roleBtns}>
                {['user', 'partner'].map(r => (
                  <button key={r} type="button"
                    className={[styles.roleBtn, form.role === r ? styles.roleActive : ''].join(' ')}
                    onClick={() => setForm(p => ({ ...p, role: r }))}>
                    {r === 'user' ? '🙋 Patient / User' : '🩺 Health Partner'}
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" fullWidth loading={loading} size="lg">Create Account</Button>
          </form>

          <p className={styles.switchText}>
            Already have an account? <Link to="/login" className={styles.switchLink}>Sign in</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
