import { useState, useEffect } from 'react'
import { Badge } from './components/ui/badge'

export default function DraggableBox({ user }) {
  const [position, setPosition] = useState({ x: 100, y: 100 })
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [ws, setWs] = useState(null)
  const [connected, setConnected] = useState(false)

  useEffect(() => {
    // Connect to WebSocket
    const websocket = new WebSocket(`ws://127.0.0.1:8787/ws?userId=${user.id}`)
    
    websocket.onopen = () => {
      console.log('WebSocket connected')
      setConnected(true)
    }
    
    websocket.onmessage = (event) => {
      const message = JSON.parse(event.data)
      if (message.type === 'position') {
        setPosition(message.data)
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
  }, [])

  const handleMouseDown = (e) => {
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y
    })
  }

  const handleMouseMove = (e) => {
    if (!isDragging) return
    
    const newPosition = {
      x: e.clientX - dragOffset.x,
      y: e.clientY - dragOffset.y
    }
    
    setPosition(newPosition)
    
    // Send position to server
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

    <div className="fixed top-4 right-4 z-50">
  <Badge variant={connected ? 'success' : 'destructive'}>
    {connected ? 'Connected' : 'Disconnected'}
  </Badge>
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