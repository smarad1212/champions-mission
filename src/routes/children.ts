import { Router, Request, Response } from 'express'
import { pool } from '../lib/db'

const router = Router()

// POST /api/children — create a new child profile
router.post('/', async (req: Request, res: Response) => {
  const {
    name, age, gender, city,
    interests = [],
    active_subjects = ['math', 'hebrew', 'finance', 'torah', 'ai_tech'],
    adhd_mode = true,
    weak_areas = [],
  } = req.body

  if (!name || !age || !gender || !city) {
    res.status(400).json({ error: 'name, age, gender, city are required' })
    return
  }

  try {
    const { rows } = await pool.query(
      `INSERT INTO children
        (name, age, gender, city, interests, active_subjects, adhd_mode, weak_areas)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [name, age, gender, city, interests, active_subjects, adhd_mode, weak_areas]
    )
    res.status(201).json(rows[0])
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: msg })
  }
})

// GET /api/children — list all children
router.get('/', async (_req: Request, res: Response) => {
  try {
    const result = await pool.query('SELECT * FROM children ORDER BY created_at DESC')
    res.json(result.rows)
  } catch (error) {
    console.error('GET /api/children error:', error)
    res.status(500).json({ error: String(error) })
  }
})

// GET /api/children/:id — get single child
router.get('/:id', async (req: Request, res: Response) => {
  try {
    const { rows } = await pool.query(
      'SELECT * FROM children WHERE id = $1',
      [req.params.id]
    )
    if (!rows.length) {
      res.status(404).json({ error: 'Child not found' })
      return
    }
    res.json(rows[0])
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: msg })
  }
})

// PUT /api/children/:id/interests — update interests array
router.put('/:id/interests', async (req: Request, res: Response) => {
  const { interests } = req.body
  if (!Array.isArray(interests)) {
    res.status(400).json({ error: 'interests must be an array' })
    return
  }
  try {
    const { rows } = await pool.query(
      'UPDATE children SET interests = $1 WHERE id = $2 RETURNING *',
      [interests, req.params.id]
    )
    if (!rows.length) {
      res.status(404).json({ error: 'Child not found' })
      return
    }
    res.json(rows[0])
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: msg })
  }
})

// PUT /api/children/:id/progress — update XP, streak, sprint count, multiplier + learning data
router.put('/:id/progress', async (req: Request, res: Response) => {
  const {
    total_xp, streak_days, sprint_count_today, xp_multiplier,
    weak_areas, subject_last_seen, recent_concepts,
  } = req.body
  try {
    const { rows } = await pool.query(
      `UPDATE children
       SET
         total_xp           = COALESCE($1, total_xp),
         streak_days        = COALESCE($2, streak_days),
         sprint_count_today = COALESCE($3, sprint_count_today),
         xp_multiplier      = COALESCE($4, xp_multiplier),
         weak_areas         = COALESCE($5, weak_areas),
         subject_last_seen  = COALESCE($6, subject_last_seen),
         recent_concepts    = COALESCE($7, recent_concepts)
       WHERE id = $8
       RETURNING *`,
      [
        total_xp, streak_days, sprint_count_today, xp_multiplier,
        weak_areas, subject_last_seen ? JSON.stringify(subject_last_seen) : null,
        recent_concepts, req.params.id,
      ]
    )
    if (!rows.length) {
      res.status(404).json({ error: 'Child not found' })
      return
    }
    res.json(rows[0])
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Unknown error'
    res.status(500).json({ error: msg })
  }
})

export default router
