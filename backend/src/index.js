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

  // Get user ID from query parameter (passed from frontend)
  const url = new URL(c.req.url)
  const userId = url.searchParams.get('userId')
  
  if (!userId) {
    return c.text('Unauthorized', 401)
  }

  // Get the Durable Object
  const id = c.env.BOX_STATE.idFromName('main-room')
  const stub = c.env.BOX_STATE.get(id)
  
  return stub.fetch(c.req.raw)
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
    
    // Get user info from URL
    const url = new URL(request.url)
    const userId = url.searchParams.get('userId')
    
    this.sessions.push({ socket: server, userId })

    // Send current position to new client
    server.send(JSON.stringify({
      type: 'position',
      data: this.position
    }))

    server.addEventListener('message', (event) => {
      const message = JSON.parse(event.data)
      
      if (message.type === 'move') {
        this.position = message.data
        
        // Broadcast to all connected clients
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