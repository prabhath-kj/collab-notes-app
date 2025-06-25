import { Server } from 'socket.io'
import type { NextRequest } from 'next/server'
import { NextApiResponseServerIO } from '@/lib/types/next'

export const config = {
  api: {
    bodyParser: false,
  },
}

export default function handler(req: NextRequest, res: NextApiResponseServerIO) {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server)

    io.on('connection', (socket) => {
      console.log('🔌 New socket connected:', socket.id)

      socket.on('join-note', (noteId: string) => {
        socket.join(noteId)
        console.log(`🧾 User joined note ${noteId}`)
      })

      socket.on('note-changed', ({ noteId, content }) => {
        socket.to(noteId).emit('note-update', content)
      })
    })

    res.socket.server.io = io
  }

  res.end()
}
