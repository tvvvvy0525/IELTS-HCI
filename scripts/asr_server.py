from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from faster_whisper import WhisperModel
import uvicorn
import os
import tempfile

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
print("Loading Whisper model...")
model = WhisperModel("small", device="cpu", compute_type="int8")
print("Model loaded successfully!")

@app.get("/health")
def health():
    return {"status": "ok", "service": "Local ASR"}

@app.post("/transcribe")
async def transcribe(file: UploadFile = File(...), lang: str = Form("en")):
    """
    转写接口
    接收 multipart/form-data 格式的音频文件
    """
    temp_file_path = None
    try:
        content = await file.read()
        print(f"\n[ASR] 收到音频文件: {file.filename}, 大小: {len(content)} 字节")
        
        if len(content) < 1000:
            print("[ASR] 警告：音频文件过小，可能没有录入声音。")
            
        with tempfile.NamedTemporaryFile(delete=False, suffix=".webm") as temp_file:
            temp_file.write(content)
            temp_file_path = temp_file.name
        
        # whisper 只接受 2 位的语言代码
        clean_lang = lang[:2] if len(lang) > 2 else lang
        
        print(f"[ASR] 开始转写，指定语言: {clean_lang} (原参数: {lang})...")
        # 开启 word_timestamps=True 以获取词级置信度
        segments, info = model.transcribe(temp_file_path, language=clean_lang, beam_size=5, word_timestamps=True)
        
        print(f"[ASR] 探测语种: {info.language} (概率: {info.language_probability:.2f})")
        
        total_prob = 0.0
        word_count = 0
        text_parts = []
        
        # 遍历片段和单词，累加置信度
        for segment in segments:
            text_parts.append(segment.text)
            if segment.words:
                for word in segment.words:
                    total_prob += word.probability
                    word_count += 1
        
        # 计算平均置信度
        avg_confidence = total_prob / word_count if word_count > 0 else 0.0
        text = "".join(text_parts)
        
        print(f"[ASR] 识别出 {word_count} 个单词，平均置信度: {avg_confidence:.2f}")
        print(f"[ASR] 最终文本: {text.strip()}")
        
        return {
            "text": text.strip(),
            "confidence": avg_confidence,
            "language": info.language
        }
    except Exception as e:
        print(f"[ASR] 转写过程发生错误: {e}")
        return {"error": str(e), "text": "", "confidence": 0.0}
    finally:
        # 清理临时文件
        if temp_file_path and os.path.exists(temp_file_path):
            os.remove(temp_file_path)

if __name__ == "__main__":
    # 启动服务，监听 8765 端口
    print("Starting ASR server on http://127.0.0.1:8765")
    uvicorn.run(app, host="127.0.0.1", port=8765)
