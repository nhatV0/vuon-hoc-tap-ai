import { db } from "@/db/client";

export interface StudentEntity {
  id: string;
  user_id: string | null;
  name: string;
  grade: string;
  classroom: string;
  target_subject: string;
  target_subjects: string;
  emotion_scale: number;
  weakness: string;
  long_term_goal: string;
  timeframe: string;
  learning_style: string;
  selected_flower: string;
  diagnostic_answers: string;
  created_at: string;
}

export class StudentRepository {
  findById(id: string): StudentEntity | null {
    return db.query("SELECT * FROM students WHERE id = ?").get(id) as StudentEntity | null;
  }

  findByUserId(userId: string): StudentEntity | null {
    return db.query("SELECT * FROM students WHERE user_id = ?").get(userId) as StudentEntity | null;
  }

  create(student: {
    id: string;
    user_id: string | null;
    name: string;
    grade: string;
    target_subject: string;
    target_subjects: string;
    emotion_scale: number;
    weakness: string;
    long_term_goal: string;
    timeframe: string;
    learning_style: string;
    selected_flower: string;
    diagnostic_answers: string;
  }): StudentEntity {
    db.run(
      `INSERT INTO students (
        id, user_id, name, grade, classroom, target_subject, target_subjects,
        emotion_scale, weakness, long_term_goal, timeframe, learning_style,
        selected_flower, diagnostic_answers
      ) VALUES (?, ?, ?, ?, '12A1', ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        student.id, student.user_id, student.name, student.grade,
        student.target_subject, student.target_subjects, student.emotion_scale,
        student.weakness, student.long_term_goal, student.timeframe,
        student.learning_style, student.selected_flower, student.diagnostic_answers
      ]
    );
    return this.findById(student.id)!;
  }

  findAll(): StudentEntity[] {
    return db.query("SELECT * FROM students ORDER BY created_at DESC").all() as StudentEntity[];
  }
}
