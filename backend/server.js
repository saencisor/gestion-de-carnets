require('dotenv').config();
const express = require('express');
const cors = require('cors');
const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

const authRoutes = require('./routes/auth');
const empleadosRoutes = require('./routes/empleados');
const carnetsRoutes = require('./routes/carnets');

const app = express();
const PORT = process.env.PORT || 3001;

// Middlewares globales
app.use(cors());
app.use(express.json());

// Swagger config
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Colombia ESL - API de Carnés Digitales',
      version: '1.0.0',
      description: 'API REST para la gestión de carnés digitales del personal de Colombia ESL'
    },
    servers: [
      { url: `http://localhost:${PORT}`, description: 'Servidor local' }
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT'
        }
      },
      schemas: {
        Empleado: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            nombre: { type: 'string', example: 'Carlos Andrés Gómez' },
            cedula: { type: 'string', example: '1023456789' },
            cargo: { type: 'string', example: 'Instructor de Inglés' },
            departamento: { type: 'string', example: 'Académico' },
            email: { type: 'string', example: 'carlos.gomez@colombiaesl.com' },
            telefono: { type: 'string', example: '+57 310 234 5678' },
            fechaIngreso: { type: 'string', format: 'date', example: '2022-03-15' },
            activo: { type: 'boolean', example: true },
            foto: { type: 'string', example: 'https://i.pravatar.cc/150?img=11' }
          }
        },
        EmpleadoInput: {
          type: 'object',
          required: ['nombre', 'cedula', 'cargo', 'departamento', 'email'],
          properties: {
            nombre: { type: 'string' },
            cedula: { type: 'string' },
            cargo: { type: 'string' },
            departamento: { type: 'string' },
            email: { type: 'string' },
            telefono: { type: 'string' },
            fechaIngreso: { type: 'string', format: 'date' },
            foto: { type: 'string' }
          }
        },
        CarnetDetalle: {
          type: 'object',
          properties: {
            id: { type: 'integer', example: 1 },
            empleadoId: { type: 'integer', example: 1 },
            codigo: { type: 'string', example: 'ESL-2024-001' },
            fechaEmision: { type: 'string', format: 'date' },
            fechaVencimiento: { type: 'string', format: 'date' },
            estado: { type: 'string', enum: ['activo', 'suspendido', 'vencido'] },
            empleado: { '$ref': '#/components/schemas/Empleado' }
          }
        },
        CarnetInput: {
          type: 'object',
          required: ['empleadoId', 'fechaVencimiento'],
          properties: {
            empleadoId: { type: 'integer', example: 1 },
            fechaVencimiento: { type: 'string', format: 'date', example: '2026-12-31' }
          }
        }
      }
    }
  },
  apis: ['./routes/*.js']
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  customSiteTitle: 'Colombia ESL API Docs'
}));

// Rutas
app.use('/api/auth', authRoutes);
app.use('/api/empleados', empleadosRoutes);
app.use('/api/carnets', carnetsRoutes);

// Ruta raíz
app.get('/', (req, res) => {
  res.json({
    mensaje: 'Colombia ESL - API de Carnés Digitales',
    version: '1.0.0',
    docs: `http://localhost:${PORT}/api/docs`
  });
});

// Manejo de rutas no encontradas
app.use((req, res) => {
  res.status(404).json({ error: 'Ruta no encontrada' });
});

app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
  console.log(`Documentación Swagger en http://localhost:${PORT}/api/docs`);
});
