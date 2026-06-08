import { NavLink, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import styles from './Layout.module.css';

const navItems = [
  { to: '/dashboard', icon: '🏠', label: 'Dashboard' },
  { to: '/empleados', icon: '👥', label: 'Empleados' },
  { to: '/validar', icon: '🔍', label: 'Validar Carné' },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate('/login');
  }

  return (
    <div className={styles.shell}>
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandIcon}>🎓</span>
          <div>
            <p className={styles.brandName}>Colombia ESL</p>
            <p className={styles.brandSub}>Carnés Digitales</p>
          </div>
        </div>

        <nav className={styles.nav}>
          {navItems.map(({ to, icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`
              }
            >
              <span className={styles.navIcon}>{icon}</span>
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className={styles.sidebarFooter}>
          <div className={styles.userInfo}>
            <span className={styles.avatar}>{user?.username?.[0]?.toUpperCase()}</span>
            <div>
              <p className={styles.userName}>{user?.username}</p>
              <p className={styles.userRole}>{user?.rol}</p>
            </div>
          </div>
          <button className={styles.logoutBtn} onClick={handleLogout}>
            Salir
          </button>
        </div>
      </aside>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
}
