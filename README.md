# Colombia ESL — Sistema de Carnés Digitales

Aplicación full-stack para gestión y emisión de carnés digitales de empleados.  
**Backend:** Node.js + Express + JWT | **Frontend:** React + Vite + React Router

---

## Requisitos previos

- [Node.js](https://nodejs.org) v18 o superior
- npm v9 o superior
- Dos terminales abiertas (una por proyecto)

---

## Estructura del proyecto

```
ALEXA/
├── backend/          ← API REST (Express)
│   ├── routes/       ← auth.js · empleados.js · carnets.js
│   ├── data/db.json  ← base de datos mock
│   ├── middleware/   ← verificación JWT
│   ├── server.js
│   └── .env
└── frontend/         ← React + Vite
    └── src/
        ├── contexts/ ← AuthContext (useReducer)
        ├── services/ ← api.js (Axios → localhost:3001)
        ├── pages/    ← Login · Dashboard · Empleados · Carnet · Validar
        └── components/ ← Layout · ProtectedRoute
```

---

## Puesta en marcha

### Terminal 1 — Backend

```bash
cd backend

# Primera vez: copiar variables de entorno
copy .env.example .env

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

El servidor arranca en **http://localhost:3001**  
Documentación Swagger: **http://localhost:3001/api/docs**

---

### Terminal 2 — Frontend

```bash
cd frontend

# Instalar dependencias (solo la primera vez)
npm install

# Iniciar servidor de desarrollo
npm run dev
```

La app arranca en **http://localhost:5173**

---

## Credenciales de prueba

| Campo    | Valor      |
|----------|------------|
| Usuario  | `admin`    |
| Password | `admin123` |

---

## Flujo completo verificado

### 1. Login → `POST /api/auth/login`

```
Frontend: Login.jsx
  └─ api.post('/auth/login', { username, password })
       └─ Backend: POST http://localhost:3001/api/auth/login
            └─ Responde: { token: "eyJ...", usuario: { id, username, rol } }
  └─ AuthContext guarda token en localStorage
  └─ Redirige a /dashboard
```

### 2. Dashboard → `GET /api/empleados` + `GET /api/carnets`

```
Frontend: Dashboard.jsx (useEffect al montar)
  └─ api.get('/empleados')   → Authorization: Bearer <token>
  └─ api.get('/carnets')     → Authorization: Bearer <token>
       └─ Backend valida JWT en middleware/auth.js
            └─ Responde arrays JSON con empleados y carnets
```

### 3. Generar carné → `POST /api/carnets`

```
Frontend: Empleados.jsx → botón "+ Generar carné"
  └─ api.post('/carnets', { empleadoId, fechaVencimiento })
       └─ Backend: crea carné con código ESL-YYYY-NNN
            └─ Responde carnet con empleado anidado
  └─ Navega automáticamente a /carnets/:id
```

### 4. Ver carné y QR → `GET /api/carnets/:id`

```
Frontend: Carnet.jsx (/carnets/:id)
  └─ api.get(`/carnets/${id}`)
       └─ Backend: responde carnet + datos del empleado
  └─ QR codifica: http://localhost:5173/validar/:id
```

### 5. Validar → `GET /api/carnets/:id`

```
Escaneo QR  → navega a /validar/:id
  └─ Validar.jsx usa useParams() para obtener el id
  └─ api.get(`/carnets/${id}`) → llama directamente por ID

Búsqueda manual en /validar:
  - Si el valor es numérico → GET /api/carnets/:id
  - Si es un código (ESL-...) → GET /api/carnets + filtra por código
```

---

## Variables de entorno

### `backend/.env`

```env
PORT=3001
JWT_SECRET=colombia_esl_super_secret_key_2024
```

### `frontend/src/services/api.js`

```js
baseURL: 'http://localhost:3001/api'
```

> Si cambias el puerto del backend, actualiza ambos archivos.

---

## Endpoints disponibles

| Método | Ruta                         | Auth | Descripción                         |
|--------|------------------------------|------|-------------------------------------|
| POST   | `/api/auth/login`            | No   | Login → devuelve JWT (8h)           |
| GET    | `/api/empleados`             | JWT  | Listar todos los empleados          |
| GET    | `/api/empleados/:id`         | JWT  | Ver un empleado por ID              |
| POST   | `/api/empleados`             | JWT  | Crear empleado                      |
| PUT    | `/api/empleados/:id`         | JWT  | Actualizar empleado                 |
| DELETE | `/api/empleados/:id`         | JWT  | Eliminar empleado                   |
| GET    | `/api/carnets`               | JWT  | Listar carnés (con datos empleado)  |
| GET    | `/api/carnets/:id`           | JWT  | Ver carné por ID                    |
| POST   | `/api/carnets`               | JWT  | Emitir nuevo carné                  |
| PATCH  | `/api/carnets/:id/estado`    | JWT  | Cambiar estado del carné            |

---

## Rutas del frontend

| Ruta             | Página       | Descripción                                 |
|------------------|--------------|---------------------------------------------|
| `/login`         | Login        | Formulario de acceso                        |
| `/dashboard`     | Dashboard    | Resumen: stats + tabla de empleados         |
| `/empleados`     | Empleados    | Grid de empleados + generar carné           |
| `/carnets/:id`   | Carnet       | Carné digital completo con QR               |
| `/validar`       | Validar      | Búsqueda manual por código o ID             |
| `/validar/:id`   | Validar      | Validación directa desde QR (auto-carga)    |
