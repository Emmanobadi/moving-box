import { useState, useEffect, MouseEvent } from 'react'
import { User } from '@supabase/supabase-js'
import { Badge } from './components/ui/badge'

interface Position {
  x: number
  y: number
}

interface WSMessage {
  type: 'init' | 'position' | 'user-joined' | 'user-left'
  position?: Position
  data?: Position
  userId?: string
  users?: string[]
}

interface DraggableBoxProps {
  user: User
}

export default function DraggableBox({ user }: DraggableBoxProps) {
  const [position, setPosition] = useState<Position>({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [dragOffset, setDragOffset] = useState<Position>({ x: 0, y: 0 })
  const [ws, setWs] = useState<WebSocket | null>(null)
  const [connected, setConnected] = useState<boolean>(false)
  const [activeUsers, setActiveUsers] = useState<string[]>([])

  useEffect(() => {
    const websocket = new WebSocket(`wss://moving-box-worker.emmanaliob.workers.dev/ws?userId=${user.id}`)
    
    websocket.onopen = () => {
      console.log('WebSocket connected')
      setConnected(true)
    }
    
    websocket.onmessage = (event: MessageEvent) => {
      const message: WSMessage = JSON.parse(event.data)
      
      if (message.type === 'init' && message.position && message.users) {
        setPosition(message.position)
        setActiveUsers(message.users.filter(id => id !== user.id))
      } else if (message.type === 'position' && message.data) {
        setPosition(message.data)
      } else if (message.type === 'user-joined' && message.users) {
        setActiveUsers(message.users.filter(id => id !== user.id))
      } else if (message.type === 'user-left' && message.users) {
        setActiveUsers(message.users.filter(id => id !== user.id))
      }
    }
    
    websocket.onclose = () => {
      console.log('WebSocket disconnected')
      setConnected(false)
    }
    
    setWs(websocket)
    
    return () => {
      websocket.close()
    }
  }, [user.id])

  const handleMouseDown = (e: MouseEvent<HTMLDivElement>) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e: MouseEvent<HTMLDivElement>) => {
    if (!isDragging) return
    
    const newPosition: Position = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    }
    
    setPosition(newPosition)
    
    if (ws && ws.readyState === WebSocket.OPEN) {
      ws.send(JSON.stringify({
        type: 'move',
        data: newPosition
      }))
    }
  }

  const handleMouseUp = () => {
    setIsDragging(false)
  }

  return (
    <>
      <div className="fixed top-4 right-4 z-50 flex gap-2">
        <Badge variant={connected ? 'success' : 'destructive'}>
          {connected ? 'Connected' : 'Disconnected'}
        </Badge>
        {activeUsers.length > 0 && (
          <Badge variant="secondary">
            {activeUsers.length} {activeUsers.length === 1 ? 'user' : 'users'} online
          </Badge>
        )}
      </div>
      <div
        className="fixed w-24 h-24 bg-blue-500 rounded-lg shadow-lg cursor-move flex items-center justify-center text-white font-bold select-none"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
          zIndex: 1000
        }}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
      >
        Drag Me
      </div>
    </>
  )
}