import { Router, Request, Response } from "express";
import { ChildProfile } from "../types";
import { pickNextSubject } from "../services/curriculumAgent";
import { generateSprint } from "../services/contentAgent";
import { pool } from "../lib/db";

const router = Router();

// Fallback profile when child_id is not a UUID or not found in DB
const TEST_CHILD: ChildProfile = {
  id: "test-yonatan",
  name: "יונתן",
  age: 9,
  gender: "זכר",
  city: "ירושלים",
  interests: ["Minecraft", "טכנולוגיה", "חלל"],
  active_subjects: ["math", "hebrew", "finance", "torah", "ai_tech"],
  adhd_mode: true,
  weak_areas: ["hebrew"],
  subject_last_seen: {},
  recent_concepts: [],
  total_xp: 0,
  streak_days: 7,
  streak_shields: 1,
  streak_last_active: "2025-04-11",
  level: 1,
  sprint_count_today: 0,
  xp_multiplier: 1.25,
};

function rowToChildProfile(row: Record<string, unknown>): ChildProfile {
  return {
    id: row.id as string,
    name: row.name as string,
    age: row.age as number,
    gender: row.gender as string,
    city: row.city as string,
    interests: (row.interests as string[]) ?? [],
    active_subjects: (row.active_subjects as ChildProfile["active_subjects"]) ?? ["math"],
    adhd_mode: (row.adhd_mode as boolean) ?? true,
    weak_areas: (row.weak_areas as ChildProfile["active_subjects"]) ?? [],
    subject_last_seen: (row.subject_last_seen as Record<string, string>) ?? {},
    recent_concepts: (row.recent_concepts as string[]) ?? [],
    total_xp: (row.total_xp as number) ?? 0,
    streak_days: (row.streak_days as number) ?? 0,
    streak_shields: (row.streak_shields as number) ?? 0,
    streak_last_active: (row.streak_last_active as string) ?? "",
    level: (row.level as number) ?? 1,
    sprint_count_today: (row.sprint_count_today as number) ?? 0,
    xp_multiplier: parseFloat(String(row.xp_multiplier ?? "1.0")),
  };
}

// POST /api/sprint/generate
router.post("/generate", async (req: Request, res: Response) => {
  const { child_id, child: childFromBody } = req.body as {
    child_id?: string;
    child?: ChildProfile;
  };

  if (!child_id && !childFromBody) {
    res.status(400).json({ error: "child_id or child is required" });
    return;
  }

  let child: ChildProfile = TEST_CHILD;

  if (childFromBody) {
    child = childFromBody;
  } else if (child_id && child_id !== "test-yonatan") {
    try {
      const { rows } = await pool.query(
        "SELECT * FROM children WHERE id = $1",
        [child_id]
      );
      if (!rows.length) {
        res.status(404).json({ error: `Child '${child_id}' not found` });
        return;
      }
      child = rowToChildProfile(rows[0]);
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      res.status(500).json({ error: "DB error", details: message });
      return;
    }
  }

  try {
    const slot = await pickNextSubject(child);
    const sprint = await generateSprint(child, slot);
    const today = new Date().toISOString().slice(0, 10);

    // Persist sprint record and get its ID
    let sprintId: string | null = null;
    const isRealChild = child.id !== "test-yonatan";
    if (isRealChild) {
      try {
        const { rows } = await pool.query(
          `INSERT INTO sprints (child_id, subject, concept, difficulty, content, created_at)
           VALUES ($1, $2, $3, $4, $5, now()) RETURNING id`,
          [child.id, slot.subject, slot.concept, slot.difficulty, JSON.stringify(sprint)]
        );
        sprintId = rows[0]?.id ?? null;
      } catch {
        // Non-fatal
      }

      // Update child: subject_last_seen, recent_concepts
      try {
        const newSubjectLastSeen = {
          ...(child.subject_last_seen as Record<string, string>),
          [slot.subject]: today,
        };
        const newRecentConcepts = [
          slot.concept,
          ...(child.recent_concepts ?? []).filter((c: string) => c !== slot.concept),
        ].slice(0, 10);

        await pool.query(
          `UPDATE children SET
            subject_last_seen = $1,
            recent_concepts   = $2,
            sprint_count_today = sprint_count_today + 1
           WHERE id = $3`,
          [JSON.stringify(newSubjectLastSeen), newRecentConcepts, child.id]
        );
      } catch {
        // Non-fatal
      }
    }

    res.json({ success: true, slot, sprint, sprint_id: sprintId });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Sprint generation failed:", message);
    res.status(500).json({ error: "Failed to generate sprint", details: message });
  }
});

// POST /api/sprint/:sprint_id/answer
router.post("/:sprint_id/answer", async (req: Request, res: Response) => {
  const { sprint_id } = req.params;
  const {
    child_id,
    subject,
    concept,
    question_id,
    correct_on_first_attempt,
    total_attempts,
  } = req.body as {
    child_id: string;
    subject: string;
    concept: string;
    question_id: number;
    correct_on_first_attempt: boolean;
    total_attempts: number;
  };

  if (!child_id || !subject || !concept || question_id === undefined) {
    res.status(400).json({ error: "child_id, subject, concept, question_id are required" });
    return;
  }

  try {
    // 1. Save question result
    await pool.query(
      `INSERT INTO question_results
         (child_id, sprint_id, subject, concept, question_id, correct_on_first_attempt, total_attempts)
       VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        child_id,
        sprint_id === "null" ? null : sprint_id,
        subject,
        concept,
        question_id,
        correct_on_first_attempt,
        total_attempts ?? 1,
      ]
    );

    // 2. Upsert subject_performance
    await pool.query(
      `INSERT INTO subject_performance (child_id, subject, total_questions, first_attempt_correct, updated_at)
       VALUES ($1, $2, 1, $3, now())
       ON CONFLICT (child_id, subject) DO UPDATE SET
         total_questions       = subject_performance.total_questions + 1,
         first_attempt_correct = subject_performance.first_attempt_correct + $3,
         updated_at            = now()`,
      [child_id, subject, correct_on_first_attempt ? 1 : 0]
    );

    // 3. Recalculate error_rate
    await pool.query(
      `UPDATE subject_performance SET
         error_rate = 1.0 - (first_attempt_correct::numeric / NULLIF(total_questions, 0))
       WHERE child_id = $1 AND subject = $2`,
      [child_id, subject]
    );

    // 4. Update concepts_seen (keep last 20)
    await pool.query(
      `UPDATE subject_performance SET
         concepts_seen = (
           SELECT ARRAY(
             SELECT DISTINCT unnest(array_prepend($3::text, concepts_seen))
             LIMIT 20
           )
         )
       WHERE child_id = $1 AND subject = $2`,
      [child_id, subject, concept]
    );

    // 5. Check last 3 results on this concept to determine mastered/failed
    const { rows: lastResults } = await pool.query(
      `SELECT correct_on_first_attempt FROM question_results
       WHERE child_id = $1 AND subject = $2 AND concept = $3
       ORDER BY answered_at DESC LIMIT 3`,
      [child_id, subject, concept]
    );

    if (lastResults.length >= 3) {
      const allCorrect = lastResults.every((r) => r.correct_on_first_attempt);
      const allWrong = lastResults.every((r) => !r.correct_on_first_attempt);

      if (allCorrect) {
        // Mastered — remove from failed, add to mastered
        await pool.query(
          `UPDATE subject_performance SET
             concepts_mastered = array_append(array_remove(concepts_mastered, $3), $3),
             concepts_failed   = array_remove(concepts_failed, $3)
           WHERE child_id = $1 AND subject = $2`,
          [child_id, subject, concept]
        );
      } else if (allWrong) {
        // Failed — add to failed
        await pool.query(
          `UPDATE subject_performance SET
             concepts_failed = array_append(array_remove(concepts_failed, $3), $3)
           WHERE child_id = $1 AND subject = $2`,
          [child_id, subject, concept]
        );
      }
    } else if (lastResults.length >= 1 && !correct_on_first_attempt) {
      // Even a single wrong answer — track in failed until mastered
      await pool.query(
        `UPDATE subject_performance SET
           concepts_failed = array_append(array_remove(concepts_failed, $3), $3)
         WHERE child_id = $1 AND subject = $2
           AND NOT ($3 = ANY(concepts_mastered))`,
        [child_id, subject, concept]
      );
    }

    // 6. Adjust current_difficulty based on last 3 questions for this subject
    const { rows: lastSubjectResults } = await pool.query(
      `SELECT correct_on_first_attempt FROM question_results
       WHERE child_id = $1 AND subject = $2
       ORDER BY answered_at DESC LIMIT 3`,
      [child_id, subject]
    );

    if (lastSubjectResults.length >= 3) {
      const allCorrect3 = lastSubjectResults.every((r) => r.correct_on_first_attempt);
      const lastTwoWrong = lastSubjectResults.slice(0, 2).every((r) => !r.correct_on_first_attempt);

      if (allCorrect3) {
        await pool.query(
          `UPDATE subject_performance SET
             current_difficulty = LEAST(5, current_difficulty + 1)
           WHERE child_id = $1 AND subject = $2`,
          [child_id, subject]
        );
      } else if (lastTwoWrong) {
        await pool.query(
          `UPDATE subject_performance SET
             current_difficulty = GREATEST(1, current_difficulty - 1)
           WHERE child_id = $1 AND subject = $2`,
          [child_id, subject]
        );
      }
    }

    // 7. Return updated performance
    const { rows: perf } = await pool.query(
      `SELECT * FROM subject_performance WHERE child_id = $1 AND subject = $2`,
      [child_id, subject]
    );

    res.json({ success: true, performance: perf[0] ?? null });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    console.error("Answer recording failed:", message);
    res.status(500).json({ error: "Failed to record answer", details: message });
  }
});

export default router;
