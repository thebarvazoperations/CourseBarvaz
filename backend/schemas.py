import datetime
from typing import Optional

from pydantic import BaseModel, EmailStr


# ── Auth ────────────────────────────────────────────────────────────────────


class UserRegister(BaseModel):
    email: EmailStr
    password: str
    name: Optional[str] = None


class UserLogin(BaseModel):
    email: EmailStr
    password: str


class Token(BaseModel):
    access_token: str
    token_type: str


class UserOut(BaseModel):
    id: int
    email: str
    name: Optional[str] = None
    plan: str

    model_config = {"from_attributes": True}


# ── Questions ───────────────────────────────────────────────────────────────


class QuestionOut(BaseModel):
    id: int
    question_text: str
    opt_a: str
    opt_b: str
    opt_c: str
    opt_d: str
    category: str
    difficulty: int

    model_config = {"from_attributes": True}


class QuestionWithAnswer(QuestionOut):
    correct_ans: str


# ── Exam Sessions ──────────────────────────────────────────────────────────


class SessionCreate(BaseModel):
    score: int
    total: int
    category: Optional[str] = None


class SessionOut(BaseModel):
    id: int
    score: int
    total: int
    category: Optional[str] = None
    taken_at: datetime.datetime

    model_config = {"from_attributes": True}
