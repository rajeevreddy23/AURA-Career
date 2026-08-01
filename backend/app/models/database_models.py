from sqlalchemy import Column, String, Integer, Float, Boolean, DateTime, JSON, ForeignKey, Text, Enum as SAEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
import enum
from ..core.database import Base

class UserRole(str, enum.Enum):
    student = "student"
    teacher = "teacher"
    admin = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(String(128), primary_key=True)
    email = Column(String(255), unique=True, index=True)
    display_name = Column(String(255))
    photo_url = Column(String(1024))
    role = Column(SAEnum(UserRole), default=UserRole.student)
    email_verified = Column(Boolean, default=False)
    phone_number = Column(String(20), nullable=True)

    settings = Column(JSON, default=dict)
    learning_preferences = Column(JSON, default=dict)
    statistics = Column(JSON, default=dict)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_login = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    enrollments = relationship("Enrollment", back_populates="user")
    quiz_results = relationship("QuizResult", back_populates="user")
    certificates = relationship("Certificate", back_populates="user")

class Course(Base):
    __tablename__ = "courses"

    id = Column(String(128), primary_key=True)
    title = Column(String(255), index=True)
    description = Column(Text)
    category = Column(String(50))
    level = Column(String(20))
    language = Column(String(10), default="en")
    thumbnail = Column(String(1024))
    instructor_id = Column(String(128), ForeignKey("users.id"))
    modules = Column(JSON, default=list)
    total_duration = Column(Integer, default=0)
    total_lessons = Column(Integer, default=0)
    rating = Column(Float, default=0)
    enrolled_count = Column(Integer, default=0)
    price = Column(Float, default=0)
    prerequisites = Column(JSON, default=list)
    learning_outcomes = Column(JSON, default=list)
    tags = Column(JSON, default=list)
    has_certificate = Column(Boolean, default=True)
    is_published = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    enrollments = relationship("Enrollment", back_populates="course")

class Enrollment(Base):
    __tablename__ = "enrollments"

    id = Column(String(128), primary_key=True)
    user_id = Column(String(128), ForeignKey("users.id"))
    course_id = Column(String(128), ForeignKey("courses.id"))
    progress = Column(Float, default=0)
    completed_lessons = Column(JSON, default=list)
    started_at = Column(DateTime(timezone=True), server_default=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    user = relationship("User", back_populates="enrollments")
    course = relationship("Course", back_populates="enrollments")

class QuizResult(Base):
    __tablename__ = "quiz_results"

    id = Column(String(128), primary_key=True)
    user_id = Column(String(128), ForeignKey("users.id"))
    course_id = Column(String(128))
    quiz_id = Column(String(128))
    score = Column(Float)
    total_points = Column(Float)
    percentage = Column(Float)
    passed = Column(Boolean)
    answers = Column(JSON)
    time_taken = Column(Integer)
    attempts = Column(Integer, default=1)
    completed_at = Column(DateTime(timezone=True), server_default=func.now())

    user = relationship("User", back_populates="quiz_results")

class Certificate(Base):
    __tablename__ = "certificates"

    id = Column(String(128), primary_key=True)
    user_id = Column(String(128), ForeignKey("users.id"))
    course_id = Column(String(128))
    course_name = Column(String(255))
    student_name = Column(String(255))
    verification_id = Column(String(64), unique=True, index=True)
    grade = Column(String(10))
    score = Column(Float)
    total_hours = Column(Integer)
    skills = Column(JSON, default=list)
    issue_date = Column(DateTime(timezone=True), server_default=func.now())
    is_verified = Column(Boolean, default=True)

    user = relationship("User", back_populates="certificates")

class StudySession(Base):
    __tablename__ = "study_sessions"

    id = Column(String(128), primary_key=True)
    user_id = Column(String(128), ForeignKey("users.id"))
    course_id = Column(String(128), nullable=True)
    duration_minutes = Column(Integer)
    type = Column(String(20), default="study")
    started_at = Column(DateTime(timezone=True))
    ended_at = Column(DateTime(timezone=True))

class Notification(Base):
    __tablename__ = "notifications"

    id = Column(String(128), primary_key=True)
    user_id = Column(String(128), ForeignKey("users.id"))
    type = Column(String(50))
    title = Column(String(255))
    message = Column(Text)
    link = Column(String(1024), nullable=True)
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
