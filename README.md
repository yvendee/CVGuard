# Create T3 App

This is a [T3 Stack](https://create.t3.gg/) project bootstrapped with `create-t3-app`.

## What's next? How do I make an app with this?

We try to keep this project as simple as possible, so you can start with just the scaffolding we set up for you, and add additional things later when they become necessary.

If you are not familiar with the different technologies used in this project, please refer to the respective docs. If you still are in the wind, please join our [Discord](https://t3.gg/discord) and ask for help.

- [Next.js](https://nextjs.org)
- [NextAuth.js](https://next-auth.js.org)
- [Prisma](https://prisma.io)
- [Drizzle](https://orm.drizzle.team)
- [Tailwind CSS](https://tailwindcss.com)
- [tRPC](https://trpc.io)

## Learn More

To learn more about the [T3 Stack](https://create.t3.gg/), take a look at the following resources:

- [Documentation](https://create.t3.gg/)
- [Learn the T3 Stack](https://create.t3.gg/en/faq#what-learning-resources-are-currently-available) — Check out these awesome tutorials

You can check out the [create-t3-app GitHub repository](https://github.com/t3-oss/create-t3-app) — your feedback and contributions are welcome!

## How do I deploy this?

Follow our deployment guides for [Vercel](https://create.t3.gg/en/deployment/vercel), [Netlify](https://create.t3.gg/en/deployment/netlify) and [Docker](https://create.t3.gg/en/deployment/docker) for more information.



# 📄 CVGuard

CVGuard is a simple full-stack web application that allows users to upload their CV (in PDF format) and enter personal details (name, email, phone, skills, and experience). The app uses the [DeepSeek API](https://deepseek.com) to compare the entered information against the actual content of the uploaded CV to check for consistency.

---

## ✨ Features

- Upload a CV in PDF format
- Enter user details via a form
- Extract text from PDF on the server
- Compare form input with PDF content using DeepSeek's ChatCompletion API
- Display match results in a modal (Success ❇️ or Not a Match ❌)
- Dockerized for easy deployment

---

## 🛠️ Tech Stack

- **Next.js** (React) — Frontend + Backend (API routes)
- **Formidable** — To handle file uploads (multipart form data)
- **pdf-parse** — For extracting text from PDF files
- **DeepSeek** — OpenAI-compatible LLM API
- **Tailwind CSS** — UI styling
- **Docker** + **Docker Compose** — Containerization

---

## 🚀 How It Works

1. User fills in their full name, email, phone, skills, and experience.
2. User uploads a CV (PDF).
3. The server extracts text from the PDF and sends both the form data and the PDF content to the DeepSeek API.
4. The LLM compares the two and replies whether they match or what differs.
5. A modal pops up showing either a **"Match"** or a **"Doesn't Match"** message.

---

## 🧑‍💻 Running Locally (Without Docker)

> Make sure you have **Node.js 18+** installed.

### 1. Clone the repo

```bash
git clone https://github.com/yourusername/cvguard.git
cd cvguard
````

### 2. Install dependencies

```bash
npm install
```

### 3. Create a `.env` file

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
AUTH_DISCORD_ID=your_discord_client_id
AUTH_DISCORD_SECRET=your_discord_secret
```

### 4. Start the dev server

```bash
npm run dev
```

Visit: [http://localhost:3000/upload](http://localhost:3000/upload)

---

## 🐳 Running with Docker

This app includes a `Dockerfile` and `docker-compose.yml` to build and run the containerized app locally.

### 1. Set environment variables

Create a `.env` file in the project root:

```env
DEEPSEEK_API_KEY=your_deepseek_api_key
AUTH_DISCORD_ID=your_discord_client_id
AUTH_DISCORD_SECRET=your_discord_secret
```

### 2. Build and run the container

```bash
docker-compose up --build
```

This will:

* Build the Docker image
* Install dependencies
* Build the app for production
* Start the app on port **3000**

### 3. Visit in browser

Go to:
👉 [http://localhost:3000/upload](http://localhost:3000/upload)

---

## 📁 Project Structure

```
/src
  /pages
    upload.tsx             # Upload form and UI
    /api
      upload-cv.ts         # Handles PDF upload and text extraction
      deepseek.ts          # Sends request to DeepSeek API

/uploads                  # Temporary PDF uploads
/public                   # Static assets (auto-handled by Next.js)
```


