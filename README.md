# Software Documentation RAG Agent

A powerful, full-stack Retrieval-Augmented Generation (RAG) agent designed for technical documentation. This application allows users to index web documentation and local files, and then query them using an intelligent AI assistant with real-time token streaming.

## 🚀 Features

- **Intelligent RAG Workflow**: Built with LangGraph to orchestrate complex retrieval and generation steps.
- **Real-time Streaming**: Smooth, token-by-token response generation for a premium chat experience.
- **Multi-Source Indexing**:
  - **URLs**: Dynamically index web pages using `WebBaseLoader`.
  - **Files**: Upload and index local text files.
- **Modern UI/UX**:
  - **Dark Mode**: Sleek, glassmorphic design system.
  - **Responsive Layout**: Optimized for various screen sizes.
  - **Markdown Support**: Beautifully rendered AI responses with code syntax highlighting.
- **Local Vector Database**: Uses ChromaDB for efficient document storage and retrieval.

## 🛠️ Technology Stack

### Backend
- **Framework**: [FastAPI](https://fastapi.tiangolo.com/)
- **Orchestration**: [LangChain](https://www.langchain.com/) & [LangGraph](https://langchain-ai.github.io/langgraph/)
- **LLM**: Google Gemini Flash
- **Embeddings**: HuggingFace (`all-MiniLM-L6-v2`)
- **Vector Store**: [ChromaDB](https://www.trychroma.com/)
- **Package Manager**: [uv](https://github.com/astral-sh/uv)

### Frontend
- **Framework**: [React](https://reactjs.org/) (Vite)
- **Styling**: Vanilla CSS with Design System
- **Icons**: [Lucide React](https://lucide.dev/)
- **Animations**: [Framer Motion](https://www.framer.com/motion/)

## 📋 Prerequisites

- Python 3.10+
- Node.js 18+
- Google Gemini API Key

## 🛠️ Setup Instructions

### 1. Clone the Repository
```bash
git clone <repository-url>
cd software_documentation_rag_agent
```

### 2. Backend Setup
Create a `.env` file in the root directory:
```env
GOOGLE_API_KEY=your_gemini_api_key_here
```

Install dependencies and run the server:
```bash
# Using uv (recommended)
uv run uvicorn main:app --reload

# Or using pip
pip install -e .
uvicorn main:app --reload
```
The backend will run on `http://127.0.0.1:8000`.

### 3. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
The frontend will run on `http://localhost:5173`.

## 📖 Usage

1. **Add Sources**: Navigate to the "Sources" tab to add documentation URLs or upload local files.
2. **Chat**: Switch to the "Chat" tab and start asking questions.
3. **Reference**: The agent will use the indexed context to provide accurate, documentation-based answers.

## 📁 Project Structure

```text
├── agent.py               # Core LangGraph RAG logic
├── main.py                # FastAPI application & entry point
├── source_manager.py      # Persistence for source metadata
├── chroma_db/             # Local vector store (generated)
├── sources_metadata.json   # Persistent record of indexed sources
├── frontend/
│   ├── src/
│   │   ├── App.jsx        # Main UI component
│   │   ├── hooks/         # Custom React hooks (streaming, etc.)
│   │   └── components/     # UI components (Message, SourcesTab)
│   └── ...
└── ...
```

## ⚠️ Important Note for Windows Users
If you encounter a `PermissionError` when the system attempts to clear `chroma_db` (due to dimension mismatch), please ensure no other processes are accessing the folder and delete it manually if necessary.
