import express from 'express';
import cors from 'cors';
import sqlite3 from 'sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
const dbPath = path.join(__dirname, '../data/wordbank.db');
const dataDir = path.dirname(dbPath);

if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

const db = new sqlite3.Database(dbPath);
const PORT = process.env.PORT || 4000;

const seedUsers = [
  { id: 'student-1', name: 'Student Demo', email: 'student@wordbank.app', password: 'student123', role: 'student' },
  { id: 'author-1', name: 'Author Demo', email: 'author@wordbank.app', password: 'author123', role: 'author' }
];

const seedWords = [
  { id: 1, word: 'hello', translation: 'hi', cefr: 'A1' },
  { id: 2, word: 'book', translation: 'libro', cefr: 'A1' },
  { id: 3, word: 'teacher', translation: 'profesor', cefr: 'A1' },
  { id: 4, word: 'rain', translation: 'lluvia', cefr: 'A1' },
  { id: 5, word: 'friend', translation: 'amigo', cefr: 'A2' },
  { id: 6, word: 'travel', translation: 'viajar', cefr: 'A2' },
  { id: 7, word: 'difficult', translation: 'difícil', cefr: 'B1' },
  { id: 8, word: 'decision', translation: 'decisión', cefr: 'B1' },
  { id: 9, word: 'opportunity', translation: 'oportunidad', cefr: 'B1' },
  { id: 10, word: 'consistency', translation: 'consistencia', cefr: 'B2' },
  { id: 11, word: 'innovation', translation: 'innovación', cefr: 'C1' },
  { id: 12, word: 'paradigm', translation: 'paradigma', cefr: 'C2' }
];

const seedCourses = [
  { id: 'starter-1', title: 'Starter', unit: 'Unit 1', wordIds: [1, 2, 3, 4] },
  { id: 'starter-2', title: 'Everyday Life', unit: 'Unit 2', wordIds: [5, 6, 7, 8] },
  { id: 'starter-3', title: 'Academic English', unit: 'Unit 3', wordIds: [9, 10, 11, 12] }
];

const seedQuestionnaires = [
  {
    id: 'q1',
    title: 'Travel Basics',
    prompt: 'Design a quick travel vocabulary set for beginners.',
    questions: ['Where is the station?', 'How much is the ticket?', 'Can I book a room?']
  },
  {
    id: 'q2',
    title: 'Workplace English',
    prompt: 'Create a short speaking checklist for office communication.',
    questions: ['Introduce yourself', 'Discuss your schedule', 'Share a project update']
  }
];

const run = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) return reject(err);
      resolve({ lastID: this.lastID, changes: this.changes });
    });
  });

const all = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) return reject(err);
      resolve(rows);
    });
  });

const get = (sql, params = []) =>
  new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) return reject(err);
      resolve(row);
    });
  });

const deriveStatus = (count) => {
  if (count >= 3) return 'mastered';
  if (count >= 1) return 'learning';
  return 'new';
};

const normalizeStatus = (status) => {
  if (status === 'mastered' || status === 'learning' || status === 'to learn' || status === 'new') {
    return status;
  }
  return 'new';
};

const getStatusValueFromCount = (count) => {
  if (count >= 3) return 'mastered';
  if (count >= 1) return 'learning';
  return 'new';
};

const upsertWordProgress = async (userId, wordId, status, correctCount) => {
  await run(
    `INSERT INTO user_word_status (user_id, word_id, status, correct_count)
     VALUES (?, ?, ?, ?)
     ON CONFLICT(user_id, word_id)
     DO UPDATE SET status = excluded.status, correct_count = excluded.correct_count`,
    [userId, wordId, normalizeStatus(status), Math.max(0, Number(correctCount || 0))]
  );
};

const getWordsForUser = async (userId) => {
  const rows = await all(
    `SELECT w.id, w.word, w.translation, w.cefr,
            COALESCE(uws.status, 'new') AS status,
            COALESCE(uws.correct_count, 0) AS correct_count
     FROM words w
     LEFT JOIN user_word_status uws
       ON uws.word_id = w.id AND uws.user_id = ?
     ORDER BY w.id ASC`,
    [userId]
  );

  return rows.map((row) => ({
    id: row.id,
    word: row.word,
    translation: row.translation,
    cefr: row.cefr,
    status: normalizeStatus(row.status),
    correctCount: Math.max(0, Number(row.correct_count || 0))
  }));
};

const getResultsForUser = async (userId) => {
  const rows = await all(
    `SELECT w.cefr,
            SUM(CASE WHEN COALESCE(uws.status, 'new') = 'mastered' THEN 1 ELSE 0 END) AS mastered,
            SUM(CASE WHEN COALESCE(uws.status, 'new') = 'learning' THEN 1 ELSE 0 END) AS learning,
            SUM(CASE WHEN COALESCE(uws.status, 'new') = 'to learn' THEN 1 ELSE 0 END) AS to_learn,
            SUM(CASE WHEN COALESCE(uws.status, 'new') = 'new' THEN 1 ELSE 0 END) AS new_count
     FROM words w
     LEFT JOIN user_word_status uws
       ON uws.word_id = w.id AND uws.user_id = ?
     GROUP BY w.cefr
     ORDER BY CASE w.cefr
       WHEN 'A1' THEN 1
       WHEN 'A2' THEN 2
       WHEN 'B1' THEN 3
       WHEN 'B2' THEN 4
       WHEN 'C1' THEN 5
       WHEN 'C2' THEN 6
       ELSE 7
     END`,
    [userId]
  );

  const resultMap = {
    A1: { cefr: 'A1', mastered: 0, learning: 0, toLearn: 0, new: 0 },
    A2: { cefr: 'A2', mastered: 0, learning: 0, toLearn: 0, new: 0 },
    B1: { cefr: 'B1', mastered: 0, learning: 0, toLearn: 0, new: 0 },
    B2: { cefr: 'B2', mastered: 0, learning: 0, toLearn: 0, new: 0 },
    C1: { cefr: 'C1', mastered: 0, learning: 0, toLearn: 0, new: 0 },
    C2: { cefr: 'C2', mastered: 0, learning: 0, toLearn: 0, new: 0 }
  };

  for (const row of rows) {
    const cefr = row.cefr;
    resultMap[cefr] = {
      cefr,
      mastered: Number(row.mastered || 0),
      learning: Number(row.learning || 0),
      toLearn: Number(row.to_learn || 0),
      new: Number(row.new_count || 0)
    };
  }

  return resultMap;
};

const initializeDatabase = async () => {
  await run(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'student'
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS words (
      id INTEGER PRIMARY KEY,
      word TEXT NOT NULL,
      translation TEXT NOT NULL,
      cefr TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS user_word_status (
      user_id TEXT NOT NULL,
      word_id INTEGER NOT NULL,
      status TEXT NOT NULL DEFAULT 'new',
      correct_count INTEGER NOT NULL DEFAULT 0,
      UNIQUE(user_id, word_id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS courses (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      unit TEXT NOT NULL
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS course_words (
      course_id TEXT NOT NULL,
      word_id INTEGER NOT NULL,
      UNIQUE(course_id, word_id)
    );
  `);

  await run(`
    CREATE TABLE IF NOT EXISTS questionnaires (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      prompt TEXT NOT NULL,
      questions_json TEXT NOT NULL
    );
  `);

  const existingWordCount = await get('SELECT COUNT(*) AS count FROM words');
  if (!existingWordCount || Number(existingWordCount.count) === 0) {
    for (const word of seedWords) {
      await run('INSERT INTO words (id, word, translation, cefr) VALUES (?, ?, ?, ?)', [word.id, word.word, word.translation, word.cefr]);
    }

    for (const user of seedUsers) {
      await run('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [user.id, user.name, user.email, user.password, user.role]);
    }

    for (const course of seedCourses) {
      await run('INSERT INTO courses (id, title, unit) VALUES (?, ?, ?)', [course.id, course.title, course.unit]);
      for (const wordId of course.wordIds) {
        await run('INSERT INTO course_words (course_id, word_id) VALUES (?, ?)', [course.id, wordId]);
      }
    }

    for (const questionnaire of seedQuestionnaires) {
      await run('INSERT INTO questionnaires (id, title, prompt, questions_json) VALUES (?, ?, ?, ?)', [questionnaire.id, questionnaire.title, questionnaire.prompt, JSON.stringify(questionnaire.questions)]);
    }
  } else {
    const userCount = await get('SELECT COUNT(*) AS count FROM users');
    if (!userCount || Number(userCount.count) === 0) {
      for (const user of seedUsers) {
        await run('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [user.id, user.name, user.email, user.password, user.role]);
      }
    }
  }
};

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true, message: 'Word Bank API is running.' });
});

app.post('/api/auth/login', async (req, res) => {
  const { email, password } = req.body || {};
  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password are required.' });
  }

  const user = await get('SELECT id, name, email, role FROM users WHERE email = ? AND password = ?', [String(email).trim().toLowerCase(), String(password)]);
  if (!user) {
    return res.status(401).json({ error: 'Invalid email or password.' });
  }

  return res.json({ user });
});

app.post('/api/auth/register', async (req, res) => {
  const { name, email, password, role } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ error: 'Name, email, and password are required.' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  const existingUser = await get('SELECT id FROM users WHERE email = ?', [normalizedEmail]);
  if (existingUser) {
    return res.status(409).json({ error: 'An account with that email already exists.' });
  }

  const userId = `user-${Date.now()}`;
  await run('INSERT INTO users (id, name, email, password, role) VALUES (?, ?, ?, ?, ?)', [userId, String(name).trim(), normalizedEmail, String(password), role === 'author' ? 'author' : 'student']);

  const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
  return res.status(201).json({ user });
});

app.get('/api/users/:id', async (req, res) => {
  const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [req.params.id]);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  return res.json({ user });
});

app.get('/api/me', async (req, res) => {
  const userId = String(req.query.userId || '');
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const user = await get('SELECT id, name, email, role FROM users WHERE id = ?', [userId]);
  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  const [words, courses, questionnaires, results] = await Promise.all([
    getWordsForUser(userId),
    all('SELECT c.id, c.title, c.unit, COALESCE(json_group_array(cw.word_id), json_array()) AS word_ids FROM courses c LEFT JOIN course_words cw ON cw.course_id = c.id GROUP BY c.id ORDER BY c.id'),
    all('SELECT id, title, prompt, questions_json FROM questionnaires ORDER BY id'),
    getResultsForUser(userId)
  ]);

  const normalizedCourses = courses.map((course) => ({
    id: course.id,
    title: course.title,
    unit: course.unit,
    wordIds: JSON.parse(course.word_ids || '[]')
  }));

  const normalizedQuestionnaires = questionnaires.map((questionnaire) => ({
    id: questionnaire.id,
    title: questionnaire.title,
    prompt: questionnaire.prompt,
    questions: JSON.parse(questionnaire.questions_json || '[]')
  }));

  return res.json({
    user,
    words,
    courses: normalizedCourses,
    questionnaires: normalizedQuestionnaires,
    results
  });
});

app.put('/api/users/:id/password', async (req, res) => {
  const { currentPassword, newPassword } = req.body || {};
  const user = await get('SELECT id, password FROM users WHERE id = ?', [req.params.id]);

  if (!user) {
    return res.status(404).json({ error: 'User not found.' });
  }

  if (String(currentPassword) !== String(user.password)) {
    return res.status(400).json({ error: 'Current password is incorrect.' });
  }

  if (!newPassword || String(newPassword).length < 6) {
    return res.status(400).json({ error: 'New password must be at least 6 characters.' });
  }

  await run('UPDATE users SET password = ? WHERE id = ?', [String(newPassword), req.params.id]);
  return res.json({ success: true });
});

app.delete('/api/users/:id', async (req, res) => {
  const userId = req.params.id;
  await run('DELETE FROM user_word_status WHERE user_id = ?', [userId]);
  await run('DELETE FROM users WHERE id = ?', [userId]);
  return res.json({ success: true });
});

app.get('/api/courses', async (_req, res) => {
  const rows = await all(`SELECT c.id, c.title, c.unit, COALESCE(json_group_array(cw.word_id), json_array()) AS word_ids
    FROM courses c
    LEFT JOIN course_words cw ON cw.course_id = c.id
    GROUP BY c.id
    ORDER BY c.id`);

  const courses = rows.map((course) => ({
    id: course.id,
    title: course.title,
    unit: course.unit,
    wordIds: JSON.parse(course.word_ids || '[]')
  }));

  return res.json({ courses });
});

app.get('/api/words', async (req, res) => {
  const userId = String(req.query.userId || '');
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const words = await getWordsForUser(userId);
  return res.json({ words });
});

app.put('/api/words/:id/status', async (req, res) => {
  const { userId, status } = req.body || {};
  const wordId = Number(req.params.id);

  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const normalizedStatus = normalizeStatus(status);
  const correctCount = normalizedStatus === 'mastered' ? 3 : normalizedStatus === 'learning' ? 2 : 0;

  await upsertWordProgress(userId, wordId, normalizedStatus, correctCount);
  const words = await getWordsForUser(userId);
  return res.json({ words });
});

app.post('/api/quiz/submit', async (req, res) => {
  const { userId, wordId, isCorrect } = req.body || {};

  if (!userId || !wordId) {
    return res.status(400).json({ error: 'Missing userId or wordId' });
  }

  const currentRecord = await get(
    'SELECT correct_count, status FROM user_word_status WHERE user_id = ? AND word_id = ?',
    [String(userId), Number(wordId)]
  );

  const currentCount = Number(currentRecord?.correct_count || 0);
  const nextCount = Math.max(0, currentCount + (isCorrect ? 1 : -1));
  const nextStatus = getStatusValueFromCount(nextCount);

  await upsertWordProgress(String(userId), Number(wordId), nextStatus, nextCount);
  return res.json({
    success: true,
    wordId,
    correctCount: nextCount,
    status: nextStatus
  });
});

app.get('/api/results', async (req, res) => {
  const userId = String(req.query.userId || '');
  if (!userId) {
    return res.status(400).json({ error: 'Missing userId' });
  }

  const results = await getResultsForUser(userId);
  return res.json({ results });
});

app.get('/api/questionnaires', async (_req, res) => {
  const rows = await all('SELECT id, title, prompt, questions_json FROM questionnaires ORDER BY id');
  const questionnaires = rows.map((questionnaire) => ({
    id: questionnaire.id,
    title: questionnaire.title,
    prompt: questionnaire.prompt,
    questions: JSON.parse(questionnaire.questions_json || '[]')
  }));

  return res.json({ questionnaires });
});

app.post('/api/questionnaires', async (req, res) => {
  const { title, prompt, questions } = req.body || {};
  if (!title || !prompt || !Array.isArray(questions)) {
    return res.status(400).json({ error: 'Title, prompt, and a valid question list are required.' });
  }

  const id = `q-${Date.now()}`;
  await run('INSERT INTO questionnaires (id, title, prompt, questions_json) VALUES (?, ?, ?, ?)', [id, title, prompt, JSON.stringify(questions)]);

  return res.status(201).json({
    questionnaire: {
      id,
      title,
      prompt,
      questions
    }
  });
});

app.use(express.static(path.join(__dirname, '../dist')));
app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api/')) {
    return next();
  }

  const distPath = path.join(__dirname, '../dist/index.html');
  if (fs.existsSync(distPath)) {
    return res.sendFile(distPath);
  }

  return res.send('Word Bank backend is running. Build the frontend to serve the UI.');
});

await initializeDatabase();

app.listen(PORT, () => {
  console.log(`Word Bank API listening on http://localhost:${PORT}`);
});
