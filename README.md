# Moving Box - Real-Time Collaborative Box

A real-time web application demonstrating WebSocket-based synchronization using Cloudflare Durable Objects. Multiple users can drag a box and see it move synchronously across all connected clients.

## Features

- **Real-time synchronization** - Box position updates instantly across all connected users
- **Authentication** - Secure login with Supabase (Email/Password + Google OAuth)
- **User Presence** - Displays online connection status in real-time
- **WebSocket communication** - Low-latency updates via WebSocket protocol
- **Durable Objects** - Persistent state management with Cloudflare Durable Objects
- **Responsive UI** - Clean, modern interface with Tailwind CSS

## Tech Stack

**Frontend:**
- React - JavaScript library for the UI
- Vite - Fast development tool
- Tailwind CSS - For styling
- Supabase - Handles user login

**Backend:**
- Cloudflare Workers - Runs the server code globally
- Hono - Lightweight web framework
- Durable Objects - Manages WebSocket connections
- WebSocket - Enables real-time updates

### Database & Auth
- **Supabase PostgreSQL** - User authentication
- **Supabase Auth** - JWT-based authentication (Email + Google OAuth)
- **Supabase Realtime Presence** - Tracks active users

## Project Structure
```
moving-box/
├── frontend/
│   ├── src/
│   │   ├── App.jsx              # Main app component with auth logic
│   │   ├── Login.jsx            # Login/signup UI
│   │   ├── DraggableBox.jsx     # Draggable box with WebSocket
│   │   ├── supabaseClient.js    # Supabase configuration
│   │   └── index.css            # Tailwind imports
│   ├── tailwind.config.js
│   ├── postcss.config.js
│   └── package.json
├── backend/
│   ├── src/
│   │   └── index.js             # Worker + Durable Object
│   ├── wrangler.toml            # Cloudflare configuration
│   └── package.json
└── README.md

## How It Works

1. User logs in with email/password
2. Browser connects to the server via WebSocket
3. When user drags the box, new position is sent to server
4. Server broadcasts the position to all connected users
5. Everyone's box moves to the same position

### How Authentication works

1. User logs in via Email/Password or Google OAuth
2. Supabase returns a JWT access token
3. Frontend stores session securely
4. User ID is passed when establishing WebSocket connection
5. Backend validates and connects user to Durable Object

### Key Technologies Explained

**Durable Objects:**
- Singleton pattern - one instance per "room"
- Maintains WebSocket connections in memory
- Broadcasts position updates to all connected clients
- Survives across requests (stateful)

**WebSocket:**
- Persistent bidirectional connection
- Low latency (~10-50ms) updates
- Eliminates need for polling

## Setup Instructions

### Prerequisites

- Node.js v18+ and npm
- Cloudflare account
- Supabase account

### Installation

**1. Clone the repository**
```bash
git clone https://github.com/emmanobadi/moving-box.git
cd moving-box
```

**2. Set up Frontend**
```bash
cd frontend
npm install
```

Create `src/supabaseClient.js` with your Supabase credentials:
```js
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'YOUR_SUPABASE_URL'
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

**3. Set up Backend**
```bash
cd ../backend
npm install
```

**4. Configure Supabase**

- Go to your Supabase project
- Enable Email authentication
- Disable email confirmation (for testing)

### Running Locally

**Terminal 1 - Backend:**
```bash
cd backend
npx wrangler dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm run dev
```

Open `http://localhost:5173` in multiple browser tabs to test real-time sync.

### Deployment

**Deploy Worker to Cloudflare:**
```bash
cd backend
npx wrangler deploy
```

**Deploy Frontend:**

Frontend can be deployed to Vercel, Netlify, or Cloudflare Pages. Update the WebSocket URL in `DraggableBox.jsx` to your deployed Worker URL.

## Usage

1. **Sign up** - Create an account with email/password
2. **Login** - Access the main app
3. **Drag the box** - Click and drag the blue box
4. **Open multiple tabs** - See the box move in real-time across all tabs
5. **Connection status** - Green badge = connected, Red = disconnected

## Testing Real-Time Sync

1. Open the app in two browser windows side-by-side
2. Log in to both windows
3. Drag the box in one window
4. Observe the box moving simultaneously in the other window

## Future Enhancements

- Different colored boxes for each user
- Show who's online
- Multiple rooms (different boxes)
- Save position to database
- Add chat feature

## Challenges & Solutions

**Challenge:** Tailwind CSS v4 uses different syntax than v3
**Solution:** Updated `index.css` to use `@import "tailwindcss"` instead of `@tailwind` directives

**Challenge:** WebSocket connections across browser tabs
**Solution:** Each tab maintains independent WebSocket connection to the same Durable Object instance

**Challenge:** Authentication with WebSocket
**Solution:** Pass user ID as query parameter in WebSocket URL

## License

MIT

## Author

Emman Obadi - [GitHub](https://github.com/emmanobadi)
