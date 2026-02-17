import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'
import Login from './Login'
import DraggableBox from './DraggableBox'

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const cacheUserProfile = async (user) => {
    try {
      await fetch('http://127.0.0.1:8787/cache-user', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: user.id, email: user.email })
      })
    } catch (err) {
      console.error('Failed to cache user profile:', err)
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) cacheUserProfile(currentUser)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const currentUser = session?.user ?? null
      setUser(currentUser)
      if (currentUser) cacheUserProfile(currentUser)
    })

    return () => subscription.unsubscribe()
  }, [])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center bg-gray-900 text-white">Loading...</div>
  }

  if (!user) {
    return <Login onLogin={setUser} />
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Moving Box</h1>
          <button
            onClick={() => supabase.auth.signOut()}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded"
          >
            Logout
          </button>
        </div>
        <div className="bg-gray-800 p-6 rounded-lg">
          <p className="mb-4">Logged in as: {user.email}</p>
          <p className="text-gray-400">Try dragging the box below!</p>
        </div>
      </div>
      <DraggableBox user={user} />
    </div>
  )
}

export default App