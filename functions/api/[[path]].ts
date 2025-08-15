import { Hono } from 'hono'
import { corsMiddleware } from './middleware/cors'
import dashboard from './routes/dashboard'
import mentors from './routes/mentors'
import type { AppContext } from './utils/types'

const app = new Hono<AppContext>()

// Enable CORS for frontend
app.use('*', corsMiddleware)

// Health check endpoint
app.get('/api/health', (c) => {
  return c.json({ status: 'ok', timestamp: new Date().toISOString() })
})

// Mount route modules
app.route('/api/dashboard', dashboard)
app.route('/api/contacts/mentors', mentors)

// Export the handler for Cloudflare Pages Functions
export const onRequest = (context: any) => {
  return app.fetch(context.request, context.env, context)
}
