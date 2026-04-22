import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, ChevronDown, LogOut, User, Settings } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import NotificationBell from './NotificationBell.jsx';
import styles from './Navbar.module.css';

export default function Navbar({ onMenuToggle }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [dropOpen, setDropOpen] = useState(false);
  const dropRef = useRef();

  const handleLogout = async () => {
    setDropOpen(false);
    await logout();
    navigate('/login');
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e) => {
      if (dropRef.current && !dropRef.current.contains(e.target)) setDropOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const dashPath = user?.role === 'admin' ? '/admin' : user?.role === 'partner' ? '/partner' : '/dashboard';

  return (
    <header className={styles.navbar}>
      <div className={styles.left}>
        <button className={styles.menuBtn} onClick={onMenuToggle}>
          <Menu size={22} />
        </button>
        <Link to={dashPath} className={styles.logo}>
          <div className={styles.logoIcon}><span>+</span></div>
          <span className={styles.logoText}>
            <span className={styles.logoOrange}>Lafie</span>
            <span className={styles.logoGreen}>plus</span>
          </span>
        </Link>
      </div>

      <div className={styles.right}>
        <NotificationBell />

        <div className={styles.userMenu} ref={dropRef}>
          <button className={styles.userBtn} onClick={() => setDropOpen(!dropOpen)}>
            <div className={styles.avatar}>
              {user?.avatar?.url
                ? <img src={user.avatar.url} alt={user.name} />
                : <span>{user?.name?.[0]?.toUpperCase()}</span>
              }
            </div>
            <div className={styles.userInfo}>
              <span className={styles.userName}>{user?.name}</span>
              <span className={styles.userRole}>{user?.role}</span>
            </div>
            <ChevronDown size={14} className={dropOpen ? styles.chevronOpen : ''} />
          </button>

          {dropOpen && (
            <div className={styles.dropdown}>
              <Link to="/profile" className={styles.dropItem} onClick={() => setDropOpen(false)}>
                <User size={15} /> Profile
              </Link>
              <Link to="/settings" className={styles.dropItem} onClick={() => setDropOpen(false)}>
                <Settings size={15} /> Settings
              </Link>
              <hr className={styles.divider} />
              <button className={`${styles.dropItem} ${styles.dropLogout}`} onClick={handleLogout}>
                <LogOut size={15} /> Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
