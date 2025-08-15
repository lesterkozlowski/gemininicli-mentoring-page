import { cors } from 'hono/cors'

export const corsMiddleware = cors({
  origin: [
    'http://localhost:8788', 
    'http://localhost:3004', 
    'http://localhost:3000', 
    'http://127.0.0.1:8788', 
    'http://127.0.0.1:3004', 
    'http://127.0.0.1:3000'
  ],
  allowHeaders: ['Content-Type', 'Authorization'],
  allowMethods: ['POST', 'GET', 'PUT', 'DELETE', 'OPTIONS'],
})
