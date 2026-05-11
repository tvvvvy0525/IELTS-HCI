from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import uvicorn
import os

app = FastAPI(title="SHUI IELTS Local ASR Service")

# 解决跨域问题，允许前端应用访问
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 初始化 Whisper 模型
# "base" 模型大小适中（约 140MB），准确率不错，适合 CPU 运行。
# 如果性能不够，可以换成 "tiny"；如果追求更高准确率，可以换成 "small" 或 "medium"。
print("Loading Whisper model...")
model = WhisperModel("base", device="cpu", compute_type="int8")
print("Model loaded successfully!")

@app.get("/health")
def health():
    """健康检查接口，前端用来检测服务是否在线"""
    return {"status": "ok", "service": "Local ASR"}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), lang: str = Form("en")):
    """
    转写接口
    接收 multipart/form-data 格式的音频文件
    """
    # 保存上传的 WebM 音频文件为临时文件
    temp_filename = "temp_recording.webm"
    try:
        content = await file.read()
        with open(temp_filename, "wb") as f:
            f.write(content)
        
        # 使用 faster-whisper 进行转写
        # beam_size=5 是默认值，增大可以提高准确率但变慢
        segments, info = model.transcribe(temp_filename, language=lang, beam_size=5)
        
        text = "".join([segment.text for segment in segments])
        
        return {
            "text": text.strip(),
            "confidence": 1.0, # faster-whisper 不直接返回整体置信度，这里填 1.0
            "language": info.language
        }
    except Exception as e:
        return {"error": str(e), "text": ""}
    finally:
        # 无论成功失败，都清理临时文件
        if os.path.exists(temp_filename):
            os.remove(temp_filename)

if __name__ == "__main__":
    # 启动服务，监听 8765 端口
    print("Starting ASR server on http://127.0.0.1:8765")
    uvicorn.run(app, host="127.0.0.1", port=8765)
