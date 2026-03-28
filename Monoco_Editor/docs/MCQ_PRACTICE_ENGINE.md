# Self-Learning Course: Build an MCQ Practice Engine

> **Course Goal**: By the end of this course, you will build a topic-wise MCQ (Multiple Choice Questions) practice engine with instant feedback, explanations, scoring, and review — perfect for exam preparation.
>
> **Prerequisites**: Basic React knowledge.
>
> **Time**: ~45 minutes, 7 lessons

---

## Lesson 1: Why MCQ Practice Matters for Learning

### The Science of Active Recall

```
Passive Learning (❌ Weak)           Active Recall (✅ Strong)
┌─────────────────────┐             ┌─────────────────────┐
│ Reading notes        │             │ Testing yourself    │
│ Watching videos      │   vs.      │ Answering questions  │
│ Highlighting text    │             │ Explaining concepts  │
│                      │             │                      │
│ Retention: ~10-20%   │             │ Retention: ~70-90%   │
└─────────────────────┘             └─────────────────────┘
```

### What Makes a Good MCQ Engine?

| Feature | Why |
|---------|-----|
| **Topic filtering** | Focus on weak areas |
| **Instant feedback** | Know immediately if correct |
| **Explanations** | Learn WHY the answer is right |
| **Score tracking** | See progress over time |
| **Shuffle options** | Prevent memorizing position |
| **Review wrong answers** | Focus on mistakes |
| **Timer (optional)** | Simulate exam conditions |

---

## Lesson 2: Design the Question Bank

### Question Data Structure

```jsx
const questionBank = [
  // ── JAVASCRIPT ──
  {
    id: 1,
    topic: "JavaScript",
    difficulty: "easy",
    question: "What is the output of: typeof null?",
    options: ['"null"', '"undefined"', '"object"', '"boolean"'],
    correct: 2, // index of correct answer (0-based)
    explanation:
      'typeof null returns "object" — this is a well-known bug in JavaScript that has existed since the first version. It was never fixed because too much code depends on it.',
  },
  {
    id: 2,
    topic: "JavaScript",
    difficulty: "easy",
    question: "Which keyword declares a block-scoped variable?",
    options: ["var", "let", "both var and let", "none of these"],
    correct: 1,
    explanation:
      '"let" is block-scoped (only available inside {}). "var" is function-scoped and gets hoisted to the top of the function.',
  },
  {
    id: 3,
    topic: "JavaScript",
    difficulty: "medium",
    question: "What does Array.prototype.reduce() do?",
    options: [
      "Removes elements from an array",
      "Reduces array size by half",
      "Accumulates array values into a single result",
      "Filters out falsy values",
    ],
    correct: 2,
    explanation:
      "reduce() executes a reducer function on each element, accumulating a single output value. Example: [1,2,3].reduce((sum, n) => sum + n, 0) returns 6.",
  },
  {
    id: 4,
    topic: "JavaScript",
    difficulty: "medium",
    question: "What is a closure in JavaScript?",
    options: [
      "A way to close the browser window",
      "A function that has access to its outer scope's variables",
      "A method to close database connections",
      "A loop that terminates itself",
    ],
    correct: 1,
    explanation:
      'A closure is a function that "remembers" the variables from its outer scope even after the outer function has returned. This is fundamental to JavaScript patterns like callbacks and module patterns.',
  },
  {
    id: 5,
    topic: "JavaScript",
    difficulty: "hard",
    question: 'What is the output of: console.log(0.1 + 0.2 === 0.3)?',
    options: ["true", "false", "undefined", "NaN"],
    correct: 1,
    explanation:
      "Due to floating-point precision, 0.1 + 0.2 = 0.30000000000000004, not exactly 0.3. Use Math.abs(0.1 + 0.2 - 0.3) < Number.EPSILON for safe comparison.",
  },

  // ── SQL ──
  {
    id: 6,
    topic: "SQL",
    difficulty: "easy",
    question: "Which SQL command is used to retrieve data from a table?",
    options: ["GET", "FETCH", "SELECT", "RETRIEVE"],
    correct: 2,
    explanation:
      "SELECT is the standard SQL command for querying data. Example: SELECT * FROM users WHERE age > 18;",
  },
  {
    id: 7,
    topic: "SQL",
    difficulty: "easy",
    question: "What does PRIMARY KEY mean?",
    options: [
      "The most important column",
      "A unique identifier for each row — no duplicates, no nulls",
      "The first column in a table",
      "A password for the database",
    ],
    correct: 1,
    explanation:
      "A PRIMARY KEY uniquely identifies each row. It must be unique (no duplicates) and NOT NULL. Common examples: id, user_id, order_id.",
  },
  {
    id: 8,
    topic: "SQL",
    difficulty: "medium",
    question: "What is the difference between WHERE and HAVING?",
    options: [
      "They are the same",
      "WHERE filters rows, HAVING filters groups after GROUP BY",
      "HAVING is faster than WHERE",
      "WHERE works only with JOINs",
    ],
    correct: 1,
    explanation:
      "WHERE filters individual rows BEFORE grouping. HAVING filters groups AFTER GROUP BY. Example: SELECT dept, COUNT(*) FROM employees GROUP BY dept HAVING COUNT(*) > 5;",
  },
  {
    id: 9,
    topic: "SQL",
    difficulty: "medium",
    question: "Which JOIN returns all rows from both tables?",
    options: ["INNER JOIN", "LEFT JOIN", "RIGHT JOIN", "FULL OUTER JOIN"],
    correct: 3,
    explanation:
      "FULL OUTER JOIN returns all rows from both tables. Where there's no match, NULL is filled in. INNER JOIN only returns matching rows.",
  },
  {
    id: 10,
    topic: "SQL",
    difficulty: "hard",
    question: "What is a SQL injection attack?",
    options: [
      "Inserting data too quickly",
      "Malicious SQL code inserted through user input to manipulate queries",
      "A way to speed up queries",
      "A method to compress databases",
    ],
    correct: 1,
    explanation:
      'SQL injection is when an attacker enters malicious SQL like: \' OR 1=1 --  in a login form. Prevent it by using parameterized queries ($1, $2) instead of string concatenation.',
  },

  // ── PYTHON ──
  {
    id: 11,
    topic: "Python",
    difficulty: "easy",
    question: "How do you create a list in Python?",
    options: [
      "list = (1, 2, 3)",
      "list = [1, 2, 3]",
      "list = {1, 2, 3}",
      'list = "1, 2, 3"',
    ],
    correct: 1,
    explanation:
      "Lists use square brackets []. Parentheses () create tuples, curly braces {} create sets or dicts.",
  },
  {
    id: 12,
    topic: "Python",
    difficulty: "medium",
    question: "What is a list comprehension?",
    options: [
      "A way to understand lists better",
      "A compact way to create lists from existing iterables",
      "A function to compress lists",
      "A debugging tool for lists",
    ],
    correct: 1,
    explanation:
      "List comprehension: [x**2 for x in range(5)] creates [0, 1, 4, 9, 16]. It's a concise alternative to a for loop with append.",
  },

  // ── DATA STRUCTURES ──
  {
    id: 13,
    topic: "Data Structures",
    difficulty: "easy",
    question: "What is the time complexity of accessing an array element by index?",
    options: ["O(n)", "O(log n)", "O(1)", "O(n²)"],
    correct: 2,
    explanation:
      "Array access is O(1) — constant time. The memory address is calculated directly: base_address + (index × element_size). No searching needed.",
  },
  {
    id: 14,
    topic: "Data Structures",
    difficulty: "medium",
    question: "Which data structure uses FIFO (First In, First Out)?",
    options: ["Stack", "Queue", "Linked List", "Binary Tree"],
    correct: 1,
    explanation:
      "A Queue uses FIFO — like a line at a store. The first person in line is served first. A Stack uses LIFO (Last In, First Out). Think of a stack of plates.",
  },
  {
    id: 15,
    topic: "Data Structures",
    difficulty: "hard",
    question: "What is the worst-case time complexity of QuickSort?",
    options: ["O(n log n)", "O(n²)", "O(n)", "O(log n)"],
    correct: 1,
    explanation:
      "QuickSort's worst case is O(n²) when the pivot is always the smallest or largest element (already sorted data). Average case is O(n log n). Using random pivot selection avoids worst case in practice.",
  },

  // ── GIT ──
  {
    id: 16,
    topic: "Git",
    difficulty: "easy",
    question: "What does 'git init' do?",
    options: [
      "Downloads a repository",
      "Creates a new Git repository in the current directory",
      "Initializes the internet connection",
      "Installs Git on your computer",
    ],
    correct: 1,
    explanation:
      "git init creates a new .git directory in your project folder, initializing it as a Git repository. It starts tracking changes from that point.",
  },
  {
    id: 17,
    topic: "Git",
    difficulty: "medium",
    question: "What is the difference between 'git merge' and 'git rebase'?",
    options: [
      "They do the same thing",
      "Merge creates a merge commit; rebase replays commits on top of another branch",
      "Rebase is always better",
      "Merge deletes the source branch",
    ],
    correct: 1,
    explanation:
      "Merge creates a new merge commit that combines two branches. Rebase moves your commits to the tip of another branch, creating a linear history. Both integrate changes but produce different commit histories.",
  },

  // ── HTML/CSS ──
  {
    id: 18,
    topic: "HTML/CSS",
    difficulty: "easy",
    question: "What does CSS stand for?",
    options: [
      "Computer Style Sheets",
      "Cascading Style Sheets",
      "Creative Style System",
      "Colorful Style Sheets",
    ],
    correct: 1,
    explanation:
      'CSS = Cascading Style Sheets. "Cascading" means styles can override each other based on specificity and order — later rules and more specific selectors win.',
  },
  {
    id: 19,
    topic: "HTML/CSS",
    difficulty: "medium",
    question: 'What is the CSS "box model"?',
    options: [
      "A 3D rendering technique",
      "Content + Padding + Border + Margin around every element",
      "A way to create boxes with CSS",
      "A responsive design framework",
    ],
    correct: 1,
    explanation:
      "Every HTML element is a box with 4 layers: Content (the text/image), Padding (space inside the border), Border (the edge), and Margin (space outside the border).",
  },
  {
    id: 20,
    topic: "HTML/CSS",
    difficulty: "medium",
    question: "What does 'display: flex' do?",
    options: [
      "Makes the element invisible",
      "Creates a flexible container that arranges children in a row or column",
      "Makes text italic",
      "Adds animation to the element",
    ],
    correct: 1,
    explanation:
      "Flexbox (display: flex) creates a one-dimensional layout system. Children are arranged in a row (default) or column, and you can control alignment, spacing, and wrapping with properties like justify-content, align-items, and flex-wrap.",
  },
]
```

### Topic & Difficulty Overview

| Topic | Easy | Medium | Hard | Total |
|-------|------|--------|------|-------|
| JavaScript | 2 | 2 | 1 | 5 |
| SQL | 2 | 2 | 1 | 5 |
| Python | 1 | 1 | 0 | 2 |
| Data Structures | 1 | 1 | 1 | 3 |
| Git | 1 | 1 | 0 | 2 |
| HTML/CSS | 1 | 2 | 0 | 3 |

> **Tip**: Add more questions as you learn! The question bank grows with you.

---

## Lesson 3: Build the MCQ Practice Component

### Create `src/components/McqPractice.jsx`:

```jsx
import React, { useState, useMemo } from "react"

function McqPractice() {
  // ── State ──
  const [selectedTopic, setSelectedTopic] = useState("All")
  const [selectedDifficulty, setSelectedDifficulty] = useState("All")
  const [currentIndex, setCurrentIndex] = useState(0)
  const [selectedAnswer, setSelectedAnswer] = useState(null)
  const [showExplanation, setShowExplanation] = useState(false)
  const [score, setScore] = useState({ correct: 0, wrong: 0, skipped: 0 })
  const [answers, setAnswers] = useState({}) // { questionId: { selected, correct } }
  const [quizStarted, setQuizStarted] = useState(false)
  const [quizFinished, setQuizFinished] = useState(false)
  const [timer, setTimer] = useState(0)
  const [timerActive, setTimerActive] = useState(false)
  const [showReview, setShowReview] = useState(false)

  // questionBank would be imported or defined above
  // Using the data from Lesson 2

  // ── Filter questions ──
  const filteredQuestions = useMemo(() => {
    let qs = [...questionBank]
    if (selectedTopic !== "All") qs = qs.filter((q) => q.topic === selectedTopic)
    if (selectedDifficulty !== "All") qs = qs.filter((q) => q.difficulty === selectedDifficulty)
    return qs
  }, [selectedTopic, selectedDifficulty])

  const topics = ["All", ...new Set(questionBank.map((q) => q.topic))]
  const difficulties = ["All", "easy", "medium", "hard"]

  const currentQuestion = filteredQuestions[currentIndex]

  // ── Timer ──
  React.useEffect(() => {
    let interval
    if (timerActive) {
      interval = setInterval(() => setTimer((t) => t + 1), 1000)
    }
    return () => clearInterval(interval)
  }, [timerActive])

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m.toString().padStart(2, "0")}:${s.toString().padStart(2, "0")}`
  }

  // ── Actions ──
  const startQuiz = () => {
    setQuizStarted(true)
    setQuizFinished(false)
    setCurrentIndex(0)
    setSelectedAnswer(null)
    setShowExplanation(false)
    setScore({ correct: 0, wrong: 0, skipped: 0 })
    setAnswers({})
    setTimer(0)
    setTimerActive(true)
    setShowReview(false)
  }

  const handleAnswer = (optionIndex) => {
    if (selectedAnswer !== null) return // Already answered

    setSelectedAnswer(optionIndex)
    setShowExplanation(true)

    const isCorrect = optionIndex === currentQuestion.correct
    setScore((prev) => ({
      ...prev,
      correct: prev.correct + (isCorrect ? 1 : 0),
      wrong: prev.wrong + (isCorrect ? 0 : 1),
    }))
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: {
        selected: optionIndex,
        correct: currentQuestion.correct,
        isCorrect,
      },
    }))
  }

  const nextQuestion = () => {
    if (currentIndex + 1 >= filteredQuestions.length) {
      setQuizFinished(true)
      setTimerActive(false)
      return
    }
    setCurrentIndex((i) => i + 1)
    setSelectedAnswer(null)
    setShowExplanation(false)
  }

  const skipQuestion = () => {
    setScore((prev) => ({ ...prev, skipped: prev.skipped + 1 }))
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { selected: -1, correct: currentQuestion.correct, isCorrect: false },
    }))
    nextQuestion()
  }

  const getDifficultyColor = (d) => {
    switch (d) {
      case "easy": return "#4CAF50"
      case "medium": return "#ffd700"
      case "hard": return "#f44336"
      default: return "#888"
    }
  }

  // ── RENDER ──

  // Start Screen
  if (!quizStarted) {
    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        <h1 style={{ color: "#fff", marginBottom: "8px" }}>MCQ Practice Engine</h1>
        <p style={{ color: "#888", marginBottom: "32px" }}>Select topic and difficulty, then start!</p>

        <div style={{ display: "flex", gap: "16px", marginBottom: "24px" }}>
          <div>
            <label style={{ fontSize: "13px", color: "#888" }}>Topic:</label>
            <select
              value={selectedTopic}
              onChange={(e) => setSelectedTopic(e.target.value)}
              style={{
                display: "block",
                marginTop: "4px",
                padding: "8px 16px",
                backgroundColor: "#2d2d2d",
                color: "#d4d4d4",
                border: "1px solid #555",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              {topics.map((t) => (
                <option key={t} value={t}>{t}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ fontSize: "13px", color: "#888" }}>Difficulty:</label>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              style={{
                display: "block",
                marginTop: "4px",
                padding: "8px 16px",
                backgroundColor: "#2d2d2d",
                color: "#d4d4d4",
                border: "1px solid #555",
                borderRadius: "4px",
                fontSize: "14px",
              }}
            >
              {difficulties.map((d) => (
                <option key={d} value={d}>{d}</option>
              ))}
            </select>
          </div>
        </div>

        <p style={{ color: "#888", marginBottom: "16px" }}>
          {filteredQuestions.length} questions available
        </p>

        <button
          onClick={startQuiz}
          disabled={filteredQuestions.length === 0}
          style={{
            padding: "12px 48px",
            backgroundColor: filteredQuestions.length > 0 ? "#4CAF50" : "#555",
            color: "white",
            border: "none",
            borderRadius: "6px",
            fontSize: "16px",
            fontWeight: "bold",
            cursor: filteredQuestions.length > 0 ? "pointer" : "not-allowed",
          }}
        >
          Start Quiz ({filteredQuestions.length} Qs)
        </button>
      </div>
    )
  }

  // Results Screen
  if (quizFinished && !showReview) {
    const total = score.correct + score.wrong + score.skipped
    const percentage = total > 0 ? Math.round((score.correct / total) * 100) : 0
    const grade =
      percentage >= 90 ? "A+" :
      percentage >= 80 ? "A" :
      percentage >= 70 ? "B" :
      percentage >= 60 ? "C" :
      percentage >= 50 ? "D" : "F"

    return (
      <div style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "100vh",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        fontFamily: "'Segoe UI', sans-serif",
      }}>
        <h1 style={{ color: "#fff", marginBottom: "4px" }}>Quiz Complete!</h1>
        <p style={{ color: "#888", marginBottom: "24px" }}>Time: {formatTime(timer)}</p>

        <div style={{
          width: "120px",
          height: "120px",
          borderRadius: "50%",
          border: `6px solid ${percentage >= 70 ? "#4CAF50" : percentage >= 50 ? "#ffd700" : "#f44336"}`,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          marginBottom: "24px",
        }}>
          <span style={{ fontSize: "32px", fontWeight: "bold", color: "#fff" }}>{percentage}%</span>
          <span style={{ fontSize: "14px", color: "#888" }}>Grade: {grade}</span>
        </div>

        <div style={{ display: "flex", gap: "24px", marginBottom: "32px" }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#4CAF50" }}>{score.correct}</div>
            <div style={{ fontSize: "13px", color: "#888" }}>Correct</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#f44336" }}>{score.wrong}</div>
            <div style={{ fontSize: "13px", color: "#888" }}>Wrong</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "28px", fontWeight: "bold", color: "#888" }}>{score.skipped}</div>
            <div style={{ fontSize: "13px", color: "#888" }}>Skipped</div>
          </div>
        </div>

        <div style={{ display: "flex", gap: "12px" }}>
          <button
            onClick={() => setShowReview(true)}
            style={{
              padding: "10px 24px",
              backgroundColor: "#2196F3",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            Review Answers
          </button>
          <button
            onClick={() => setQuizStarted(false)}
            style={{
              padding: "10px 24px",
              backgroundColor: "#4CAF50",
              color: "white",
              border: "none",
              borderRadius: "4px",
              fontSize: "14px",
              cursor: "pointer",
            }}
          >
            New Quiz
          </button>
        </div>
      </div>
    )
  }

  // Review Screen
  if (showReview) {
    return (
      <div style={{
        height: "100vh",
        backgroundColor: "#1e1e1e",
        color: "#d4d4d4",
        fontFamily: "'Segoe UI', sans-serif",
        overflow: "auto",
        padding: "20px",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
          <h2 style={{ color: "#fff", margin: 0 }}>Review Answers</h2>
          <button
            onClick={() => setQuizStarted(false)}
            style={{
              padding: "8px 20px",
              backgroundColor: "#333",
              color: "#d4d4d4",
              border: "1px solid #555",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            Back to Home
          </button>
        </div>

        {filteredQuestions.map((q, i) => {
          const answer = answers[q.id]
          return (
            <div key={q.id} style={{
              marginBottom: "16px",
              padding: "16px",
              backgroundColor: "#252526",
              borderRadius: "6px",
              borderLeft: `4px solid ${!answer ? "#888" : answer.isCorrect ? "#4CAF50" : "#f44336"}`,
            }}>
              <div style={{ display: "flex", gap: "8px", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "13px", fontWeight: "bold", color: "#888" }}>Q{i + 1}</span>
                <span style={{
                  padding: "2px 8px",
                  backgroundColor: getDifficultyColor(q.difficulty),
                  color: q.difficulty === "easy" ? "#fff" : "#000",
                  borderRadius: "10px",
                  fontSize: "11px",
                  fontWeight: "bold",
                }}>
                  {q.difficulty}
                </span>
              </div>
              <div style={{ fontSize: "14px", marginBottom: "8px" }}>{q.question}</div>
              {q.options.map((opt, oi) => (
                <div key={oi} style={{
                  padding: "4px 8px",
                  fontSize: "13px",
                  color:
                    oi === q.correct ? "#4CAF50" :
                    answer?.selected === oi ? "#f44336" : "#888",
                  fontWeight: oi === q.correct ? "bold" : "normal",
                }}>
                  {oi === q.correct ? "✅" : answer?.selected === oi ? "❌" : "○"} {opt}
                </div>
              ))}
              <div style={{
                marginTop: "8px",
                padding: "8px",
                backgroundColor: "#1e1e1e",
                borderRadius: "4px",
                fontSize: "12px",
                color: "#ffd700",
              }}>
                💡 {q.explanation}
              </div>
            </div>
          )
        })}
      </div>
    )
  }

  // Quiz Screen
  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Header Bar */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "12px 20px",
        backgroundColor: "#252526",
        borderBottom: "2px solid #333",
      }}>
        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontWeight: "bold" }}>
            Q{currentIndex + 1}/{filteredQuestions.length}
          </span>
          <span style={{
            padding: "2px 10px",
            backgroundColor: getDifficultyColor(currentQuestion.difficulty),
            color: currentQuestion.difficulty === "easy" ? "#fff" : "#000",
            borderRadius: "10px",
            fontSize: "12px",
            fontWeight: "bold",
          }}>
            {currentQuestion.difficulty}
          </span>
          <span style={{ color: "#888", fontSize: "13px" }}>{currentQuestion.topic}</span>
        </div>

        <div style={{ display: "flex", gap: "16px", alignItems: "center" }}>
          <span style={{ fontFamily: "monospace", fontSize: "16px" }}>{formatTime(timer)}</span>
          <span style={{ color: "#4CAF50" }}>✅ {score.correct}</span>
          <span style={{ color: "#f44336" }}>❌ {score.wrong}</span>
        </div>
      </div>

      {/* Progress Bar */}
      <div style={{ height: "4px", backgroundColor: "#333" }}>
        <div style={{
          height: "100%",
          width: `${((currentIndex + 1) / filteredQuestions.length) * 100}%`,
          backgroundColor: "#4CAF50",
          transition: "width 0.3s ease",
        }} />
      </div>

      {/* Question */}
      <div style={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "40px 20px",
        maxWidth: "700px",
        margin: "0 auto",
        width: "100%",
      }}>
        <h2 style={{ color: "#fff", fontSize: "20px", marginBottom: "32px", textAlign: "center", lineHeight: 1.5 }}>
          {currentQuestion.question}
        </h2>

        {/* Options */}
        <div style={{ width: "100%", display: "flex", flexDirection: "column", gap: "12px" }}>
          {currentQuestion.options.map((option, i) => {
            let bgColor = "#252526"
            let borderColor = "#444"

            if (selectedAnswer !== null) {
              if (i === currentQuestion.correct) {
                bgColor = "#1a3a1a"
                borderColor = "#4CAF50"
              } else if (i === selectedAnswer) {
                bgColor = "#3a1a1a"
                borderColor = "#f44336"
              }
            }

            return (
              <button
                key={i}
                onClick={() => handleAnswer(i)}
                disabled={selectedAnswer !== null}
                style={{
                  padding: "14px 20px",
                  backgroundColor: bgColor,
                  color: "#d4d4d4",
                  border: `2px solid ${borderColor}`,
                  borderRadius: "8px",
                  fontSize: "15px",
                  textAlign: "left",
                  cursor: selectedAnswer !== null ? "default" : "pointer",
                  transition: "all 0.2s ease",
                }}
              >
                <span style={{ marginRight: "12px", fontWeight: "bold", color: "#888" }}>
                  {String.fromCharCode(65 + i)}.
                </span>
                {option}
              </button>
            )
          })}
        </div>

        {/* Explanation */}
        {showExplanation && (
          <div style={{
            width: "100%",
            marginTop: "24px",
            padding: "16px",
            backgroundColor: "#252526",
            borderRadius: "8px",
            borderLeft: "4px solid #ffd700",
          }}>
            <div style={{ fontWeight: "bold", color: "#ffd700", marginBottom: "8px" }}>
              💡 Explanation
            </div>
            <div style={{ fontSize: "14px", lineHeight: 1.6 }}>
              {currentQuestion.explanation}
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div style={{ display: "flex", gap: "12px", marginTop: "24px" }}>
          {selectedAnswer === null && (
            <button
              onClick={skipQuestion}
              style={{
                padding: "10px 24px",
                backgroundColor: "transparent",
                color: "#888",
                border: "1px solid #555",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
              }}
            >
              Skip →
            </button>
          )}
          {selectedAnswer !== null && (
            <button
              onClick={nextQuestion}
              style={{
                padding: "10px 32px",
                backgroundColor: "#4CAF50",
                color: "white",
                border: "none",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "14px",
                fontWeight: "bold",
              }}
            >
              {currentIndex + 1 >= filteredQuestions.length ? "Finish Quiz" : "Next Question →"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default McqPractice
```

> **Checkpoint**: Can you select a topic, start the quiz, answer questions, and see results? Move on!

---

## Lesson 4: How the Quiz Engine Works

### State Machine

```
┌──────────┐     Start     ┌──────────┐    Answer    ┌────────────┐
│  CONFIG   │ ────────────► │ QUESTION │ ───────────► │ EXPLANATION│
│  Screen   │               │  Screen  │              │   Shown    │
└──────────┘               └──────────┘             └─────┬──────┘
     ▲                          │                         │
     │                          │ Skip                    │ Next
     │                          ▼                         ▼
     │                    ┌──────────┐              ┌──────────┐
     │                    │   NEXT   │ ◄────────────│   LAST   │
     │                    │ Question │              │ Question │
     │                    └──────────┘              └─────┬────┘
     │                                                    │
     │          New Quiz  ┌──────────┐    Finish          │
     └────────────────────│ RESULTS  │ ◄──────────────────┘
                          │  Screen  │
                          └─────┬────┘
                                │
                                ▼
                          ┌──────────┐
                          │  REVIEW  │
                          │  Screen  │
                          └──────────┘
```

### Scoring Logic

```
For each question:
  ├── User selects correct answer  → score.correct += 1
  ├── User selects wrong answer    → score.wrong += 1
  └── User clicks "Skip"          → score.skipped += 1

Final percentage = (correct / total) × 100

Grade:
  90-100% → A+
  80-89%  → A
  70-79%  → B
  60-69%  → C
  50-59%  → D
  0-49%   → F
```

---

## Lesson 5: Adding More Questions

### How to Write Good MCQ Questions

| Rule | Good Example | Bad Example |
|------|-------------|-------------|
| One clear correct answer | "What does `===` check?" | "Is `===` good?" |
| Plausible distractors | All options look reasonable | Obviously wrong options |
| Test understanding | "What happens when..." | "Memorize this definition" |
| Include explanation | Why the answer is correct | Just "correct/wrong" |

### Question Template

```jsx
{
  id: 21,                          // Unique ID
  topic: "Your Topic",             // Category for filtering
  difficulty: "easy",              // easy | medium | hard
  question: "Clear, specific question?",
  options: [
    "Plausible wrong answer A",
    "The correct answer",          // Put at varying positions
    "Plausible wrong answer C",
    "Plausible wrong answer D",
  ],
  correct: 1,                      // 0-based index of correct answer
  explanation: "Clear explanation of WHY this is correct and why others are wrong.",
}
```

### Try It: Add 5 Questions

Add questions for a topic you're currently studying:

1. Think of a concept you learned recently
2. Write a question that tests understanding (not memorization)
3. Create 4 options — 1 correct, 3 plausible
4. Write an explanation
5. Add it to the `questionBank` array

---

## Lesson 6: Shuffle Options for Better Practice

Prevent memorizing answer positions:

```jsx
// Shuffle function using Fisher-Yates algorithm
const shuffleWithAnswer = (options, correctIndex) => {
  const shuffled = options.map((text, originalIndex) => ({
    text,
    isCorrect: originalIndex === correctIndex,
  }))

  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }

  return {
    options: shuffled.map((s) => s.text),
    correct: shuffled.findIndex((s) => s.isCorrect),
  }
}

// Use it when displaying a question:
const { options, correct } = useMemo(
  () => shuffleWithAnswer(currentQuestion.options, currentQuestion.correct),
  [currentQuestion.id]
)
```

---

## Lesson 7: Common Quiz Engine Mistakes

### Mistake 1: All correct answers are option B

```
❌ Every correct answer is the same position
✅ Vary the correct answer index: 0, 1, 2, 3 evenly
   OR use shuffle (Lesson 6)
```

### Mistake 2: Obvious wrong options

```
❌ "What is 2 + 2?"   Options: 4, Pizza, Elephant, The Moon
✅ "What is 2 + 2?"   Options: 3, 4, 5, 22
   All options should be plausible
```

### Mistake 3: Questions that test memorization over understanding

```
❌ "In which year was JavaScript created?"
✅ "What problem does JavaScript's event loop solve?"
   Focus on concepts, not trivia
```

### Mistake 4: No explanation for wrong answers

```
❌ "Wrong! The answer is B."
✅ "Wrong! The answer is B because closures capture
    variables by reference, not by value. This means
    the variable is looked up when the function runs,
    not when it was created."
```

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | Why MCQs work | Active recall (testing yourself) retains 70-90% vs 10-20% for passive reading |
| 2 | Question bank design | Structured data: question, options, correct index, explanation, topic, difficulty |
| 3 | Building the component | Config screen → quiz screen → results → review flow |
| 4 | Quiz state machine | Start → Answer → Explain → Next → Finish → Review |
| 5 | Adding questions | Write clear questions with plausible distractors and explanations |
| 6 | Shuffling options | Fisher-Yates algorithm to randomize option positions |
| 7 | Common mistakes | Avoid pattern answers, obvious distractors, memorization-only questions |

### What to Build Next

- [ ] Save question bank to localStorage for persistence
- [ ] Import/export questions as JSON
- [ ] Add timed mode (30s per question countdown)
- [ ] Track performance by topic over multiple quizzes
- [ ] Add "bookmark" for difficult questions
- [ ] Support multiple correct answers (checkbox style)
- [ ] Add code-based questions with syntax-highlighted snippets
- [ ] Spaced repetition: show missed questions more frequently
