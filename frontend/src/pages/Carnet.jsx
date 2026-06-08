import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import styles from './Carnet.module.css';

export default function Carnet() {
  const { id } = useParams();
  const [carnet, setCarnet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const printRef = useRef();

  useEffect(() => {
    api.get(`/carnets/${id}`)
      .then(({ data }) => setCarnet(data))
      .catch(() => setError('Carné no encontrado.'))
      .finally(() => setLoading(false));
  }, [id]);

  function handlePrint() {
    window.print();
  }

  if (loading) return <div className={styles.center}>Cargando carné...</div>;
  if (error)   return (
    <div className={styles.center}>
      <p className={styles.error}>{error}</p>
      <Link to="/empleados" className={styles.backBtn}>← Volver</Link>
    </div>
  );

  const { empleado } = carnet;
  const qrValue = `${window.location.origin}/validar/${carnet.id}`;
  const isActivo = carnet.estado === 'activo';

  return (
    <div className={styles.page}>
      <div className={styles.toolbar}>
        <Link to="/empleados" className={styles.backLink}>← Volver a empleados</Link>
        <button className={styles.printBtn} onClick={handlePrint}>
          🖨️ Imprimir
        </button>
      </div>

      <div className={styles.carnetWrap} ref={printRef}>
        {/* CARNÉ */}
        <div className={`${styles.carnet} ${!isActivo ? styles.carnetInactivo : ''}`}>

          {/* Encabezado */}
          <div className={styles.carnetHeader}>
            <div className={styles.flagStrip}>
              <span style={{ background: '#002868' }} />
              <span style={{ background: '#CE1126' }} />
              <span style={{ background: '#FCD116' }} />
            </div>
            <div className={styles.headerContent}>
              <span className={styles.orgIcon}>🎓</span>
              <div>
                <p className={styles.orgName}>COLOMBIA ESL</p>
                <p className={styles.orgTagline}>Carné Digital de Empleado</p>
              </div>
              <span className={`${styles.estadoBadge} ${styles[`estado_${carnet.estado}`]}`}>
                {carnet.estado.toUpperCase()}
              </span>
            </div>
          </div>

          {/* Cuerpo */}
          <div className={styles.carnetBody}>
            {/* Foto + QR */}
            <div className={styles.carnetLeft}>
              <img
                src={empleado?.foto || `https://i.pravatar.cc/150?u=${carnet.empleadoId}`}
                alt={empleado?.nombre}
                className={styles.empFoto}
              />
              <div className={styles.qrWrap}>
                <QRCodeSVG
                  value={qrValue}
                  size={90}
                  level="M"
                  includeMargin={false}
                />
                <p className={styles.qrLabel}>Escanear para validar</p>
              </div>
            </div>

            {/* Info */}
            <div className={styles.carnetRight}>
              <h2 className={styles.empNombre}>{empleado?.nombre}</h2>
              <p className={styles.empCargo}>{empleado?.cargo}</p>
              <p className={styles.empDepto}>{empleado?.departamento}</p>

              <div className={styles.separator} />

              <div className={styles.dataGrid}>
                <DataItem label="Cédula" value={empleado?.cedula} />
                <DataItem label="Código" value={carnet.codigo} />
                <DataItem label="Email"  value={empleado?.email} />
                <DataItem label="Teléfono" value={empleado?.telefono || '—'} />
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className={styles.carnetFooter}>
            <div>
              <span className={styles.footerLabel}>Emisión</span>
              <span className={styles.footerVal}>{carnet.fechaEmision}</span>
            </div>
            <div className={styles.footerDivider} />
            <div>
              <span className={styles.footerLabel}>Vencimiento</span>
              <span className={styles.footerVal}>{carnet.fechaVencimiento}</span>
            </div>
            <div className={styles.footerDivider} />
            <div>
              <span className={styles.footerLabel}>ID</span>
              <span className={styles.footerVal}>#{carnet.id}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function DataItem({ label, value }) {
  return (
    <div className={styles.dataItem}>
      <span className={styles.dataLabel}>{label}</span>
      <span className={styles.dataVal}>{value}</span>
    </div>
  );
}
