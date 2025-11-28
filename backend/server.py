from fastapi import FastAPI, APIRouter, HTTPException, Header
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
import os
import logging
from pathlib import Path
from pydantic import BaseModel
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import bcrypt
from supabase import create_client, Client

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Supabase client
supabase_url = os.environ['SUPABASE_URL']
supabase_key = os.environ['SUPABASE_ANON_KEY']
supabase: Client = create_client(supabase_url, supabase_key)

app = FastAPI()
api_router = APIRouter(prefix="/api")

# Models
class CoachLogin(BaseModel):
    password: str

class CoachLoginResponse(BaseModel):
    success: bool
    token: Optional[str] = None

class StudentCreate(BaseModel):
    ad: str
    soyad: Optional[str] = None
    bolum: str
    hedef: Optional[str] = None
    notlar: Optional[str] = None

class StudentResponse(BaseModel):
    id: str
    ad: str
    soyad: Optional[str] = None
    bolum: str
    hedef: Optional[str] = None
    notlar: Optional[str] = None
    token: str
    created_at: str

class TopicCreate(BaseModel):
    student_id: str
    ders: str
    konu: str
    durum: str = "baslanmadi"
    order_index: int = 0

class TopicUpdate(BaseModel):
    durum: Optional[str] = None
    order_index: Optional[int] = None

class TaskCreate(BaseModel):
    student_id: str
    aciklama: str
    sure: int
    tarih: str
    gun: str
    order_index: int = 0
    completed: bool = False

class TaskUpdate(BaseModel):
    aciklama: Optional[str] = None
    sure: Optional[int] = None
    tarih: Optional[str] = None
    gun: Optional[str] = None
    order_index: Optional[int] = None
    completed: Optional[bool] = None

class ExamCreate(BaseModel):
    student_id: str
    tarih: str
    sinav_tipi: str
    ders: str
    dogru: int
    yanlis: int

class CalendarNoteCreate(BaseModel):
    student_id: str
    date: str
    note: str

class CalendarNoteUpdate(BaseModel):
    note: str

# Coach Authentication
@api_router.post("/coach/login", response_model=CoachLoginResponse)
async def coach_login(login: CoachLogin):
    # Simple password check (in production, use proper password hash)
    if login.password == "coach2025":
        return CoachLoginResponse(success=True, token="coach-token-12345")
    raise HTTPException(status_code=401, detail="Şifre hatalı")

# Students
@api_router.get("/students")
async def get_students():
    response = supabase.table("students").select("*").execute()
    return response.data

@api_router.post("/students", response_model=dict)
async def create_student(student: StudentCreate):
    student_token = str(uuid.uuid4())
    data = {
        "id": str(uuid.uuid4()),
        "ad": student.ad,
        "soyad": student.soyad,
        "bolum": student.bolum,
        "hedef": student.hedef,
        "notlar": student.notlar,
        "token": student_token,
        "created_at": datetime.now(timezone.utc).isoformat()
    }
    response = supabase.table("students").insert(data).execute()
    return response.data[0]

@api_router.get("/students/{student_id}")
async def get_student(student_id: str):
    response = supabase.table("students").select("*").eq("id", student_id).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı")
    return response.data[0]

@api_router.get("/students/token/{token}")
async def get_student_by_token(token: str):
    response = supabase.table("students").select("*").eq("token", token).execute()
    if not response.data:
        raise HTTPException(status_code=404, detail="Öğrenci bulunamadı")
    return response.data[0]

@api_router.put("/students/{student_id}")
async def update_student(student_id: str, student: StudentCreate):
    data = {
        "ad": student.ad,
        "soyad": student.soyad,
        "bolum": student.bolum,
        "hedef": student.hedef,
        "notlar": student.notlar
    }
    response = supabase.table("students").update(data).eq("id", student_id).execute()
    return response.data[0]

@api_router.delete("/students/{student_id}")
async def delete_student(student_id: str):
    # Delete related data first
    supabase.table("topics").delete().eq("student_id", student_id).execute()
    supabase.table("tasks").delete().eq("student_id", student_id).execute()
    supabase.table("exams").delete().eq("student_id", student_id).execute()
    supabase.table("calendar_notes").delete().eq("student_id", student_id).execute()
    
    response = supabase.table("students").delete().eq("id", student_id).execute()
    return {"success": True}

# Topics
@api_router.get("/topics/{student_id}")
async def get_topics(student_id: str):
    response = supabase.table("topics").select("*").eq("student_id", student_id).order("order_index").execute()
    return response.data

@api_router.post("/topics")
async def create_topic(topic: TopicCreate):
    data = {
        "id": str(uuid.uuid4()),
        "student_id": topic.student_id,
        "ders": topic.ders,
        "konu": topic.konu,
        "durum": topic.durum,
        "order_index": topic.order_index
    }
    response = supabase.table("topics").insert(data).execute()
    return response.data[0]

@api_router.put("/topics/{topic_id}")
async def update_topic(topic_id: str, topic: TopicUpdate):
    data = {k: v for k, v in topic.model_dump().items() if v is not None}
    response = supabase.table("topics").update(data).eq("id", topic_id).execute()
    return response.data[0]

@api_router.delete("/topics/{topic_id}")
async def delete_topic(topic_id: str):
    response = supabase.table("topics").delete().eq("id", topic_id).execute()
    return {"success": True}

@api_router.post("/topics/init/{student_id}")
async def init_topics(student_id: str, bolum: str):
    """Initialize default topics for a student based on their bolum"""
    topics = []
    
    # TYT Topics for all students
    tyt_topics = [
        {"ders": "Türkçe", "konu": "Sözcükte Anlam"},
        {"ders": "Türkçe", "konu": "Cümlede Anlam"},
        {"ders": "Türkçe", "konu": "Paragraf"},
        {"ders": "Matematik", "konu": "Temel Kavramlar"},
        {"ders": "Matematik", "konu": "Fonksiyonlar"},
        {"ders": "Matematik", "konu": "Geometri"},
        {"ders": "Sosyal", "konu": "Tarih - Osmanlı"},
        {"ders": "Sosyal", "konu": "Coğrafya - Türkiye"},
        {"ders": "Sosyal", "konu": "Felsefe - Bilgi"},
        {"ders": "Fizik", "konu": "Hareket"},
        {"ders": "Fizik", "konu": "Kuvvet"},
        {"ders": "Kimya", "konu": "Atom"},
        {"ders": "Kimya", "konu": "Mol Kavramı"},
        {"ders": "Biyoloji", "konu": "Hücre"},
        {"ders": "Biyoloji", "konu": "Mitoz"},
    ]
    
    for idx, topic in enumerate(tyt_topics):
        data = {
            "id": str(uuid.uuid4()),
            "student_id": student_id,
            "ders": topic["ders"],
            "konu": topic["konu"],
            "durum": "baslanmadi",
            "order_index": idx
        }
        response = supabase.table("topics").insert(data).execute()
        topics.extend(response.data)
    
    # AYT Topics based on bolum
    if bolum == "Sayısal":
        ayt_topics = [
            {"ders": "Matematik AYT", "konu": "Limit"},
            {"ders": "Matematik AYT", "konu": "Türev"},
            {"ders": "Fizik AYT", "konu": "Elektrik"},
            {"ders": "Fizik AYT", "konu": "Manyetizma"},
            {"ders": "Kimya AYT", "konu": "Kimyasal Tepkimeler"},
            {"ders": "Biyoloji AYT", "konu": "Kalıtım"},
        ]
        for idx, topic in enumerate(ayt_topics):
            data = {
                "id": str(uuid.uuid4()),
                "student_id": student_id,
                "ders": topic["ders"],
                "konu": topic["konu"],
                "durum": "baslanmadi",
                "order_index": len(tyt_topics) + idx
            }
            response = supabase.table("topics").insert(data).execute()
            topics.extend(response.data)
    
    elif bolum == "Eşit Ağırlık":
        ayt_topics = [
            {"ders": "Matematik AYT", "konu": "Limit"},
            {"ders": "Matematik AYT", "konu": "Türev"},
            {"ders": "Edebiyat", "konu": "Tanzimat Edebiyatı"},
            {"ders": "Tarih", "konu": "Osmanlı Tarihi"},
            {"ders": "Coğrafya", "konu": "Türkiye Coğrafyası"},
        ]
        for idx, topic in enumerate(ayt_topics):
            data = {
                "id": str(uuid.uuid4()),
                "student_id": student_id,
                "ders": topic["ders"],
                "konu": topic["konu"],
                "durum": "baslanmadi",
                "order_index": len(tyt_topics) + idx
            }
            response = supabase.table("topics").insert(data).execute()
            topics.extend(response.data)
    
    elif bolum == "Sözel":
        ayt_topics = [
            {"ders": "Edebiyat", "konu": "Tanzimat Edebiyatı"},
            {"ders": "Edebiyat", "konu": "Servetifünun"},
            {"ders": "Tarih", "konu": "Osmanlı Tarihi"},
            {"ders": "Tarih", "konu": "Türkiye Cumhuriyeti"},
            {"ders": "Coğrafya", "konu": "Türkiye Coğrafyası"},
            {"ders": "Felsefe", "konu": "Bilgi Felsefesi"},
        ]
        for idx, topic in enumerate(ayt_topics):
            data = {
                "id": str(uuid.uuid4()),
                "student_id": student_id,
                "ders": topic["ders"],
                "konu": topic["konu"],
                "durum": "baslanmadi",
                "order_index": len(tyt_topics) + idx
            }
            response = supabase.table("topics").insert(data).execute()
            topics.extend(response.data)
    
    return topics

# Tasks
@api_router.get("/tasks/{student_id}")
async def get_tasks(student_id: str):
    response = supabase.table("tasks").select("*").eq("student_id", student_id).order("tarih").order("order_index").execute()
    return response.data

@api_router.post("/tasks")
async def create_task(task: TaskCreate):
    data = {
        "id": str(uuid.uuid4()),
        "student_id": task.student_id,
        "aciklama": task.aciklama,
        "sure": task.sure,
        "tarih": task.tarih,
        "gun": task.gun,
        "order_index": task.order_index,
        "completed": task.completed
    }
    response = supabase.table("tasks").insert(data).execute()
    return response.data[0]

@api_router.put("/tasks/{task_id}")
async def update_task(task_id: str, task: TaskUpdate):
    data = {k: v for k, v in task.model_dump().items() if v is not None}
    response = supabase.table("tasks").update(data).eq("id", task_id).execute()
    return response.data[0]

@api_router.delete("/tasks/{task_id}")
async def delete_task(task_id: str):
    response = supabase.table("tasks").delete().eq("id", task_id).execute()
    return {"success": True}

# Exams
@api_router.get("/exams/{student_id}")
async def get_exams(student_id: str):
    response = supabase.table("exams").select("*").eq("student_id", student_id).order("tarih", desc=True).execute()
    # Calculate net for each exam
    for exam in response.data:
        exam["net"] = exam["dogru"] - (exam["yanlis"] * 0.25)
    return response.data

@api_router.post("/exams")
async def create_exam(exam: ExamCreate):
    net = exam.dogru - (exam.yanlis * 0.25)
    data = {
        "id": str(uuid.uuid4()),
        "student_id": exam.student_id,
        "tarih": exam.tarih,
        "sinav_tipi": exam.sinav_tipi,
        "ders": exam.ders,
        "dogru": exam.dogru,
        "yanlis": exam.yanlis,
        "net": net
    }
    response = supabase.table("exams").insert(data).execute()
    return response.data[0]

@api_router.delete("/exams/{exam_id}")
async def delete_exam(exam_id: str):
    response = supabase.table("exams").delete().eq("id", exam_id).execute()
    return {"success": True}

# Calendar Notes
@api_router.get("/calendar/{student_id}")
async def get_calendar_notes(student_id: str):
    response = supabase.table("calendar_notes").select("*").eq("student_id", student_id).order("date").execute()
    return response.data

@api_router.post("/calendar")
async def create_calendar_note(note: CalendarNoteCreate):
    data = {
        "id": str(uuid.uuid4()),
        "student_id": note.student_id,
        "date": note.date,
        "note": note.note
    }
    response = supabase.table("calendar_notes").insert(data).execute()
    return response.data[0]

@api_router.put("/calendar/{note_id}")
async def update_calendar_note(note_id: str, note: CalendarNoteUpdate):
    data = {"note": note.note}
    response = supabase.table("calendar_notes").update(data).eq("id", note_id).execute()
    return response.data[0]

@api_router.delete("/calendar/{note_id}")
async def delete_calendar_note(note_id: str):
    response = supabase.table("calendar_notes").delete().eq("id", note_id).execute()
    return {"success": True}

app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)