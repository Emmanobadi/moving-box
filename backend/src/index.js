import { Hono } from 'hono'
import { cors } from 'hono/cors'

const app = new Hono()

// Enable CORS
app.use('/*', cors({
  origin: '*',
  credentials: true,
}))

// Test endpoint
app.get('/', (c) => {
  return c.json({ message: 'Moving Box API is running!' })
})

// WebSocket upgrade endpoint with auth
app.get('/ws', async (c) => {
  const upgradeHeader = c.req.header('Upgrade')
  
  if (!upgradeHeader || upgradeHeader !== 'websocket') {
    return c.text('Expected WebSocket', 426)
  }

  const url = new URL(c.req.url)
  const userId = url.searchParams.get('userId')
  
  if (!userId) {
    return c.text('Unauthorized', 401)
  }


  const id = c.env.BOX_STATE.idFromName('main-room')
  const stub = c.env.BOX_STATE.get(id)
  
  return stub.fetch(c.req.raw)
})

// Cache user profile in KV
app.post('/cache-user', async (c) => {
  const { userId, email } = await c.req.json()
  
  if (!userId || !email) {
    return c.json({ error: 'Missing userId or email' }, 400)
  }

  const profile = { userId, email, cachedAt: new Date().toISOString() }
  
  await c.env.USER_CACHE.put(userId, JSON.stringify(profile), {
    expirationTtl: 86400
  })

  return c.json({ message: 'Profile cached', profile })
})

// Get cached user profile
app.get('/cache-user/:userId', async (c) => {
  const userId = c.req.param('userId')
  
  const cached = await c.env.USER_CACHE.get(userId)
  
  if (!cached) {
    return c.json({ message: 'Not in cache' }, 404)
  }

  return c.json({ profile: JSON.parse(cached), source: 'cache' })
})

export default app

// Durable Object class
export class BoxRoom {
  constructor(state, env) {
    this.state = state
    this.env = env
    this.sessions = []
    this.position = { x: 100, y: 100 }
  }

  async fetch(request) {
    const webSocketPair = new WebSocketPair()
    const [client, server] = Object.values(webSocketPair)

    server.accept()
    
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    this.sessions.push({ socket: server, userId })

    server.send(JSON.stringify({
      type: 'position',
      data: this.position
    }))

    server.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      
      if (message.type === 'move') {
        this.position = message.data
        
        this.sessions.forEach(session => {
          if (session.socket.readyState === 1) {
            session.socket.send(JSON.stringify({
              type: 'position',
              data: this.position,
              userId: userId
            }))
          }
        })
      }
    })

    server.addEventListener('close', () => {
      this.sessions = this.sessions.filter(s => s.socket !== server)
    })

    return new Response(null, {
      status: 101,
      webSocket: client,
    })
  }
}