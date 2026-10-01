import { useEffect, useMemo, useState } from 'react';

type WordStatus = 'new' | 'to learn' | 'learning' | 'mastered';
type CeFrLevel = 'A1' | 'A2' | 'B1' | 'B2' | 'C1' | 'C2';
type Role = 'student' | 'author';

type User = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: Role;
};

type Word = {
  id: number;
  word: string;
  translation: string;
  cefr: CeFrLevel;
  status: WordStatus;
  correctCount: number;
};

type Course = {
  id: string;
  title: string;
  unit: string;
  wordIds: number[];
};

type Questionnaire = {
  id: string;
  title: string;
  prompt: string;
  questions: string[];
};

type AppData = {
  users: User[];
  words: Word[];
  courses: Course[];
  questionnaires: Questionnaire[];
};

const STORAGE_KEY = 'word-bank-data-v1';
const CERF_LEVELS: CeFrLevel[] = ['A1', 'A2', 'B1', 'B2', 'C1', 'C2'];

const initialWords: Word[] = [
  { id: 1, word: 'hello', translation: 'hi', cefr: 'A1', status: 'new', correctCount: 0 },
  { id: 2, word: 'book', translation: 'libro', cefr: 'A1', status: 'new', correctCount: 0 },
  { id: 3, word: 'teacher', translation: 'profesor', cefr: 'A1', status: 'new', correctCount: 0 },
  { id: 4, word: 'rain', translation: 'lluvia', cefr: 'A1', status: 'new', correctCount: 0 },
  { id: 5, word: 'friend', translation: 'amigo', cefr: 'A2', status: 'new', correctCount: 0 },
  { id: 6, word: 'travel', translation: 'viajar', cefr: 'A2', status: 'new', correctCount: 0 },
  { id: 7, word: 'difficult', translation: 'difícil', cefr: 'B1', status: 'new', correctCount: 0 },
  { id: 8, word: 'decision', translation: 'decisión', cefr: 'B1', status: 'new', correctCount: 0 },
  { id: 9, word: 'opportunity', translation: 'oportunidad', cefr: 'B1', status: 'new', correctCount: 0 },
  { id: 10, word: 'consistency', translation: 'consistencia', cefr: 'B2', status: 'new', correctCount: 0 },
  { id: 11, word: 'innovation', translation: 'innovación', cefr: 'C1', status: 'new', correctCount: 0 },
  { id: 12, word: 'paradigm', translation: 'paradigma', cefr: 'C2', status: 'new', correctCount: 0 }
];

const initialCourses: Course[] = [
  { id: 'starter-1', title: 'Starter', unit: 'Unit 1', wordIds: [1, 2, 3, 4] },
  { id: 'starter-2', title: 'Everyday Life', unit: 'Unit 2', wordIds: [5, 6, 7, 8] },
  { id: 'starter-3', title: 'Academic English', unit: 'Unit 3', wordIds: [9, 10, 11, 12] }
];

const initialQuestionnaires: Questionnaire[] = [
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

const initialUsers: User[] = [
  { id: 'student-1', name: 'Student Demo', email: 'student@wordbank.app', password: 'student123', role: 'student' },
  { id: 'author-1', name: 'Author Demo', email: 'author@wordbank.app', password: 'author123', role: 'author' }
];

const makeSeedData = (): AppData => ({
  users: initialUsers,
  words: initialWords,
  courses: initialCourses,
  questionnaires: initialQuestionnaires
});

const getComputedStatus = (correctCount: number): WordStatus => {
  if (correctCount >= 3) return 'mastered';
  if (correctCount >= 1) return 'learning';
  if (correctCount === 0) return 'new';
  return 'new';
};

const getStatusLabel = (status: WordStatus) => {
  if (status === 'new') return 'new';
  if (status === 'to learn') return 'to learn';
  if (status === 'learning') return 'learning';
  return 'mastered';
};

const clampCorrectCount = (value: number) => Math.max(0, value);

const getInitialData = (): AppData => {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (!saved) {
    const seed = makeSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }

  try {
    const parsed = JSON.parse(saved) as AppData;
    return parsed.users && parsed.words ? parsed : makeSeedData();
  } catch {
    const seed = makeSeedData();
    localStorage.setItem(STORAGE_KEY, JSON.stringify(seed));
    return seed;
  }
};

const statusClassName: Record<WordStatus, string> = {
  new: 'badge neutral',
  'to learn': 'badge warning',
  learning: 'badge info',
  mastered: 'badge success'
};

function App() {
  const [data, setData] = useState<AppData>(() => getInitialData());
  const [selectedTab, setSelectedTab] = useState<'flashcard' | 'quiz' | 'results' | 'settings' | 'ai-tutor'>('flashcard');
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loginForm, setLoginForm] = useState({ email: 'student@wordbank.app', password: 'student123' });
  const [registerForm, setRegisterForm] = useState({ name: '', email: '', password: '', role: 'student' as Role });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [questionPrompt, setQuestionPrompt] = useState('Generate 3 quick speaking questions for beginner students.');
  const [quizAnswer, setQuizAnswer] = useState('');
  const [selectedCourseId, setSelectedCourseId] = useState<string>('starter-1');
  const [quizIndex, setQuizIndex] = useState(0);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }, [data]);

  const currentUser = useMemo(
    () => data.users.find((user) => user.id === currentUserId) ?? null,
    [data.users, currentUserId]
  );

  const activeCourse = data.courses.find((course) => course.id === selectedCourseId) ?? data.courses[0];

  const quizWords = activeCourse
    ? activeCourse.wordIds.map((id) => data.words.find((word) => word.id === id)).filter(Boolean) as Word[]
    : [];

  const currentQuizWord = quizWords[quizIndex] ?? quizWords[0];

  const statusCounts = useMemo(() => {
    const counts: Record<CeFrLevel, { mastered: number; learning: number; 'to learn': number; new: number }> = {
      A1: { mastered: 0, learning: 0, 'to learn': 0, new: 0 },
      A2: { mastered: 0, learning: 0, 'to learn': 0, new: 0 },
      B1: { mastered: 0, learning: 0, 'to learn': 0, new: 0 },
      B2: { mastered: 0, learning: 0, 'to learn': 0, new: 0 },
      C1: { mastered: 0, learning: 0, 'to learn': 0, new: 0 },
      C2: { mastered: 0, learning: 0, 'to learn': 0, new: 0 }
    };

    data.words.forEach((word) => {
      const bucket = counts[word.cefr];
      if (word.status === 'mastered') bucket.mastered += 1;
      else if (word.status === 'learning') bucket.learning += 1;
      else if (word.status === 'to learn') bucket['to learn'] += 1;
      else bucket.new += 1;
    });

    return counts;
  }, [data.words]);

  const handleLogin = (event: React.FormEvent) => {
    event.preventDefault();
    const match = data.users.find(
      (user) => user.email.toLowerCase() === loginForm.email.toLowerCase() && user.password === loginForm.password
    );

    if (match) {
      setCurrentUserId(match.id);
      setSelectedTab(match.role === 'author' ? 'ai-tutor' : 'flashcard');
    } else {
      alert('Invalid email or password.');
    }
  };

  const handleRegister = (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = registerForm.email.trim();
    const exists = data.users.some((user) => user.email.toLowerCase() === normalizedEmail.toLowerCase());

    if (!registerForm.name || !normalizedEmail || !registerForm.password) {
      alert('Please complete all fields.');
      return;
    }

    if (exists) {
      alert('An account with that email already exists.');
      return;
    }

    const newUser: User = {
      id: `user-${Date.now()}`,
      name: registerForm.name,
      email: normalizedEmail,
      password: registerForm.password,
      role: registerForm.role
    };

    setData((prev) => ({
      ...prev,
      users: [...prev.users, newUser]
    }));

    setCurrentUserId(newUser.id);
    setSelectedTab(newUser.role === 'author' ? 'ai-tutor' : 'flashcard');
    setAuthMode('login');
    setRegisterForm({ name: '', email: '', password: '', role: 'student' });
  };

  const updateWordStatus = (wordId: number, nextStatus: WordStatus) => {
    setData((prev) => ({
      ...prev,
      words: prev.words.map((word) => {
        if (word.id !== wordId) return word;

        let raw = 0;
        if (nextStatus === 'mastered') raw = 3;
        else if (nextStatus === 'learning') raw = 2;
        else if (nextStatus === 'to learn') raw = 0;
        else raw = 0;

        const nextCorrect = raw;
        return {
          ...word,
          correctCount: nextCorrect,
          status: getComputedStatus(nextCorrect)
        };
      })
    }));
  };

  const updateWordFromAnswer = (wordId: number, isCorrect: boolean) => {
    setData((prev) => ({
      ...prev,
      words: prev.words.map((word) => {
        if (word.id !== wordId) return word;

        const updatedCount = clampCorrectCount(word.correctCount + (isCorrect ? 1 : -1));
        const nextStatus = getComputedStatus(updatedCount);

        return {
          ...word,
          correctCount: updatedCount,
          status: nextStatus
        };
      })
    }));
  };

  const handleQuizSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentQuizWord) return;

    const normalizedAnswer = quizAnswer.trim().toLowerCase();
    const correct =
      normalizedAnswer === currentQuizWord.translation.toLowerCase() ||
      normalizedAnswer === currentQuizWord.word.toLowerCase();

    updateWordFromAnswer(currentQuizWord.id, correct);
    setQuizAnswer('');

    setQuizIndex((prev) => {
      if (prev < quizWords.length - 1) return prev + 1;
      return 0;
    });
  };

  const handlePasswordChange = (event: React.FormEvent) => {
    event.preventDefault();
    if (!currentUser) return;

    if (passwordForm.currentPassword !== currentUser.password) {
      alert('Current password is incorrect.');
      return;
    }

    if (!passwordForm.newPassword || passwordForm.newPassword.length < 6) {
      alert('New password must be at least 6 characters.');
      return;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      alert('New passwords do not match.');
      return;
    }

    setData((prev) => ({
      ...prev,
      users: prev.users.map((user) =>
        user.id === currentUser.id ? { ...user, password: passwordForm.newPassword } : user
      )
    }));

    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    alert('Password updated.');
  };

  const handleDeleteAccount = () => {
    if (!currentUser) return;
    const confirmed = window.confirm('Delete this account permanently?');
    if (!confirmed) return;

    setData((prev) => ({
      ...prev,
      users: prev.users.filter((user) => user.id !== currentUser.id)
    }));
    setCurrentUserId(null);
  };

  const handleGenerateQuestionnaire = () => {
    const generated: Questionnaire = {
      id: `q-${Date.now()}`,
      title: `AI Prompt: ${questionPrompt.slice(0, 24) || 'New questionnaire'}`,
      prompt: questionPrompt,
      questions: [
        'Explain the topic in your own words.',
        'Give 3 key vocabulary items.',
        'Write 2 example sentences using them.'
      ]
    };

    setData((prev) => ({
      ...prev,
      questionnaires: [generated, ...prev.questionnaires]
    }));
  };

  const tabs = currentUser?.role === 'author'
    ? [
        { id: 'flashcard', label: 'Flashcard' },
        { id: 'quiz', label: 'Quiz' },
        { id: 'results', label: 'Result' },
        { id: 'settings', label: 'Settings' },
        { id: 'ai-tutor', label: 'AI Tutor' }
      ]
    : [
        { id: 'flashcard', label: 'Flashcard' },
        { id: 'quiz', label: 'Quiz' },
        { id: 'results', label: 'Result' },
        { id: 'settings', label: 'Settings' }
      ];

  if (!currentUser) {
    return (
      <div className="auth-screen">
        <div className="auth-card">
          <div className="brand-row">
            <div className="brand-mark">WB</div>
            <div>
              <h1>Word Bank</h1>
              <p>Simple student vocabulary practice</p>
            </div>
          </div>

          <div className="mode-toggle">
            <button className={authMode === 'login' ? 'active' : ''} onClick={() => setAuthMode('login')}>
              Login
            </button>
            <button className={authMode === 'register' ? 'active' : ''} onClick={() => setAuthMode('register')}>
              Register
            </button>
          </div>

          {authMode === 'login' ? (
            <form onSubmit={handleLogin} className="auth-form">
              <label>
                Email
                <input
                  type="email"
                  value={loginForm.email}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))}
                />
              </label>
              <button type="submit" className="primary-btn">Sign in</button>
              <div className="demo-box">
                <p>Demo users</p>
                <div className="demo-list">
                  <button type="button" onClick={() => setLoginForm({ email: 'student@wordbank.app', password: 'student123' })}>
                    Student Demo
                  </button>
                  <button type="button" onClick={() => setLoginForm({ email: 'author@wordbank.app', password: 'author123' })}>
                    Author Demo
                  </button>
                </div>
              </div>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="auth-form">
              <label>
                Full name
                <input
                  value={registerForm.name}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, name: event.target.value }))}
                />
              </label>
              <label>
                Email
                <input
                  type="email"
                  value={registerForm.email}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))}
                />
              </label>
              <label>
                Password
                <input
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, password: event.target.value }))}
                />
              </label>
              <label>
                Role
                <select
                  value={registerForm.role}
                  onChange={(event) => setRegisterForm((prev) => ({ ...prev, role: event.target.value as Role }))}
                >
                  <option value="student">Student</option>
                  <option value="author">Author</option>
                </select>
              </label>
              <button type="submit" className="primary-btn">Create account</button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <div className="mini-logo">WB</div>
          <div>
            <h2>Word Bank</h2>
            <small>{currentUser.role === 'author' ? 'Author view' : 'Student view'}</small>
          </div>
        </div>

        <div className="topbar-actions">
          <span className="user-pill">{currentUser.name}</span>
          <button className="logout-btn" onClick={() => setCurrentUserId(null)}>
            Log out
          </button>
        </div>
      </header>

      <nav className="tab-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={selectedTab === tab.id ? 'tab active' : 'tab'}
            onClick={() => setSelectedTab(tab.id as typeof selectedTab)}
          >
            {tab.label}
          </button>
        ))}
      </nav>

      <main className="content-panel">
        {selectedTab === 'flashcard' && (
          <section className="card-grid">
            {data.words.map((word) => (
              <article key={word.id} className="word-card">
                <div className="word-header">
                  <div>
                    <span className="cefr-tag">{word.cefr}</span>
                    <h3>{word.word}</h3>
                  </div>
                  <span className={statusClassName[word.status]}>{getStatusLabel(word.status)}</span>
                </div>

                <p>{word.translation}</p>
                <div className="status-buttons">
                  {(['new', 'to learn', 'learning', 'mastered'] as WordStatus[]).map((status) => (
                    <button
                      key={status}
                      className={word.status === status ? 'status active' : 'status'}
                      onClick={() => updateWordStatus(word.id, status)}
                    >
                      {status}
                    </button>
                  ))}
                </div>
              </article>
            ))}
          </section>
        )}

        {selectedTab === 'quiz' && (
          <section className="quiz-panel">
            <div className="quiz-toolbar">
              <label>
                Course / unit
                <select value={selectedCourseId} onChange={(event) => { setSelectedCourseId(event.target.value); setQuizIndex(0); }}>
                  {data.courses.map((course) => (
                    <option key={course.id} value={course.id}>
                      {course.title} - {course.unit}
                    </option>
                  ))}
                </select>
              </label>
            </div>

            {currentQuizWord ? (
              <form onSubmit={handleQuizSubmit} className="quiz-card">
                <div className="quiz-meta">
                  <span className="cefr-tag">{currentQuizWord.cefr}</span>
                  <span className="count-label">Word {quizIndex + 1} / {quizWords.length}</span>
                </div>

                <h3>{currentQuizWord.word}</h3>
                <p className="muted">Type the correct meaning or answer.</p>

                <label>
                  Your answer
                  <input
                    type="text"
                    value={quizAnswer}
                    onChange={(event) => setQuizAnswer(event.target.value)}
                    placeholder="Type the matching answer"
                  />
                </label>

                <div className="button-row">
                  <button type="submit" className="primary-btn">Submit answer</button>
                  <button type="button" className="ghost-btn" onClick={() => {
                    updateWordFromAnswer(currentQuizWord.id, false);
                    setQuizAnswer('');
                    setQuizIndex((prev) => (prev < quizWords.length - 1 ? prev + 1 : 0));
                  }}>
                    Mark wrong
                  </button>
                </div>
              </form>
            ) : (
              <div className="empty-state">No words available in this unit.</div>
            )}
          </section>
        )}

        {selectedTab === 'results' && (
          <section className="results-panel">
            <table className="results-table">
              <thead>
                <tr>
                  <th>CEFR</th>
                  <th>Mastered</th>
                  <th>Learning</th>
                  <th>To Learn</th>
                  <th>New</th>
                </tr>
              </thead>
              <tbody>
                {CERF_LEVELS.map((level) => (
                  <tr key={level}>
                    <td>{level}</td>
                    <td>{statusCounts[level].mastered}</td>
                    <td>{statusCounts[level].learning}</td>
                    <td>{statusCounts[level]['to learn']}</td>
                    <td>{statusCounts[level].new}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </section>
        )}

        {selectedTab === 'settings' && (
          <section className="settings-panel">
            <div className="settings-card">
              <h3>Change password</h3>
              <form onSubmit={handlePasswordChange} className="auth-form compact">
                <label>
                  Current password
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, currentPassword: event.target.value }))}
                  />
                </label>
                <label>
                  New password
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, newPassword: event.target.value }))}
                  />
                </label>
                <label>
                  Confirm new password
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(event) => setPasswordForm((prev) => ({ ...prev, confirmPassword: event.target.value }))}
                  />
                </label>
                <button type="submit" className="primary-btn">Update password</button>
              </form>
            </div>

            <div className="danger-card">
              <h3>Delete account</h3>
              <p>This cannot be undone.</p>
              <button className="danger-btn" onClick={handleDeleteAccount}>Delete account</button>
            </div>
          </section>
        )}

        {selectedTab === 'ai-tutor' && (
          <section className="ai-panel">
            <div className="ai-card">
              <h3>AI Tutor</h3>
              <textarea
                value={questionPrompt}
                onChange={(event) => setQuestionPrompt(event.target.value)}
                rows={5}
                placeholder="Describe the student questionnaire you want to build..."
              />
              <div className="button-row">
                <button className="primary-btn" onClick={handleGenerateQuestionnaire}>Generate questionnaire</button>
              </div>
            </div>

            <div className="questionnaire-list">
              {data.questionnaires.map((questionnaire) => (
                <article key={questionnaire.id} className="questionnaire-card">
                  <div className="questionnaire-header">
                    <h4>{questionnaire.title}</h4>
                    <span className="mini-status">AI</span>
                  </div>
                  <p>{questionnaire.prompt}</p>
                  <ul>
                    {questionnaire.questions.map((question, index) => (
                      <li key={`${questionnaire.id}-${index}`}>{question}</li>
                    ))}
                  </ul>
                </article>
              ))}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

export default App;
