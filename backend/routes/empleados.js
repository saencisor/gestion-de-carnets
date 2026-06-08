const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');
const verificarToken = require('../middleware/auth');

const dbPath = path.join(__dirname, '../data/db.json');

function leerDB() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

function escribirDB(data) {
  fs.writeFileSync(dbPath, JSON.stringify(data, null, 2), 'utf-8');
}

/**
 * @swagger
 * tags:
 *   name: Empleados
 *   description: Gestión de empleados
 */

/**
 * @swagger
 * /api/empleados:
 *   get:
 *     summary: Obtener todos los empleados
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de empleados
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Empleado'
 *       401:
 *         description: No autorizado
 */
router.get('/', verificarToken, (req, res) => {
  const db = leerDB();
  res.json(db.empleados);
});

/**
 * @swagger
 * /api/empleados/{id}:
 *   get:
 *     summary: Obtener un empleado por ID
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Datos del empleado
 *       404:
 *         description: Empleado no encontrado
 */
router.get('/:id', verificarToken, (req, res) => {
  const db = leerDB();
  const empleado = db.empleados.find((e) => e.id === parseInt(req.params.id));
  if (!empleado) return res.status(404).json({ error: 'Empleado no encontrado' });
  res.json(empleado);
});

/**
 * @swagger
 * /api/empleados:
 *   post:
 *     summary: Crear un nuevo empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpleadoInput'
 *     responses:
 *       201:
 *         description: Empleado creado exitosamente
 *       400:
 *         description: Datos inválidos
 */
router.post('/', verificarToken, (req, res) => {
  const { nombre, cedula, cargo, departamento, email, telefono, fechaIngreso, foto } = req.body;

  if (!nombre || !cedula || !cargo || !departamento || !email) {
    return res.status(400).json({ error: 'Campos requeridos: nombre, cedula, cargo, departamento, email' });
  }

  const db = leerDB();

  const existe = db.empleados.find((e) => e.cedula === cedula);
  if (existe) return res.status(409).json({ error: 'Ya existe un empleado con esa cédula' });

  const nuevoEmpleado = {
    id: db.empleados.length > 0 ? Math.max(...db.empleados.map((e) => e.id)) + 1 : 1,
    nombre,
    cedula,
    cargo,
    departamento,
    email,
    telefono: telefono || '',
    fechaIngreso: fechaIngreso || new Date().toISOString().split('T')[0],
    activo: true,
    foto: foto || `https://i.pravatar.cc/150?u=${cedula}`
  };

  db.empleados.push(nuevoEmpleado);
  escribirDB(db);

  res.status(201).json(nuevoEmpleado);
});

/**
 * @swagger
 * /api/empleados/{id}:
 *   put:
 *     summary: Actualizar datos de un empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/EmpleadoInput'
 *     responses:
 *       200:
 *         description: Empleado actualizado
 *       404:
 *         description: Empleado no encontrado
 */
router.put('/:id', verificarToken, (req, res) => {
  const db = leerDB();
  const idx = db.empleados.findIndex((e) => e.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Empleado no encontrado' });

  db.empleados[idx] = { ...db.empleados[idx], ...req.body, id: db.empleados[idx].id };
  escribirDB(db);

  res.json(db.empleados[idx]);
});

/**
 * @swagger
 * /api/empleados/{id}:
 *   delete:
 *     summary: Eliminar un empleado
 *     tags: [Empleados]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Empleado eliminado
 *       404:
 *         description: Empleado no encontrado
 */
router.delete('/:id', verificarToken, (req, res) => {
  const db = leerDB();
  const idx = db.empleados.findIndex((e) => e.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Empleado no encontrado' });

  db.empleados.splice(idx, 1);
  escribirDB(db);

  res.json({ mensaje: 'Empleado eliminado correctamente' });
});

module.exports = router;
