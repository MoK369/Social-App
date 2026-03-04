# ⭐ **Social App Backend (Node.js + TypeScript + MongoDB)**

A fully‑featured **social media backend API** built with **Node.js**, **TypeScript**, **Express 5**, **MongoDB (Mongoose)**, **Socket.IO**, and **AWS S3** for media storage.  
This project includes **authentication**, **posts**, **comments**, **real‑time chat**, **email verification**, **file uploads**, **security middlewares**, and a clean **modular architecture**.

***

## 📌 **Features**

### 🔐 **Authentication & Security**

*   JWT Authentication (Access & Refresh Tokens)
*   Secure password hashing with **bcrypt**
*   Email verification & password reset (via **nodemailer**)
*   Input validation using **Zod**
*   Rate limiting (express‑rate‑limit)
*   HTTP security headers (helmet)

### 👤 **User Module**

*   Profile management
*   Update account details
*   Upload profile pictures (Multer + AWS S3)
*   Follow / Unfollow

### 📝 **Posts Module**

*   Create, update, delete posts
*   Upload images
*   Like / Unlike posts
*   Get feed of posts

### 💬 **Comments Module**

*   Add, update, delete comments
*   Replies support

### ⚡ **Real‑Time Chat**

*   Private messaging using **Socket.IO**
*   Online/Offline tracking
*   Message persistence

### ☁ **AWS S3 Uploads**

*   Uploading images to AWS S3 using:
    *   `@aws-sdk/client-s3`
    *   `@aws-sdk/lib-storage`
    *   `@aws-sdk/s3-request-presigner`

### 🛠️ **Utilities & Architecture**

*   Custom exceptions / error filters
*   Reusable middlewares
*   Global handlers
*   URL utilities, DTOs, entities
*   Modular, scalable folder structure

***

## 📁 **Project Structure**

    src/
    │── app.controller.ts
    │── index.ts
    │
    ├── db/
    │   ├── db.connection.ts
    │   ├── interfaces/
    │   ├── models/
    │   └── repository/
    │
    ├── middlewares/
    │   └── validation.middleware.ts
    │
    ├── modules/
    │   ├── auth/
    │   │   ├── auth.controller.ts
    │   │   ├── auth.dto.ts
    │   │   ├── auth.validation.ts
    │   │   ├── auth.service.ts
    │   │   └── auth.entities.ts
    │   │
    │   ├── user/
    │   ├── post/
    │   ├── comment/
    │   ├── chat/
    │   ├── gateway/   ← WebSockets
    │   └── module.routes.ts
    │
    ├── utils/
    │   ├── events/
    │   ├── handlers/
    │   ├── filter/
    │   ├── exceptions/
    │   ├── multer/
    │   ├── security/
    │   ├── stream/
    │   ├── types/
    │   └── url/
    │
    └── uploads/ (temp local uploads)

***

## 🧰 **Tech Stack**

| Area           | Technology               |
| -------------- | ------------------------ |
| Runtime        | Node.js + TypeScript     |
| Framework      | Express 5                |
| Database       | MongoDB (Mongoose)       |
| Real‑time      | Socket.IO                |
| Storage        | AWS S3                   |
| Validation     | Zod                      |
| Authentication | JWT + Bcrypt             |
| Email          | Nodemailer               |
| Security       | Helmet, Rate Limit, CORS |
| File Upload    | Multer                   |

***

## 🚀 **Setup Instructions**

### 1. **Clone the repository**

```bash
git clone https://github.com/YOUR_USERNAME/social_app.git
cd social_app
```

### 2. **Install dependencies**

```bash
npm install
```

### 3. **Environment Variables**

Create the file:

    /config/.env.development

Example:

```env
PORT=5000
MONGO_URI=
JWT_SECRET=
JWT_REFRESH_SECRET=
EMAIL_HOST=
EMAIL_PORT=
EMAIL_USER=
EMAIL_PASS=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=
AWS_BUCKET_NAME=
AWS_REGION=
```

### 4. **Run in Development**

```bash
npm run start:dev
```

The app will automatically watch TS files using **tsc-watch**.

***

## 🔌 **API Overview (High-Level)**

### **Auth**

*   `POST /auth/register`
*   `POST /auth/login`
*   `POST /auth/verify-email`
*   `POST /auth/refresh-token`
*   `POST /auth/forgot-password`

### **User**

*   `GET /user/me`
*   `PUT /user/update`
*   `POST /user/upload-avatar`

### **Posts**

*   `POST /post`
*   `GET /post/:id`
*   `DELETE /post/:id`
*   `POST /post/:id/like`

### **Comments**

*   `POST /comment`
*   `DELETE /comment/:id`

### **Chat (Socket.IO)**

*   `/chat/connect`
*   `/chat/send-message`

***

## 🔄 **Real‑Time Chat Flow (Diagram)**

    Client ----connect----> Gateway
    Client ----sendMessage----> Gateway
    Gateway ----store message----> MongoDB
    Gateway ----emit to receiver----> Client

***

## 🏗️ **Architecture Overview**

    Controller → Validation (Zod) → Service → Repository → Database
                             ↓
                          Middlewares
                             ↓
                         Utilities (security, multer, handlers)

***

## 📜 License

ISC

***

## 🙌 Author

Backend Diploma Project by **YOU** (Your Name Here)

***
