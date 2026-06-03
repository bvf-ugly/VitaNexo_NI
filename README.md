![VitaNexo](web/public/banner.svg)

## Stack

| Capa | Tecnologia | Version |
|------|-----------|---------|
| Runtime | Node.js | 20.x LTS |
| Paquetes | pnpm | 9.x |
| Backend | Express.js + nodemon | 4.19.x |
| ODM | Mongoose | 8.x |
| DB | MongoDB | 7.0 |
| HTTP client | axios | 1.7.x |
| Frontend | React + Vite + Tailwind | 18 / 5 / 3.4 |
| Graficas | Recharts | 2.x |
| Mobile | Expo SDK 51 + React Native | 51 / 0.74 |

## Estructura

```
VitaNexo/
  backend/src/
    index.js              Express + Helmet + CORS + rate limit
    models/index.js       9 colecciones Mongoose
    controllers/          auth, glucose
    routes/               7 modulos
    middleware/           auth JWT + anti-NoSQL injection
    utils/db.js
  backend/scripts/seed.js Credenciales desde .env
  web/src/pages/          Login, Register, Dashboard, Glucose, Patients, Appointments
  mobile/app/             login, register, (tabs): home/glucose/citas/perfil
   setup.bat               Primera vez
```

## Inicio rapido (Windows)

### 1. Requisitos

- Node.js 20 LTS -> https://nodejs.org

### 2. Setup inicial (una vez)

```
setup.bat
```

Instala pnpm, dependencias y ejecuta seed.

### 3. Editar backend/.env antes del seed

```
JWT_SECRET=<node -e "console.log(require('crypto').randomBytes(32).toString('hex'))">
JWT_REFRESH_SECRET=<otro distinto>
SEED_ADMIN_EMAIL=tu@correo.com
SEED_ADMIN_PASSWORD=TuClaveSegura123!
SEED_DOCTOR_EMAIL=doctor@vitanexo.com
SEED_DOCTOR_PASSWORD=Doctor2024Seg!
SEED_PATIENT_EMAIL=maria.garcia@vitanexo.com
SEED_PATIENT_PASSWORD=Paciente2024Seg!
```

## Seguridad

- Helmet.js, anti-NoSQL injection, tipo estricto en auth
- Rate limit 10/min en auth, 100/min global
- JWT access 15m + refresh 7d con rotacion
- bcrypt 10 rounds, role forzado a patient en registro publico
- Admin solo por seed (nunca por API publica)
- Credenciales del seed en .env, nunca hardcodeadas

## Mobile -- emulador

```
Android emulador  -> EXPO_PUBLIC_API_URL=http://10.0.2.2:5000/api
iOS simulator     -> EXPO_PUBLIC_API_URL=http://localhost:5000/api
Dispositivo fisico -> EXPO_PUBLIC_API_URL=http://<TU_IP>:5000/api
```

Usar `start-mobile.bat` opcion 3 (tunnel) si hay problemas de red.
