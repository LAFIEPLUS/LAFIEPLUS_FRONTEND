import { useState, useRef } from 'react';
import { User, Mail, Phone, Camera, Lock, Eye, EyeOff, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI, authAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import Input from '../../components/ui/Input.jsx';
import styles from './Profile.module.css';

export default function Profile() {
    const { user, updateUser } = useAuth();
    const fileRef = useRef();

    const [form, setForm] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        healthProfile: {
            age: user?.healthProfile?.age || '',
            gender: user?.healthProfile?.gender || '',
            maternalStatus: user?.healthProfile?.maternalStatus || 'none',
        },
    });
    const [saving, setSaving] = useState(false);
    const [uploading, setUploading] = useState(false);

    const [pwForm, setPwForm] = useState({ currentPassword: '', newPassword: '', confirm: '' });
    const [showPw, setShowPw] = useState(false);
    const [savingPw, setSavingPw] = useState(false);

    const set = (k) => (e) => setForm(p => ({ ...p, [k]: e.target.value }));
    const setHealth = (k) => (e) => setForm(p => ({ ...p, healthProfile: { ...p.healthProfile, [k]: e.target.value } }));

    const handleSave = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await userAPI.updateProfile(form);
            updateUser(res.data.data.user);
            toast.success('Profile updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Update failed');
        } finally { setSaving(false); }
    };

    const handleAvatar = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setUploading(true);
        try {
            const fd = new FormData();
            fd.append('avatar', file);
            const res = await userAPI.uploadAvatar(fd);
            updateUser({ avatar: res.data.data.avatar });
            toast.success('Avatar updated!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Upload failed');
        } finally { setUploading(false); }
    };

    const handlePassword = async (e) => {
        e.preventDefault();
        if (pwForm.newPassword !== pwForm.confirm) { toast.error('Passwords do not match'); return; }
        if (pwForm.newPassword.length < 6) { toast.error('Password must be at least 6 characters'); return; }
        setSavingPw(true);
        try {
            await authAPI.forgotPassword(user?.email);
            toast.success('Password reset link sent to your email');
            setPwForm({ currentPassword: '', newPassword: '', confirm: '' });
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed');
        } finally { setSavingPw(false); }
    };

    return (
        <DashboardLayout>
            <div className={styles.page}>
                <div className={styles.header}>
                    <h1 className={styles.title}>My Profile</h1>
                    <p className={styles.subtitle}>Manage your personal information and health details.</p>
                </div>

                <div className={styles.grid}>
                    {/* AVATAR */}
                    <Card className={styles.avatarCard}>
                        <div className={styles.avatarWrap}>
                            <div className={styles.avatar}>
                                {user?.avatar?.url
                                    ? <img src={user.avatar.url} alt={user.name} />
                                    : <span>{user?.name?.[0]?.toUpperCase()}</span>
                                }
                                <button className={styles.avatarBtn} onClick={() => fileRef.current.click()} disabled={uploading}>
                                    {uploading ? <div className={styles.spin} /> : <Camera size={14} />}
                                </button>
                            </div>
                            <input ref={fileRef} type="file" accept="image/*" hidden onChange={handleAvatar} />
                            <h2 className={styles.avatarName}>{user?.name}</h2>
                            <p className={styles.avatarRole}>{user?.role}</p>
                            <p className={styles.avatarEmail}>{user?.email || user?.phone}</p>
                        </div>
                    </Card>

                    {/* PERSONAL INFO */}
                    <Card className={styles.mainCard}>
                        <h2 className={styles.sectionTitle}><User size={16} /> Personal Information</h2>
                        <form onSubmit={handleSave} className={styles.form}>
                            <Input label="Full Name" value={form.name} onChange={set('name')} icon={User} />
                            <Input label="Email" value={user?.email || ''} icon={Mail} disabled />
                            <Input label="Phone Number" value={form.phone} onChange={set('phone')} icon={Phone} placeholder="+233 XX XXX XXXX" />

                            <div className={styles.divider} />
                            <h3 className={styles.subTitle}>Health Profile</h3>

                            <div className={styles.row}>
                                <div className={styles.field}>
                                    <label>Age</label>
                                    <input type="number" min="0" max="120" value={form.healthProfile.age}
                                        onChange={setHealth('age')} placeholder="Your age" />
                                </div>
                                <div className={styles.field}>
                                    <label>Gender</label>
                                    <select value={form.healthProfile.gender} onChange={setHealth('gender')}>
                                        <option value="">Select</option>
                                        <option value="male">Male</option>
                                        <option value="female">Female</option>
                                        <option value="other">Other</option>
                                        <option value="Prefer not to say">Prefer not to say</option>
                                    </select>
                                </div>
                            </div>

                            {(form.healthProfile.gender === 'female' || user?.healthProfile?.gender === 'female') && (
                                <div className={styles.field}>
                                    <label>Maternal Status</label>
                                    <select value={form.healthProfile.maternalStatus} onChange={setHealth('maternalStatus')}>
                                        <option value="none">Not applicable</option>
                                        <option value="pregnant">Pregnant</option>
                                        <option value="postnatal">Postnatal</option>
                                    </select>
                                </div>
                            )}

                            <Button type="submit" loading={saving} className={styles.saveBtn}>
                                <Save size={15} /> Save Changes
                            </Button>
                        </form>
                    </Card>

                    {/* CHANGE PASSWORD */}
                    <Card>
                        <h2 className={styles.sectionTitle}><Lock size={16} /> Change Password</h2>
                        <p className={styles.pwNote}>We'll send a password reset link to your email address.</p>
                        <Button variant="outline" loading={savingPw}
                            onClick={() => {
                                setSavingPw(true);
                                authAPI.forgotPassword(user?.email)
                                    .then(() => toast.success('Reset link sent to ' + user?.email))
                                    .catch(() => toast.error('Failed to send reset link'))
                                    .finally(() => setSavingPw(false));
                            }}>
                            Send Password Reset Email
                        </Button>
                    </Card>
                </div>
            </div>
        </DashboardLayout>
    );
}