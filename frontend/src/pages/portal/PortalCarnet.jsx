import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import axios from 'axios';
import styles from './PortalCarnet.module.css';

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const ESTADO = {
  activo:     { label: 'ACTIVO',     cls: 'activo',     icon: '✅' },
  vencido:    { label: 'VENCIDO',    cls: 'vencido',    icon: '⏰' },
  suspendido: { label: 'SUSPENDIDO', cls: 'suspendido', icon: '🚫' },
};

export default function PortalCarnet() {
  const { cedula } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    // Usa axios directamente — sin JWT, endpoint público
    axios.get(`${BASE_URL}/portal/${cedula}`)
      .then(({ data }) => setData(data))
      .catch((err) => {
        setError(err.response?.data?.error || 'No se pudo cargar el carné.');
      })
      .finally(() => setLoading(false));
  }, [cedula]);

  if (loading) return <LoadingScreen />;
  if (error)   return <ErrorScreen mensaje={error} onVolver={() => navigate('/portal')} />;

  const { empleado, carnet } = data;
  const estado = ESTADO[carnet?.estado] || ESTADO.suspendido;
  const qrValue = `${window.location.origin}/portal/${cedula}`;

  return (
    <div className={styles.page}>
      {/* Barra superior */}
      <div className={styles.topBar}>
        <button className={styles.backBtn} onClick={() => navigate('/portal')}>
          ← Volver
        </button>
        <span className={styles.topLogo}>🎓 Colombia ESL</span>
        <button className={styles.printBtn} onClick={() => window.print()}>
          🖨️ Imprimir
        </button>
      </div>

      <div className={styles.wrapper}>
        {/* Carné digital */}
        <div className={`${styles.carnet} ${styles[`carnet_${carnet?.estado || 'suspendido'}`]}`}>

          {/* Header del carné */}
          <div className={styles.carnetHeader}>
            <div className={styles.flagStrip}>
              <span style={{ background: '#002868' }} />
              <span style={{ background: '#CE1126' }} />
              <span style={{ background: '#FCD116' }} />
            </div>
            <div className={styles.headerRow}>
              <span className={styles.orgIcon}>🎓</span>
              <div>
                <p className={styles.orgName}>COLOMBIA ESL</p>
                <p className={styles.orgSub}>Carné Digital de Empleado</p>
              </div>
              {carnet && (
                <span className={`${styles.estadoPill} ${styles[estado.cls]}`}>
                  {estado.label}
                </span>
              )}
            </div>
          </div>

          {/* Cuerpo */}
          <div className={styles.carnetBody}>
            <div className={styles.leftCol}>
              <img
                src={empleado.foto || `https://i.pravatar.cc/150?u=${cedula}`}
                alt={empleado.nombre}
                className={styles.foto}
              />
              {carnet ? (
                <div className={styles.qrBox}>
                  <QRCodeSVG value={qrValue} size={88} level="M" includeMargin={false} />
                  <p className={styles.qrLabel}>Escanear para verificar</p>
                </div>
              ) : (
                <div className={styles.sinCarnet}>Sin carné emitido</div>
              )}
            </div>

            <div className={styles.rightCol}>
              <h2 className={styles.nombre}>{empleado.nombre}</h2>
              <p className={styles.cargo}>{empleado.cargo}</p>
              <p className={styles.depto}>{empleado.departamento}</p>

              <div className={styles.divider} />

              <div className={styles.infoGrid}>
                <InfoItem label="Cédula"   value={empleado.cedula} />
                <InfoItem label="Email"    value={empleado.email} />
                <InfoItem label="Teléfono" value={empleado.telefono || '—'} />
                <InfoItem label="Ingreso"  value={empleado.fechaIngreso} />
                {carnet && <InfoItem label="Código" value={carnet.codigo} />}
              </div>
            </div>
          </div>

          {/* Footer del carné */}
          {carnet && (
            <div className={styles.carnetFooter}>
              <FooterItem label="Emisión"     value={carnet.fechaEmision} />
              <div className={styles.footerDiv} />
              <FooterItem label="Vencimiento" value={carnet.fechaVencimiento} />
              <div className={styles.footerDiv} />
              <FooterItem label="ID Carné"    value={`#${carnet.id}`} />
            </div>
          )}
        </div>

        {/* Mensaje de estado */}
        {carnet && (
          <div className={`${styles.estadoMsg} ${styles[`msg_${carnet.estado}`]}`}>
            <span>{estado.icon}</span>
            <span>
              {carnet.estado === 'activo' && 'Tu carné está vigente y es válido.'}
              {carnet.estado === 'vencido' && 'Tu carné venció el ' + carnet.fechaVencimiento + '. Contacta a RRHH para renovarlo.'}
              {carnet.estado === 'suspendido' && 'Tu carné está suspendido. Contacta a RRHH para más información.'}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div className={styles.infoItem}>
      <span className={styles.infoLabel}>{label}</span>
      <span className={styles.infoVal}>{value}</span>
    </div>
  );
}

function FooterItem({ label, value }) {
  return (
    <div>
      <span className={styles.footerLabel}>{label}</span>
      <span className={styles.footerVal}>{value}</span>
    </div>
  );
}

function LoadingScreen() {
  return (
    <div className={styles.centrado}>
      <div className={styles.spinner} />
      <p>Consultando tu carné...</p>
    </div>
  );
}

function ErrorScreen({ mensaje, onVolver }) {
  return (
    <div className={styles.centrado}>
      <span style={{ fontSize: '3rem' }}>😔</span>
      <p className={styles.errorTxt}>{mensaje}</p>
      <button className={styles.volverBtn} onClick={onVolver}>← Volver al portal</button>
    </div>
  );
}
