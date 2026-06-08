import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { QRCodeSVG } from 'qrcode.react';
import api from '../services/api';
import styles from './Validar.module.css';

const ESTADO_META = {
  activo:     { color: styles.resultActivo,    icon: '✅', titulo: 'Carné Válido',     desc: 'Este carné está activo y es válido.' },
  vencido:    { color: styles.resultVencido,   icon: '⏰', titulo: 'Carné Vencido',    desc: 'Este carné ha superado su fecha de vencimiento.' },
  suspendido: { color: styles.resultSuspendido,icon: '🚫', titulo: 'Carné Suspendido', desc: 'Este carné fue suspendido y no es válido.' },
};

export default function Validar() {
  // Cuando el QR apunta a /validar/:id, el param llega aquí directamente
  const { id: paramId } = useParams();
  const [input, setInput] = useState(paramId || '');
  const [resultado, setResultado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Si hay ID en la URL (desde QR), validar automáticamente al montar
  useEffect(() => {
    if (paramId) buscarCarnet(paramId);
  }, [paramId]);

  async function buscarCarnet(valor) {
    setLoading(true);
    setError('');
    setResultado(null);

    try {
      const idNumerico = parseInt(valor, 10);

      if (!isNaN(idNumerico)) {
        // Busca directamente por ID → GET /api/carnets/:id
        const { data } = await api.get(`/carnets/${idNumerico}`);
        setResultado(data);
      } else {
        // Busca por código (ej: ESL-2024-001) → GET /api/carnets y filtra
        const { data: carnets } = await api.get('/carnets');
        const carnet = carnets.find(
          (c) => c.codigo?.toLowerCase() === valor.trim().toLowerCase()
        );
        if (!carnet) throw new Error('not_found');
        setResultado(carnet);
      }
    } catch (err) {
      if (err.response?.status === 404 || err.message === 'not_found') {
        setError('No se encontró ningún carné con ese código o ID.');
      } else {
        setError('Error al conectar con el servidor.');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!input.trim()) return;
    buscarCarnet(input.trim());
  }

  return (
    <div className={styles.page}>
      <div className={styles.header}>
        <h1 className={styles.title}>Validar Carné</h1>
        <p className={styles.sub}>
          Ingresa el ID numérico o el código del carné (ej: ESL-2024-001).
        </p>
      </div>

      <div className={styles.card}>
        <form className={styles.form} onSubmit={handleSubmit}>
          <input
            className={styles.input}
            type="text"
            placeholder="Ej: 2 o ESL-2024-001"
            value={input}
            onChange={(e) => { setInput(e.target.value); setError(''); }}
          />
          <button className={styles.btn} type="submit" disabled={loading || !input.trim()}>
            {loading ? 'Buscando...' : 'Validar'}
          </button>
        </form>

        {error && (
          <div className={styles.errorMsg}>
            <span>❌</span> {error}
          </div>
        )}

        {resultado && <ResultadoCarnet carnet={resultado} />}
      </div>

      <div className={styles.help}>
        <p>
          💡 Escanea el QR del carné digital para validarlo automáticamente
          (redirige a <code>/validar/:id</code>).
        </p>
      </div>
    </div>
  );
}

function ResultadoCarnet({ carnet }) {
  const meta = ESTADO_META[carnet.estado] || ESTADO_META.suspendido;
  const qrValue = `${window.location.origin}/validar/${carnet.id}`;

  return (
    <div className={`${styles.result} ${meta.color}`}>
      <div className={styles.resultTop}>
        <span className={styles.resultIcon}>{meta.icon}</span>
        <div>
          <p className={styles.resultTitulo}>{meta.titulo}</p>
          <p className={styles.resultDesc}>{meta.desc}</p>
        </div>
      </div>

      <div className={styles.resultBody}>
        <div className={styles.resultInfo}>
          <ResultRow label="Código"       value={carnet.codigo} />
          <ResultRow label="Titular"      value={carnet.empleado?.nombre || '—'} />
          <ResultRow label="Cargo"        value={carnet.empleado?.cargo || '—'} />
          <ResultRow label="Departamento" value={carnet.empleado?.departamento || '—'} />
          <ResultRow label="Cédula"       value={carnet.empleado?.cedula || '—'} />
          <ResultRow label="Emisión"      value={carnet.fechaEmision} />
          <ResultRow label="Vencimiento"  value={carnet.fechaVencimiento} />
        </div>

        <div className={styles.qrPanel}>
          <img
            src={carnet.empleado?.foto || `https://i.pravatar.cc/150?u=${carnet.empleadoId}`}
            alt="foto"
            className={styles.empFoto}
          />
          <QRCodeSVG value={qrValue} size={80} level="M" includeMargin={false} />
          <p className={styles.qrLabel}>ID #{carnet.id}</p>
        </div>
      </div>
    </div>
  );
}

function ResultRow({ label, value }) {
  return (
    <div className={styles.resultRow}>
      <span className={styles.rowLabel}>{label}</span>
      <span className={styles.rowVal}>{value}</span>
    </div>
  );
}
