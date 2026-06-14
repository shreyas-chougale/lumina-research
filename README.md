# Multi-Agent Research Paper Analysis System

A production-grade AI SaaS application designed to help researchers upload, analyze, chat with, and generate comprehensive literature reviews from multiple research papers simultaneously.

Powered by a LangGraph multi-agent architecture, Groq (Llama 3), ChromaDB (RAG), FastAPI, and React.

**Live Demo: https://lumina-research-nine.vercel.app/**

---

## 🚀 Key Features
- **Multi-Document RAG**: Upload multiple PDFs, chunked and semantically stored in local ChromaDB.
- **Conversational AI**: Real-time streaming chat interface with citation-awareness.
- **Agentic Workflows**: Multi-agent orchestration via LangGraph (Supervisor, Research, Summary, Citation, Comparison, Literature Review Agents).
- **Report Generation**: Automatically synthesize formal literature reviews with PDF and Word export options.
- **Analytics Dashboard**: Real-time insights, metrics, and activity tracking.
- **Full-Stack Auth**: Secure JWT-based authentication backed by MongoDB Atlas.

---

## 🛠️ Tech Stack
**Frontend**: React (Vite), TypeScript, Tailwind CSS, shadcn/ui, Framer Motion, Recharts
**Backend**: FastAPI, Python 3.11, Motor (Async MongoDB), python-jose, passlib
**AI & Data**: LangChain, LangGraph, Groq Llama3, ChromaDB, SentenceTransformers (HuggingFace), PyMuPDF

---

## 💻 Local Development

### 1. Database Setup (MongoDB Atlas)
1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas) and create a free cluster.
2. Under "Database Access", create a user with read/write privileges.
3. Under "Network Access", allow your current IP address (or `0.0.0.0/0` for testing).
4. Get your connection string (URI).

### 2. Backend Setup
1. Open terminal and navigate to the `backend` folder:
   ```bash
   cd backend
   ```
2. Create and activate a virtual environment:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```
3. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```
4. Configure environment variables:
   Copy `.env.example` to `.env` and fill in your keys:
   ```env
   MONGODB_URL=mongodb+srv://...
   DATABASE_NAME=research_platform
   SECRET_KEY=your_secure_random_key
   GROQ_API_KEY=gsk_your_api_key
   ```
5. Run the development server:
   ```bash
   uvicorn app.main:app --reload
   ```
   The backend will be available at `http://localhost:8000`.

### 3. Frontend Setup
1. Open a new terminal and navigate to the `frontend` folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   Create a `.env` file in the frontend root:
   ```env
   VITE_API_URL=http://localhost:8000/api
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

---

## 🌍 Production Deployment

### 1. Deploying the Backend (Render)
1. Push your code to a GitHub repository.
2. Go to [Render](https://render.com) and create a new **Web Service**.
3. Connect your repository and select the `backend` directory as the Root Directory.
4. Set the Build Command:
   ```bash
   pip install -r requirements.txt
   ```
5. Set the Start Command:
   ```bash
   uvicorn app.main:app --host 0.0.0.0 --port $PORT
   ```
6. Add your Environment Variables:
   - `MONGODB_URL`
   - `DATABASE_NAME`
   - `SECRET_KEY`
   - `GROQ_API_KEY`
   - `FRONTEND_URL` (Set this to your Vercel frontend URL once deployed, e.g., `https://my-app.vercel.app`)

### 2. Deploying the Frontend (Vercel)
1. Go to [Vercel](https://vercel.com) and import your GitHub repository.
2. During setup, configure the Root Directory to `frontend`.
3. Vercel will automatically detect Vite. The build command (`npm run build`) and output directory (`dist`) will be pre-filled.
4. Add your Environment Variables:
   - `VITE_API_URL`: Your Render backend URL + `/api` (e.g., `https://my-backend.onrender.com/api`)
5. Click **Deploy**.

> **Note on ChromaDB**: The current implementation uses a local persistent ChromaDB directory (`chroma_db`). When deploying the backend to a serverless/ephemeral environment like Render, file uploads will not persist across server restarts unless you mount a Persistent Disk. For a production RAG application, you should migrate the ChromaDB configuration to use a managed vector database (e.g., Pinecone, Weaviate, or ChromaDB Cloud) or attach a persistent volume to your Render web service.
