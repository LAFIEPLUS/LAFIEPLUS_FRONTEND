import { useState } from 'react';
import { Bell, Shield, Eye, Save } from 'lucide-react';
import toast from 'react-hot-toast';
import { userAPI } from '../../api/index.js';
import { useAuth } from '../../context/AuthContext.jsx';
import DashboardLayout from '../../components/layout/DashboardLayout.jsx';
import Card from '../../components/ui/Card.jsx';
import Button from '../../components/ui/Button.jsx';
import styles from './Settings.module.css';

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [privacy, setPrivacy] = useState({
    shareAnonymousData: user?.privacySettings?.shareAnonymousData || false,
    receivePromotionalEmails: user?.privacySettings?.receivePromotionalEmails ?? true,
  });
  const [saving, setSaving] = useState(false);

  const toggle = (k) => setPrivacy(p => ({ ...p, [k]: !p[k] }));

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await userAPI.updateProfile({ privacySettings: privacy });
      updateUser(res.data.data.user);
      toast.success('Settings saved!');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to save');
    } finally { setSaving(false); }
  };

  return (
    <DashboardLayout>
      <div className={styles.page}>
        <div className={styles.header}>
          <h1 className={styles.title}>Settings</h1>
          <p className={styles.subtitle}>Manage your notification and privacy preferences.</p>
        </div>

        <div className={styles.grid}>
          {/* NOTIFICATIONS */}
          <Card>
            <h2 className={styles.sectionTitle}><Bell size={16} /> Notifications</h2>
            <div className={styles.settingRow}>
              <div>
                <p className={styles.settingLabel}>Promotional Emails</p>
                <p className={styles.settingDesc}>Receive health tips, updates and platform news via email.</p>
              </div>
              <button
                className={[styles.toggle, privacy.receivePromotionalEmails ? styles.on : styles.off].join(' ')}
                onClick={() => toggle('receivePromotionalEmails')}>
                <span className={styles.thumb} />
              </button>
            </div>
          </Card>

          {/* PRIVACY */}
          <Card>
            <h2 className={styles.sectionTitle}><Shield size={16} /> Privacy</h2>
            <div className={styles.settingRow}>
              <div>
                <p className={styles.settingLabel}>Share Anonymous Data</p>
                <p className={styles.settingDesc}>Help improve Lafieplus by sharing anonymised usage data for research. No personal information is ever shared.</p>
              </div>
              <button
                className={[styles.toggle, privacy.shareAnonymousData ? styles.on : styles.off].join(' ')}
                onClick={() => toggle('shareAnonymousData')}>
                <span className={styles.thumb} />
              </button>
            </div>
          </Card>

          {/* ACCOUNT INFO */}
          <Card>
            <h2 className={styles.sectionTitle}><Eye size={16} /> Account</h2>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Account ID</span>
              <span className={styles.infoValue}>{user?._id || user?.id}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Role</span>
              <span className={styles.infoValue} style={{ textTransform: 'capitalize' }}>{user?.role}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Member since</span>
              <span className={styles.infoValue}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span>
            </div>
            <div className={styles.infoRow}>
              <span className={styles.infoLabel}>Status</span>
              <span className={[styles.infoValue, styles.active].join(' ')}>Active</span>
            </div>
          </Card>
        </div>

        <Button onClick={handleSave} loading={saving} className={styles.saveBtn}>
          <Save size={15} /> Save Settings
        </Button>
      </div>
    </DashboardLayout>
  );
}