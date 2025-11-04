# Pura Admin Dashboard

Pura Admin Dashboard is an admin panel built with **Next.js 16**, **Tailwind CSS**, **shadcn/ui**, and **TypeScript**. It is designed to manage the website content of Pura Agung Kertajaya with a clean UI, secure authentication, and smooth animations.

---

## 🚀 Tech Stack

- **Next.js 16 (App Router)**
- **React + TypeScript**
- **Tailwind CSS**
- **shadcn/ui components**
- **Google reCAPTCHA v3**
- **Lottie Animations**
- **Lucide Icons**

---

## ✅ Features

### 🔐 Authentication
- Admin login page  
- Email & password validation  
- Google reCAPTCHA v3 integration  
- Auto-redirect when logged in  

### 🎨 UI/UX
- Clean responsive layout  
- Light & Dark mode  
- Custom animations with Lottie  

---

## 🏁 Getting Started

Follow the steps below to run this project on your local machine.

---

### 1. Prerequisites

Make sure you have the following installed:

- **Node.js v18.0** or newer  
- **pnpm** (recommended)

Install `pnpm` globally if you don’t have it:

```bash
npm install -g pnpm
```

### 2. Project Installation

1.  **Clone this repository**:
    ```bash
    git clone https://github.com/JonathanGunawan30/pura-agung-kertajaya-cms-frontend.git
    ```

2.  **Install all project dependencies**:
    ```bash
    pnpm install
    ```

### 3. Environment Variables Configuration

This project requires a **Google reCAPTCHA v3 Site Key**.

1.  Copy the example environment file:
    ```bash
    cp .env.example .env
    ```

2.  Open `.env` and add your Site Key:
    ```
    NEXT_PUBLIC_RECAPTCHA_SITE_KEY=YOUR_SITE_KEY_GOES_HERE
    ```

### 4. Running the Application

1.  Start the development server:
    ```bash
    pnpm dev
    ```

2.  Open your browser and visit:
    http://localhost:3000

---

## 📜 Available Scripts

Inside the project directory:

- `pnpm dev`: Run the app in development mode
- `pnpm build`: Build the app for production
- `pnpm start`: Run the production build
- `pnpm lint`: Run ESLint