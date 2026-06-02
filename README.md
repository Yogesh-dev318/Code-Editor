# CodeCraft 🚀

**CodeCraft** is a powerful, real-time collaborative code editor built for developers. It features a modern, dark-themed UI, multi-language support, real-time file synchronization, and an integrated AI assistant powered by Google Gemini.

---
##Video:-
https://github.com/user-attachments/assets/be37df23-77b2-4832-8626-c3a48d3d6af0



## ✨ Features

- **Real-time Collaboration:** Code with teammates instantly using Socket.io. See changes as they happen.
- **Multi-Language Support:** Run code in JavaScript, Python, Java, C++, C, TypeScript, and Rust via the Piston API.
- **AI Assistance:** Built-in **Gemini AI** to help you fix bugs, review code, or generate snippets instantly.
- **Modern UI:** Sleek, dark-themed interface using **Shadcn UI**, **Tailwind CSS**, and **Aceternity UI**.
- **File Management:** Create, edit, delete, and organize files in a collapsible sidebar.
- **Secure Auth:** User authentication with JWT (JSON Web Tokens).

---

## 🛠️ Tech Stack

### **Frontend**
- **Framework:** React (Vite) + TypeScript
- **Styling:** Tailwind CSS, Shadcn UI, Aceternity UI, Framer Motion
- **State Management:** Zustand
- **Editor:** Monaco Editor (`@monaco-editor/react`)
- **Notifications:** Sonner

### **Backend**
- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** MongoDB (Mongoose)
- **Real-time:** Socket.io
- **AI:** Google Gemini API
- **Code Execution:** Piston API (Public)

---

## 🚀 Getting Started

Follow these instructions to set up the project locally.

### **Prerequisites**
- Node.js (v18 or higher)
- MongoDB (Local or Atlas)
- Google Gemini API Key

### **1. Clone the Repository**
```bash
git clone https://github.com/Yogesh-dev318/Code-Editor.git
cd code-editor
npm run build
npm start
```

# Enviroment Vaiables
```bash
PORT=300
MONGO_URI=mongodb+srv://user:password@cluster1000.m.mongodb.net
JWT_SECRET=Your Secret
GEMINI_API_KEY=
NODE_ENV=production
PISTON_API_KEY=
```
