from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import func
from sqlalchemy.orm import Session

from auth import get_optional_user
from database import get_db
from models import Question, User
from schemas import QuestionOut, QuestionWithAnswer

router = APIRouter(prefix="/questions", tags=["questions"])


@router.get("", response_model=list[QuestionOut])
def get_questions(
    category: Optional[str] = None,
    db: Session = Depends(get_db),
    current_user: Optional[User] = Depends(get_optional_user),
):
    limit = 10
    if current_user and current_user.plan == "pro":
        limit = 20

    query = db.query(Question)
    if category:
        query = query.filter(Question.category == category)
    questions = query.order_by(func.random()).limit(limit).all()
    return questions


@router.get("/categories", response_model=list[str])
def get_categories(db: Session = Depends(get_db)):
    rows = db.query(Question.category).distinct().all()
    return [r[0] for r in rows]


@router.get("/{question_id}", response_model=QuestionWithAnswer)
def get_question(question_id: int, db: Session = Depends(get_db)):
    question = db.query(Question).filter(Question.id == question_id).first()
    if not question:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Question not found",
        )
    return question
