# Architecture Overview

- FastAPI backend (ASGI) with Socket.IO server attached via ASGIApp.
- MongoDB Atlas via Motor, Upstash Redis for queue lists.
- React (Vite) web app with Tailwind and i18next.
- Expo RN mobile (to be added) sharing the REST and Socket.IO endpoints.
- AI modules loaded lazily; fallback heuristics when models are absent.
