import { Hono } from 'hono'
import auth from './auth'
import { Bindings } from '../lib/utils'


const app = new Hono < { Bindings: Bindings }>()

app.route("/auth", auth)

app.notFound((c) => {
  return c.json({
    message: "Route not found.",
    error: true,
  }, 404)
})

app.get('/', (c) => {
  return c.text('Server running')
})

export default app
