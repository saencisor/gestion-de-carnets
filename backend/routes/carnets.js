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
 *   name: Carnets
 *   description: Gestión de carnés digitales
 */

/**
 * @swagger
 * /api/carnets:
 *   get:
 *     summary: Obtener todos los carnés
 *     tags: [Carnets]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Lista de carnés con datos del empleado incluidos
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/CarnetDetalle'
 */
router.get('/', verificarToken, (req, res) => {
  const db = leerDB();
  const carnets = db.carnets.map((carnet) => {
    const empleado = db.empleados.find((e) => e.id === carnet.empleadoId) || null;
    return { ...carnet, empleado };
  });
  res.json(carnets);
});

/**
 * @swagger
 * /api/carnets/{id}:
 *   get:
 *     summary: Obtener un carné por ID
 *     tags: [Carnets]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *         description: ID del carné
 *     responses:
 *       200:
 *         description: Datos del carné con información del empleado
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/CarnetDetalle'
 *       404:
 *         description: Carné no encontrado
 */
router.get('/:id', verificarToken, (req, res) => {
  const db = leerDB();
  const carnet = db.carnets.find((c) => c.id === parseInt(req.params.id));
  if (!carnet) return res.status(404).json({ error: 'Carné no encontrado' });

  const empleado = db.empleados.find((e) => e.id === carnet.empleadoId) || null;
  res.json({ ...carnet, empleado });
});

/**
 * @swagger
 * /api/carnets:
 *   post:
 *     summary: Emitir un nuevo carné digital
 *     tags: [Carnets]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/CarnetInput'
 *     responses:
 *       201:
 *         description: Carné creado exitosamente
 *       400:
 *         description: Datos inválidos o empleado no existe
 */
router.post('/', verificarToken, (req, res) => {
  const { empleadoId, fechaVencimiento } = req.body;

  if (!empleadoId || !fechaVencimiento) {
    return res.status(400).json({ error: 'Campos requeridos: empleadoId, fechaVencimiento' });
  }

  const db = leerDB();

  const empleado = db.empleados.find((e) => e.id === parseInt(empleadoId));
  if (!empleado) return res.status(400).json({ error: 'El empleado especificado no existe' });

  const año = new Date().getFullYear();
  const nuevoId = db.carnets.length > 0 ? Math.max(...db.carnets.map((c) => c.id)) + 1 : 1;
  const codigo = `ESL-${año}-${String(nuevoId).padStart(3, '0')}`;

  const nuevoCarnet = {
    id: nuevoId,
    empleadoId: parseInt(empleadoId),
    codigo,
    fechaEmision: new Date().toISOString().split('T')[0],
    fechaVencimiento,
    estado: 'activo'
  };

  db.carnets.push(nuevoCarnet);
  escribirDB(db);

  res.status(201).json({ ...nuevoCarnet, empleado });
});

/**
 * @swagger
 * /api/carnets/{id}/estado:
 *   patch:
 *     summary: Cambiar el estado de un carné (activo, suspendido, vencido)
 *     tags: [Carnets]
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
 *             type: object
 *             properties:
 *               estado:
 *                 type: string
 *                 enum: [activo, suspendido, vencido]
 *     responses:
 *       200:
 *         description: Estado actualizado
 *       404:
 *         description: Carné no encontrado
 */
router.patch('/:id/estado', verificarToken, (req, res) => {
  const { estado } = req.body;
  const estadosValidos = ['activo', 'suspendido', 'vencido'];

  if (!estadosValidos.includes(estado)) {
    return res.status(400).json({ error: `Estado debe ser uno de: ${estadosValidos.join(', ')}` });
  }

  const db = leerDB();
  const idx = db.carnets.findIndex((c) => c.id === parseInt(req.params.id));
  if (idx === -1) return res.status(404).json({ error: 'Carné no encontrado' });

  db.carnets[idx].estado = estado;
  escribirDB(db);

  res.json(db.carnets[idx]);
});

module.exports = router;
