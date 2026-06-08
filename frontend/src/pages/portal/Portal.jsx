import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Portal.module.css';

export default function Portal() {
  const [cedula, setCedula] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleSubmit(e) {
    e.preventDefault();
    if (!cedula.trim()) { setError('Ingresa tu número de cédula.'); return; }
    if (!/^\d+$/.test(cedula.trim())) { setError('La cédula solo debe contener números.'); return; }
    navigate(`/portal/${cedula.trim()}`);
  }

  return (
    <div className={styles.page}>
      <div className={styles.bg} aria-hidden="true">
        <span className={styles.bgBlue} />
        <span className={styles.bgRed} />
        <span className={styles.bgYellow} />
      </div>

      <div className={styles.card}>
        <div className={styles.header}>
          <span className={styles.iconWrap}>🎓</span>
          <h1 className={styles.title}>Colombia ESL</h1>
          <p className={styles.subtitle}>Portal de Consulta de Carné</p>
        </div>

        <p className={styles.desc}>
          Consulta tu carné digital ingresando tu número de cédula de ciudadanía.
        </p>

        <form className={styles.form} onSubmit={handleSubmit}>
          <label className={styles.label} htmlFor="cedula">
            Número de cédula
          </label>
          <input
            id="cedula"
            className={styles.input}
            type="text"
            inputMode="numeric"
            placeholder="Ej: 1023456789"
            value={cedula}
            onChange={(e) => { setCedula(e.target.value); setError(''); }}
            maxLength={12}
          />
          {error && <p className={styles.error}>{error}</p>}
          <button className={styles.btn} type="submit">
            Consultar mi carné →
          </button>
        </form>

        <p className={styles.footer}>
          Solo personal vinculado a Colombia ESL puede consultar su carné.
        </p>
      </div>
    </div>
  );
}
