import next from 'next'
import express from 'express'
import { createServer } from 'http'
import { Server } from 'socket.io'

const dev = process.env.NODE_ENV !== 'production'
const app = next({ dev })
const handle = app.getRequestHandler()

const port = parseInt(process.env.PORT || '3000', 10)

app.prepare().then(() => {
  const expressApp = express()
  const httpServer = createServer(expressApp)
  const io = new Server(httpServer, {
    cors: {
      origin: '*',
    },
  })

  io.on('connection', (socket) => {

    socket.on('join-note', (noteId: string) => {
      socket.join(noteId)
      console.log(`📄 User joined note ${noteId}`)
    })

    socket.on('note-changed', ({ noteId, content }) => {
      socket.to(noteId).emit('note-update', content)
    })

    socket.on('disconnect', () => {
      console.log('❌ Socket disconnected:', socket.id)
    })
  })

  expressApp.all('*', (req, res) => {
    return handle(req, res)
  })

  httpServer.listen(port, () => {
    console.log(`🚀 Server ready at http://localhost:${port}`)
  })
})
