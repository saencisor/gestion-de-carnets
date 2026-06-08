const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const db = require('../data/db.json');

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Autenticación de usuarios
 */

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Iniciar sesión y obtener token JWT
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 example: admin
 *               password:
 *                 type: string
 *                 example: admin123
 *     responses:
 *       200:
 *         description: Login exitoso, retorna JWT
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 token:
 *                   type: string
 *                 usuario:
 *                   type: object
 *       401:
 *         description: Credenciales inválidas
 */
router.post('/login', (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: 'Usuario y contraseña son requeridos' });
  }

  const usuario = db.usuarios.find(
    (u) => u.username === username && u.password === password
  );

  if (!usuario) {
    return res.status(401).json({ error: 'Credenciales inválidas' });
  }

  const payload = { id: usuario.id, username: usuario.username, rol: usuario.rol };
  const token = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: '8h' });

  res.json({
    token,
    usuario: { id: usuario.id, username: usuario.username, rol: usuario.rol }
  });
});

module.exports = router;
