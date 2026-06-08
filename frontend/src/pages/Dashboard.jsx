import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import styles from './Dashboard.module.css';

export default function Dashboard() {
  const { user } = useAuth();
  const [empleados, setEmpleados] = useState([]);
  const [carnets, setCarnets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function cargarDatos() {
      try {
        const [resEmp, resCar] = await Promise.all([
          api.get('/empleados'),
          api.get('/carnets'),
        ]);
        setEmpleados(resEmp.data);
        setCarnets(resCar.data);
      } catch (err) {
        setError('No se pudo conectar con el servidor.');
      } finally {
        setLoading(false);
      }
    }
    cargarDatos();
  }, []);

  const activos = carnets.filter((c) => c.estado === 'activo').length;
  const vencidos = carnets.filter((c) => c.estado === 'vencido').length;
  const suspendidos = carnets.filter((c) => c.estado === 'suspendido').length;

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Dashboard</h1>
          <p className={styles.welcome}>Bienvenido, <strong>{user?.username}</strong></p>
        </div>
        <Link to="/empleados" className={styles.btnPrimary}>
          + Nuevo Empleado
        </Link>
      </div>

      {error && <div className={styles.error}>{error}</div>}

      {loading ? (
        <div className={styles.loading}>Cargando datos...</div>
      ) : (
        <>
          <div className={styles.stats}>
            <StatCard icon="👥" label="Empleados" value={empleados.length} color="blue" />
            <StatCard icon="✅" label="Carnés Activos" value={activos} color="green" />
            <StatCard icon="⏰" label="Carnés Vencidos" value={vencidos} color="orange" />
            <StatCard icon="🚫" label="Suspendidos" value={suspendidos} color="red" />
          </div>

          <div className={styles.section}>
            <h2 className={styles.sectionTitle}>Empleados recientes</h2>
            <div className={styles.tableWrap}>
              <table className={styles.table}>
                <thead>
                  <tr>
                    <th>Empleado</th>
                    <th>Cargo</th>
                    <th>Departamento</th>
                    <th>Estado</th>
                    <th>Acciones</th>
                  </tr>
                </thead>
                <tbody>
                  {empleados.slice(0, 5).map((emp) => {
                    const carnet = carnets.find((c) => c.empleadoId === emp.id);
                    return (
                      <tr key={emp.id}>
                        <td>
                          <div className={styles.empCell}>
                            <img src={emp.foto} alt={emp.nombre} className={styles.avatar} />
                            <div>
                              <p className={styles.empName}>{emp.nombre}</p>
                              <p className={styles.empCedula}>CC {emp.cedula}</p>
                            </div>
                          </div>
                        </td>
                        <td>{emp.cargo}</td>
                        <td>{emp.departamento}</td>
                        <td>
                          <span className={`${styles.badge} ${carnet ? styles[`badge_${carnet.estado}`] : styles.badge_sin}`}>
                            {carnet ? carnet.estado : 'Sin carné'}
                          </span>
                        </td>
                        <td>
                          {carnet && (
                            <Link to={`/carnets/${carnet.id}`} className={styles.linkBtn}>
                              Ver carné
                            </Link>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {empleados.length > 5 && (
              <Link to="/empleados" className={styles.moreLink}>
                Ver todos los empleados →
              </Link>
            )}
          </div>
        </>
      )}
    </div>
  );
}

function StatCard({ icon, label, value, color }) {
  return (
    <div className={`${styles.statCard} ${styles[`stat_${color}`]}`}>
      <span className={styles.statIcon}>{icon}</span>
      <div>
        <p className={styles.statValue}>{value}</p>
        <p className={styles.statLabel}>{label}</p>
      </div>
    </div>
  );
}
