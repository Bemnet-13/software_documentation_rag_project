from fastapi import FastAPI, UploadFile, File, Form, HTTPException
from fastapi.responses import StreamingResponse
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from agent import stream_chat, add_url_source, add_file_source
from source_manager import source_manager
import uvicorn
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI()

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class UrlSource(BaseModel):
    url: str

@app.get('/')
async def hello_world():
    return {"message": "Documentation Agent Backend is running"}

@app.get('/sources')
async def get_sources():
    return source_manager.get_sources()

@app.post('/chat')
async def chat_endpoint(
    text: str = Form(...),
    file: UploadFile = File(None)
):
    file_content = None
    if file:
        content = await file.read()
        file_content = content.decode('utf-8', errors='ignore')

    async def event_generator():
        async for chunk in stream_chat(text, file_content):
            yield chunk

    return StreamingResponse(event_generator(), media_type='text/plain')

@app.post('/sources/url')
async def add_url(source: UrlSource):
    logger.info(f"Adding URL source: {source.url}")
    # 1. Index in Vector Store
    success, message = add_url_source(source.url)
    if not success:
        raise HTTPException(status_code=400, detail=message)
    
    # 2. Persist Metadata
    source_manager.add_source(type="url", title=source.url, source=source.url, url=source.url)
    return {"message": message}

@app.post('/sources/file')
async def add_file(file: UploadFile = File(...)):
    logger.info(f"Adding file source: {file.filename}")
    try:
        content = await file.read()
        file_content = content.decode('utf-8', errors='ignore')
        
        # 1. Index in Vector Store
        success, message = add_file_source(file_content, file.filename)
        if not success:
             raise HTTPException(status_code=400, detail=message)
        
        # 2. Persist Metadata
        source_manager.add_source(type="file", title=file.filename, source=file.filename)
        return {"message": message}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
