from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from auth import get_current_user
from database import get_db
from models import ExamSession, User
from schemas import SessionCreate, SessionOut

router = APIRouter(prefix="/sessions", tags=["sessions"])


@router.post("", response_model=SessionOut, status_code=status.HTTP_201_CREATED)
def create_session(
    payload: SessionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    exam_session = ExamSession(
        user_id=current_user.id,
        score=payload.score,
        total=payload.total,
        category=payload.category,
    )
    db.add(exam_session)
    db.commit()
    db.refresh(exam_session)
    return exam_session


@router.get("/me", response_model=list[SessionOut])
def my_sessions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    sessions = (
        db.query(ExamSession)
        .filter(ExamSession.user_id == current_user.id)
        .order_by(ExamSession.taken_at.desc())
        .limit(20)
        .all()
    )
    return sessions
