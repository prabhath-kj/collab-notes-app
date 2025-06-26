import next from "next";
import { createServer } from "http";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = "localhost";
const port = parseInt(process.env.PORT || "3000", 10);
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer(handle);
  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    socket.on("join-note", (noteId: string) => {
      socket.join(noteId);
      console.log(`User joined note ${noteId}`);
    });
    socket.on("title-changed", ({ noteId, title }) => {
      console.log(noteId,title);
      
      socket.to(noteId).emit("title-update", title);
    });
    socket.on("note-changed", ({ noteId, content }) => {
      socket.to(noteId).emit("note-update", content);
    });

    socket.on("disconnect", () => {
      console.log("Socket disconnected:", socket.id);
    });
  });

  httpServer.listen(port, () => {
    console.log(`Server ready at http://localhost:${port}`);
  });
});
