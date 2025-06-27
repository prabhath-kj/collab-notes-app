import next from "next";
import { createServer } from "http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

// In-memory room users tracking
const roomUsers: Record<string, Record<string, { name: string; email: string }>> = {};

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected:", socket.id);

    socket.on("join-note", (noteId: string, user) => {
      socket.join(noteId);
      console.log(`User ${user?.name} joined note ${noteId}`);

      // Track user in room
      if (!roomUsers[noteId]) roomUsers[noteId] = {};
      roomUsers[noteId][socket.id] = { name: user?.name || "Guest", email: user?.email || "" };

      // Notify everyone in room of updated user list
      io.to(noteId).emit("user-list", Object.values(roomUsers[noteId]));
    });

    socket.on("title-changed", ({ noteId, title }) => {
      socket.to(noteId).emit("title-update", title);
    });

    socket.on("note-changed", ({ noteId, content }) => {
      socket.to(noteId).emit("note-update", content);
    });

    socket.on("typing", ({ noteId, user }) => {
      socket.to(noteId).emit("user-typing", user);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);

      // Remove user from all rooms they were in
      for (const roomId of Object.keys(roomUsers)) {
        if (roomUsers[roomId][socket.id]) {
          delete roomUsers[roomId][socket.id];
          io.to(roomId).emit("user-list", Object.values(roomUsers[roomId]));
        }
      }
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}`);
  });
});
