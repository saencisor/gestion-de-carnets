const express = require('express');
const router = express.Router();
const fs = require('fs');
const path = require('path');

const dbPath = path.join(__dirname, '../data/db.json');

function leerDB() {
  return JSON.parse(fs.readFileSync(dbPath, 'utf-8'));
}

/**
 * @swagger
 * tags:
 *   name: Portal
 *   description: Consulta pública del carné por cédula (sin autenticación)
 */

/**
 * @swagger
 * /api/portal/{cedula}:
 *   get:
 *     summary: Consultar carné por número de cédula (público)
 *     tags: [Portal]
 *     parameters:
 *       - in: path
 *         name: cedula
 *         required: true
 *         schema:
 *           type: string
 *         description: Número de cédula del empleado
 *     responses:
 *       200:
 *         description: Datos del empleado y su carné
 *       404:
 *         description: No se encontró empleado con esa cédula
 */
router.get('/:cedula', (req, res) => {
  const db = leerDB();
  const empleado = db.empleados.find((e) => e.cedula === req.params.cedula.trim());

  if (!empleado) {
    return res.status(404).json({ error: 'No se encontró ningún empleado con esa cédula.' });
  }

  const carnet = db.carnets.find((c) => c.empleadoId === empleado.id) || null;
  res.json({ empleado, carnet });
});

module.exports = router;
