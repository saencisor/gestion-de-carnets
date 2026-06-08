import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../services/api';
import styles from './NuevoEmpleado.module.css';

const CAMPOS = [
  { name: 'nombre',       label: 'Nombre completo',    type: 'text',  required: true,  placeholder: 'Ej: Carlos Andrés Gómez' },
  { name: 'cedula',       label: 'Cédula',             type: 'text',  required: true,  placeholder: 'Ej: 1023456789' },
  { name: 'cargo',        label: 'Cargo',              type: 'text',  required: true,  placeholder: 'Ej: Instructor de Inglés' },
  { name: 'departamento', label: 'Departamento',       type: 'text',  required: true,  placeholder: 'Ej: Académico' },
  { name: 'email',        label: 'Correo electrónico', type: 'email', required: true,  placeholder: 'Ej: carlos@colombiaesl.com' },
  { name: 'telefono',     label: 'Teléfono',           type: 'text',  required: false, placeholder: 'Ej: +57 310 234 5678' },
  { name: 'fechaIngreso', label: 'Fecha de ingreso',   type: 'date',  required: false, placeholder: '' },
  { name: 'foto',         label: 'URL de foto',        type: 'url',   required: false, placeholder: 'https://...' },
];

const INITIAL = Object.fromEntries(CAMPOS.map((c) => [c.name, '']));

export default function NuevoEmpleado() {
  const [form, setForm] = useState(INITIAL);
  const [errores, setErrores] = useState({});
  const [loading, setLoading] = useState(false);
  const [errorGlobal, setErrorGlobal] = useState('');
  const [generarCarnet, setGenerarCarnet] = useState(false);
  const navigate = useNavigate();

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
    setErrores((er) => ({ ...er, [name]: '' }));
    setErrorGlobal('');
  }

  function validar() {
    const nuevos = {};
    if (!form.nombre.trim())       nuevos.nombre       = 'El nombre es requerido.';
    if (!form.cedula.trim())       nuevos.cedula       = 'La cédula es requerida.';
    if (!/^\d+$/.test(form.cedula.trim())) nuevos.cedula = 'La cédula solo debe contener números.';
    if (!form.cargo.trim())        nuevos.cargo        = 'El cargo es requerido.';
    if (!form.departamento.trim()) nuevos.departamento = 'El departamento es requerido.';
    if (!form.email.trim())        nuevos.email        = 'El email es requerido.';
    return nuevos;
  }

  async function handleSubmit(e) {
    e.preventDefault();
    const errValidacion = validar();
    if (Object.keys(errValidacion).length > 0) { setErrores(errValidacion); return; }

    setLoading(true);
    try {
      const payload = { ...form };
      if (!payload.fechaIngreso) payload.fechaIngreso = new Date().toISOString().split('T')[0];

      const { data: empleado } = await api.post('/empleados', payload);

      if (generarCarnet) {
        const fechaVencimiento = new Date(Date.now() + 2 * 365 * 24 * 60 * 60 * 1000)
          .toISOString().split('T')[0];
        const { data: carnet } = await api.post('/carnets', {
          empleadoId: empleado.id,
          fechaVencimiento,
        });
        navigate(`/carnets/${carnet.id}`);
      } else {
        navigate('/empleados');
      }
    } catch (err) {
      setErrorGlobal(err.response?.data?.error || 'Error al crear el empleado.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={styles.page}>
      <div className={styles.topBar}>
        <Link to="/empleados" className={styles.backLink}>← Volver a empleados</Link>
      </div>

      <div className={styles.card}>
        <div className={styles.cardHeader}>
          <span className={styles.cardIcon}>👤</span>
          <div>
            <h1 className={styles.title}>Nuevo Empleado</h1>
            <p className={styles.sub}>Completa los datos para registrar al empleado en el sistema.</p>
          </div>
        </div>

        {errorGlobal && <div className={styles.errorGlobal}>{errorGlobal}</div>}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>
          <div className={styles.grid}>
            {CAMPOS.map(({ name, label, type, placeholder, required }) => (
              <div key={name} className={`${styles.field} ${name === 'email' || name === 'foto' ? styles.fullWidth : ''}`}>
                <label htmlFor={name} className={styles.label}>
                  {label}
                  {required && <span className={styles.req}>*</span>}
                </label>
                <input
                  id={name}
                  name={name}
                  type={type}
                  placeholder={placeholder}
                  value={form[name]}
                  onChange={handleChange}
                  className={`${styles.input} ${errores[name] ? styles.inputError : ''}`}
                />
                {errores[name] && <p className={styles.fieldError}>{errores[name]}</p>}
              </div>
            ))}
          </div>

          {/* Opción de generar carné al guardar */}
          <label className={styles.checkLabel}>
            <input
              type="checkbox"
              className={styles.checkbox}
              checked={generarCarnet}
              onChange={(e) => setGenerarCarnet(e.target.checked)}
            />
            <span>Generar carné digital automáticamente al guardar</span>
          </label>

          <div className={styles.actions}>
            <Link to="/empleados" className={styles.btnCancel}>Cancelar</Link>
            <button className={styles.btnSubmit} type="submit" disabled={loading}>
              {loading
                ? 'Guardando...'
                : generarCarnet
                  ? '💾 Guardar y generar carné'
                  : '💾 Guardar empleado'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
