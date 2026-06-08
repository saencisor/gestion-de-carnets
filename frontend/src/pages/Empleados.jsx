import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../services/api';
import styles from './Empleados.module.css';

export default function Empleados() {
  const [empleados, setEmpleados] = useState([]);
  const [carnets, setCarnets] = useState([]);
  const [busqueda, setBusqueda] = useState('');
  const [loading, setLoading] = useState(true);
  const [generando, setGenerando] = useState(null);
  const [toast, setToast] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function cargar() {
      try {
        const [resEmp, resCar] = await Promise.all([
          api.get('/empleados'),
          api.get('/carnets'),
        ]);
        setEmpleados(resEmp.data);
        setCarnets(resCar.data);
      } finally {
        setLoading(false);
      }
    }
    cargar();
  }, []);

  function carnetDeEmpleado(empleadoId) {
    return carnets.find((c) => c.empleadoId === empleadoId);
  }

  async function generarCarnet(empleado) {
    setGenerando(empleado.id);
    try {
      const fechaVencimiento = new Date(
        Date.now() + 2 * 365 * 24 * 60 * 60 * 1000
      )
        .toISOString()
        .split('T')[0];

      const { data } = await api.post('/carnets', {
        empleadoId: empleado.id,
        fechaVencimiento,
      });

      setCarnets((prev) => [...prev, data]);
      mostrarToast(`Carné ${data.codigo} generado correctamente`);
      navigate(`/carnets/${data.id}`);
    } catch (err) {
      mostrarToast(err.response?.data?.error || 'Error al generar carné');
    } finally {
      setGenerando(null);
    }
  }

  function mostrarToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(''), 3500);
  }

  const filtrados = empleados.filter(
    (e) =>
      e.nombre.toLowerCase().includes(busqueda.toLowerCase()) ||
      e.cedula.includes(busqueda) ||
      e.cargo.toLowerCase().includes(busqueda.toLowerCase())
  );

  return (
    <div className={styles.page}>
      {toast && <div className={styles.toast}>{toast}</div>}

      <div className={styles.header}>
        <div>
          <h1 className={styles.title}>Empleados</h1>
          <p className={styles.sub}>{empleados.length} registros en total</p>
        </div>
        <input
          className={styles.search}
          type="text"
          placeholder="Buscar por nombre, cédula o cargo..."
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {loading ? (
        <div className={styles.loading}>Cargando empleados...</div>
      ) : (
        <div className={styles.grid}>
          {filtrados.length === 0 ? (
            <p className={styles.empty}>No se encontraron resultados.</p>
          ) : (
            filtrados.map((emp) => {
              const carnet = carnetDeEmpleado(emp.id);
              const tieneCarnet = Boolean(carnet);
              return (
                <div key={emp.id} className={styles.card}>
                  <div className={styles.cardHeader}>
                    <img src={emp.foto} alt={emp.nombre} className={styles.foto} />
                    <div>
                      <p className={styles.nombre}>{emp.nombre}</p>
                      <p className={styles.cargo}>{emp.cargo}</p>
                      <p className={styles.depto}>{emp.departamento}</p>
                    </div>
                  </div>

                  <div className={styles.info}>
                    <InfoRow label="CC" value={emp.cedula} />
                    <InfoRow label="Email" value={emp.email} />
                    <InfoRow label="Teléfono" value={emp.telefono || '—'} />
                    <InfoRow label="Ingreso" value={emp.fechaIngreso} />
                    <InfoRow
                      label="Carné"
                      value={
                        tieneCarnet ? (
                          <span className={`${styles.badge} ${styles[`badge_${carnet.estado}`]}`}>
                            {carnet.codigo} · {carnet.estado}
                          </span>
                        ) : (
                          <span className={`${styles.badge} ${styles.badge_sin}`}>Sin carné</span>
                        )
                      }
                    />
                  </div>

                  <div className={styles.actions}>
                    {tieneCarnet ? (
                      <button
                        className={styles.btnPrimary}
                        onClick={() => navigate(`/carnets/${carnet.id}`)}
                      >
                        Ver carné
                      </button>
                    ) : (
                      <button
                        className={styles.btnSuccess}
                        onClick={() => generarCarnet(emp)}
                        disabled={generando === emp.id}
                      >
                        {generando === emp.id ? 'Generando...' : '+ Generar carné'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}
    </div>
  );
}

function InfoRow({ label, value }) {
  return (
    <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', alignItems: 'center' }}>
      <span style={{ color: 'var(--muted)', minWidth: '60px', fontWeight: 600 }}>{label}</span>
      <span style={{ color: 'var(--text)' }}>{value}</span>
    </div>
  );
}
