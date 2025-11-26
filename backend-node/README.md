# MX_Salon — Backend (Node.js + Express + Mongoose)

Secure, production-ready scaffold for MX_Salon using Express, Mongoose, JWT, and Socket.IO stubs.

## File tree

MX_Salon-backend/
├─ server.js
├─ package.json
├─ .env.example
├─ README.md
├─ src/
│  ├─ models/
│  │  ├─ User.js
│  │  ├─ Salon.js
│  │  └─ Queue.js
│  ├─ routes/
│  │  ├─ auth.js
│  │  ├─ salons.js
│  │  └─ queue.js
│  ├─ middleware/
│  │  └─ auth.js
│  └─ utils/
│     └─ cache.js

## Prerequisites
- Node 18+
- MongoDB Atlas cluster and a user password (do NOT paste plain password in the URI)

## 1) Create .env securely
Copy .env.example to .env and set values. IMPORTANT: URL-encode your Atlas user password before inserting.

Example .env:
```
MONGO_URI="mongodb+srv://krushna_sonawane:<<YOUR_PASSWORD_ENCODED>>@salon.e9ixd2z.mongodb.net/mxsalon?retryWrites=true&w=majority"
PORT=5000
JWT_SECRET=your_jwt_secret_here
BCRYPT_SALT_ROUNDS=10
REDIS_URL=
JWT_EXPIRES_IN=7d
```

### Encode your password (two options)

Node (paste password, then Ctrl+D to end input):
```
node -e "console.log(encodeURIComponent(require('fs').readFileSync(0,'utf8').trim()))"
```

Python (uses getpass + urllib.parse.quote):
```
python - <<'PY'
import sys
import getpass
from urllib.parse import quote
pw = getpass.getpass('Atlas user password: ')
print(quote(pw, safe=''))
PY
```

NEVER commit real secrets or the .env file.

## 2) Install & run
```
npm install
npm run dev
```
Server will start on http://localhost:5000

## 3) Endpoints
- Health: `GET /health` → { status: 'ok' }

### Auth
- Register: `POST /api/auth/register`
```
{
  "name": "Demo User",
  "email": "demo@example.com",
  "password": "secret123",
  "role": "customer"  // optional: customer | vendor | admin
}
```
- Login: `POST /api/auth/login` → { token }

Include `Authorization: Bearer <token>` for protected routes.

### Salons
- List: `GET /api/salons`
- Get: `GET /api/salons/:id`
- Create (vendor/admin): `POST /api/salons`
```
{
  "name":"Vintage Glow",
  "location":{"lat":18.52,"lng":73.86,"address":"MG Road"},
  "photos":[],
  "services":["Haircut","Shave"],
  "openHours": {"mon":"10:00-19:00"}
}
```
- Update (owner vendor/admin): `PUT /api/salons/:id`

### Queue / Appointments
- List my queue: `GET /api/queue`
- Add: `POST /api/queue`
```
{
  "salonId":"<salonObjectId>",
  "estimatedStart": "2025-11-04T12:00:00.000Z"
}
```
On create, server emits `queue:new` via Socket.IO.

## 4) Notes on security
- Passwords are hashed with bcrypt; salt rounds default 10 (configurable via env).
- JWT uses `JWT_SECRET` and `JWT_EXPIRES_IN` (default 7d). Consider adding a refresh token flow (TODO).
- Cache (Redis) is a stub; if `REDIS_URL` is missing, server continues without cache.

## 5) Error handling
- Startup fails fast on Mongo connection errors with clear message.
- Routes return simple JSON error messages with appropriate HTTP codes.

## 6) Curl examples
```
# health
curl http://localhost:5000/health

# register
curl -X POST http://localhost:5000/api/auth/register \
 -H "Content-Type: application/json" \
 -d '{"name":"Demo","email":"demo@example.com","password":"secret123","role":"vendor"}'

# login
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login -H "Content-Type: application/json" -d '{"email":"demo@example.com","password":"secret123"}' | node -e "process.stdin.on('data',d=>console.log(JSON.parse(d).token))")

echo $TOKEN

# create salon (vendor/admin)
curl -X POST http://localhost:5000/api/salons \
 -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
 -d '{"name":"Urban Trim","location":{"address":"Main Street"},"services":["Haircut"]}'

# my queue list
curl -H "Authorization: Bearer $TOKEN" http://localhost:5000/api/queue

# add to queue
curl -X POST http://localhost:5000/api/queue \
 -H "Authorization: Bearer $TOKEN" -H "Content-Type: application/json" \
 -d '{"salonId":"<salonId>"}'
```
