# API Reference (MVP)

- GET /health
- POST /api/auth/signup { email, password, role, name } → { access_token }
- POST /api/auth/login { email, password } → { access_token }
- GET /api/auth/me → JWT payload
- GET /api/salons?city=City → [salon]
- GET /api/salons/{id} → salon
- POST /api/salons → { id }
- PUT /api/salons/{id} → { ok }
- DELETE /api/salons/{id} → { ok }
- POST /api/queue/join/{salon_id}?user_id=uid → { ok }
- POST /api/queue/leave/{salon_id}?user_id=uid → { ok }
- GET /api/queue/{salon_id} → { salon_id, queue }
- POST /api/reviews/{salon_id} { user_id, rating, text } → { id, sentiment }
- GET /api/reviews/{salon_id} → [reviews]
- POST /api/ai/waittime { queue_length, avg_service_time, time_of_day, day_of_week } → { predicted_minutes }
- POST /api/ai/recommend { lat, lng } → { salons: [] }
