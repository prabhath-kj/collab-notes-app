# 📝 Collaborative Notes App

This is a collaborative real-time note editing application built using the latest web technologies. It allows users to create, edit, and share notes with others, supporting live collaboration with role-based access.

---

## 🚀 Features

- 🔐 **Authentication**
  - Login & Token-based authentication
  - Zustand store for auth state

- 📝 **Note Management**
  - Create, edit, delete personal notes
  - Rich text editing using **Tiptap**

- 📡 **Real-time Collaboration**
  - Live updates across tabs or devices via **Socket.IO**
  - Auto-save with debounce

- 👥 **Note Sharing**
  - Share notes with others via email
  - Role-based access: `editor` or `viewer`

---

## 🛠️ Tech Stack

- **Frontend:** Next.js 15+, TypeScript, Tailwind CSS, Zustand, ShadCN UI
- **Editor:** Tiptap (ProseMirror-based rich text editor)
- **Real-time:** Socket.IO
- **Backend:** Next.js App Router, Server Actions, Custom Socket Server, MongoDB (via Mongoose)
- **Deployment:**

---

## 📦 How to Run Locally

```bash
# Clone the repo
git clone https://github.com/prabhath-kj/collab-notes-app
cd collab-notes-app

# Install dependencies
pnpm install

# Start dev server
pnpm dev:socket
