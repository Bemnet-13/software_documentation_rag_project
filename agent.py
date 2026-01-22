import os
from typing import List, TypedDict, Annotated, Literal
import operator
from dotenv import load_dotenv

from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_community.embeddings import HuggingFaceEmbeddings
from langchain_community.vectorstores import Chroma
from langchain_community.document_loaders import WebBaseLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_core.messages import BaseMessage, HumanMessage
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.output_parsers import StrOutputParser
from langchain_core.documents import Document
from langgraph.graph import END, StateGraph

load_dotenv()

# --- Configuration ---
EMBEDDING_MODEL = "all-MiniLM-L6-v2"
LLM_MODEL = "gemini-pro"
GOOGLE_API_KEY = os.getenv("GOOGLE_API_KEY")

# --- Components ---
embeddings = HuggingFaceEmbeddings(model_name=EMBEDDING_MODEL)
llm = ChatGoogleGenerativeAI(model=LLM_MODEL, streaming=True, api_key=GOOGLE_API_KEY)

# --- Vector Store Helper ---
def get_vectorstore(urls: List[str] = None):
    persist_directory = "./chroma_db"
    if urls:
        loader = WebBaseLoader(urls)
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        return Chroma.from_documents(
            documents=splits, 
            embedding=embeddings, 
            persist_directory=persist_directory
        )
    return Chroma(persist_directory=persist_directory, embedding_function=embeddings)

DEFAULT_URLS = ["https://docs.cohere.com/docs/intro-to-rag"] 
vectorstore = get_vectorstore(DEFAULT_URLS) 
retriever = vectorstore.as_retriever()

# --- Dynamic Source Management ---
def add_url_source(url: str):
    """Adds a new URL to the vector store index."""
    try:
        loader = WebBaseLoader([url])
        docs = loader.load()
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents(docs)
        vectorstore.add_documents(splits)
        return True, "URL indexed successfully."
    except Exception as e:
        return False, str(e)

def add_file_source(content: str, filename: str):
    """Adds a file text content to the vector store index."""
    try:
        doc = Document(page_content=content, metadata={"source": filename})
        text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=200)
        splits = text_splitter.split_documents([doc])
        vectorstore.add_documents(splits)
        return True, "File indexed successfully."
    except Exception as e:
        return False, str(e)

# --- LangGraph State ---
class AgentState(TypedDict):
    question: str
    documents: List[Document]
    generation: str

# --- Nodes ---
def retrieve(state: AgentState):
    print("---RETRIEVING FROM VECTOR STORE---")
    question = state["question"]
    documents = retriever.invoke(question)
    return {"documents": documents, "question": question}



def generate(state: AgentState):
    print("---GENERATING---")
    question = state["question"]
    documents = state["documents"]
    prompt = ChatPromptTemplate.from_template("""
    You are a technical documentation assistant. 
    Use the following pieces of retrieved context to answer the question. 
    If you don't know the answer, just say that you don't know. 
    
    Question: {question} 
    Context: {context} 
    
    Answer:
    """)
    chain = prompt | llm | StrOutputParser()
    generation = chain.invoke({"context": documents, "question": question})
    return {"generation": generation}

# --- Build Graph ---
workflow = StateGraph(AgentState)
workflow.add_node("retrieve", retrieve)

workflow.add_node("generate", generate)
workflow.set_entry_point("retrieve")
workflow.add_edge("retrieve", "generate")
workflow.add_edge("generate", END)
app_graph = workflow.compile()

# --- Streaming Interface ---
async def stream_chat(question: str, file_content: str = None):
    full_question = question
    if file_content: # Optional: treat upload as query context only, or index it? 
        # For now, we keep the previous behavior: upload is context for THIS query.
        # But Phase 4 implies uploading to "Sources" means persistent indexing.
        full_question = f"Context from uploaded file:\n{file_content}\n\nUser Question: {question}"

    docs = retriever.invoke(full_question)
    if file_content:
        docs.append(Document(page_content=file_content, metadata={"source": "upload"}))

 

    prompt = ChatPromptTemplate.from_template("""
    You are a technical documentation assistant. 
    Use the following pieces of retrieved context to answer the question. 
    If the context contains code snippets, format them clearly with the language name.
    
    Question: {question} 
    Context: {context} 
    
    Answer:
    """)
    chain = prompt | llm | StrOutputParser()
    async for chunk in chain.astream({"context": docs, "question": full_question}):
        yield chunk