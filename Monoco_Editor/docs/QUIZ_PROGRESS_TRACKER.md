# Self-Learning Course: Build a Quiz & Progress Tracker

> **Course Goal**: By the end of this course, you will build a learning analytics dashboard that tracks quiz scores, identifies weak topics, shows progress over time, and provides study recommendations — motivating consistent learning.
>
> **Prerequisites**: Basic React knowledge. Understanding of the MCQ Practice Engine (see MCQ_PRACTICE_ENGINE.md).
>
> **Time**: ~40 minutes, 7 lessons

---

## Lesson 1: Why Track Your Learning Progress?

### The Problem with Untracked Learning

```
Without Tracking:                    With Tracking:
┌──────────────────────┐            ┌──────────────────────┐
│ "I think I studied   │            │ "My JS score went    │
│  enough JavaScript"  │            │  from 45% to 82%     │
│                      │            │  in 3 weeks"         │
│ "I feel like I'm     │    vs.    │                      │
│  getting better"     │            │ "SQL JOINs are my    │
│                      │            │  weakest area — 40%" │
│ "Maybe I should      │            │                      │
│  study more SQL?"    │            │ "I need to practice  │
│                      │            │  3 more topics for   │
│ Feeling ≠ Knowing    │            │  quiz readiness"     │
└──────────────────────┘            └──────────────────────┘
```

### What We'll Track

| Metric | Why It Matters |
|--------|---------------|
| **Score per quiz** | See if you're improving |
| **Score by topic** | Find weak areas |
| **Score by difficulty** | Know your level |
| **Streak / consistency** | Build study habits |
| **Time spent** | Balance study load |
| **Accuracy trend** | Progress over weeks |

---

## Lesson 2: Design the Data Model

### Quiz Result Data Structure

```jsx
// Each completed quiz generates a result object
const quizResult = {
  id: "qr_1717200000",            // Unique ID (timestamp-based)
  date: "2024-06-01T14:30:00Z",   // When the quiz was taken
  topic: "JavaScript",             // Topic filter used
  difficulty: "All",               // Difficulty filter used
  totalQuestions: 10,
  correct: 7,
  wrong: 2,
  skipped: 1,
  percentage: 70,
  timeSpent: 245,                  // seconds
  answers: {                        // Detailed per-question results
    1: { selected: 2, correct: 2, isCorrect: true },
    2: { selected: 0, correct: 1, isCorrect: false },
    // ...
  },
}

// Store all results in localStorage
const STORAGE_KEY = "quiz_progress_data"

const saveResult = (result) => {
  const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  existing.push(result)
  localStorage.setItem(STORAGE_KEY, JSON.stringify(existing))
}

const loadResults = () => {
  return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
}
```

### Data Flow

```
MCQ Practice Engine                    Progress Tracker
┌─────────────────┐                   ┌──────────────────┐
│ User takes quiz  │                   │                  │
│                  │   saveResult()    │  Load from       │
│ Quiz finishes    │ ─────────────►   │  localStorage    │
│                  │                   │                  │
│ Result object    │   localStorage   │  Calculate stats  │
│ saved            │ ◄─────────────►  │  Render charts   │
└─────────────────┘                   │  Show insights   │
                                      └──────────────────┘
```

---

## Lesson 3: Build the Progress Dashboard

### Create `src/components/ProgressTracker.jsx`:

```jsx
import React, { useState, useMemo } from "react"

const STORAGE_KEY = "quiz_progress_data"

function ProgressTracker() {
  const [results, setResults] = useState(() => {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")
  })
  const [selectedTopic, setSelectedTopic] = useState("All")
  const [timeRange, setTimeRange] = useState("all") // "week", "month", "all"

  // ── Computed Statistics ──
  const stats = useMemo(() => {
    let filtered = [...results]

    // Time range filter
    const now = new Date()
    if (timeRange === "week") {
      const weekAgo = new Date(now - 7 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((r) => new Date(r.date) >= weekAgo)
    } else if (timeRange === "month") {
      const monthAgo = new Date(now - 30 * 24 * 60 * 60 * 1000)
      filtered = filtered.filter((r) => new Date(r.date) >= monthAgo)
    }

    // Topic filter
    if (selectedTopic !== "All") {
      filtered = filtered.filter((r) => r.topic === selectedTopic)
    }

    if (filtered.length === 0) {
      return {
        totalQuizzes: 0,
        totalQuestions: 0,
        avgScore: 0,
        bestScore: 0,
        worstScore: 0,
        totalTime: 0,
        avgTime: 0,
        topicBreakdown: {},
        difficultyBreakdown: {},
        recentScores: [],
        streak: 0,
        totalCorrect: 0,
        totalWrong: 0,
      }
    }

    const totalQuizzes = filtered.length
    const totalQuestions = filtered.reduce((s, r) => s + r.totalQuestions, 0)
    const totalCorrect = filtered.reduce((s, r) => s + r.correct, 0)
    const totalWrong = filtered.reduce((s, r) => s + r.wrong, 0)
    const avgScore = Math.round(filtered.reduce((s, r) => s + r.percentage, 0) / totalQuizzes)
    const bestScore = Math.max(...filtered.map((r) => r.percentage))
    const worstScore = Math.min(...filtered.map((r) => r.percentage))
    const totalTime = filtered.reduce((s, r) => s + r.timeSpent, 0)
    const avgTime = Math.round(totalTime / totalQuizzes)

    // Topic breakdown
    const topicBreakdown = {}
    filtered.forEach((r) => {
      if (!topicBreakdown[r.topic]) {
        topicBreakdown[r.topic] = { total: 0, correct: 0, quizzes: 0 }
      }
      topicBreakdown[r.topic].total += r.totalQuestions
      topicBreakdown[r.topic].correct += r.correct
      topicBreakdown[r.topic].quizzes += 1
    })

    // Difficulty breakdown
    const difficultyBreakdown = {}
    filtered.forEach((r) => {
      const d = r.difficulty || "All"
      if (!difficultyBreakdown[d]) {
        difficultyBreakdown[d] = { total: 0, correct: 0, quizzes: 0 }
      }
      difficultyBreakdown[d].total += r.totalQuestions
      difficultyBreakdown[d].correct += r.correct
      difficultyBreakdown[d].quizzes += 1
    })

    // Recent scores for trend chart (last 10)
    const recentScores = filtered
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(-10)
      .map((r) => ({ date: r.date, score: r.percentage, topic: r.topic }))

    // Study streak - consecutive days with at least one quiz
    let streak = 0
    const today = new Date().toDateString()
    const dates = [...new Set(results.map((r) => new Date(r.date).toDateString()))]
      .sort((a, b) => new Date(b) - new Date(a))

    for (let i = 0; i < dates.length; i++) {
      const expected = new Date()
      expected.setDate(expected.getDate() - i)
      if (dates[i] === expected.toDateString()) {
        streak++
      } else {
        break
      }
    }

    return {
      totalQuizzes,
      totalQuestions,
      avgScore,
      bestScore,
      worstScore,
      totalTime,
      avgTime,
      topicBreakdown,
      difficultyBreakdown,
      recentScores,
      streak,
      totalCorrect,
      totalWrong,
    }
  }, [results, selectedTopic, timeRange])

  const topics = ["All", ...new Set(results.map((r) => r.topic))]

  const formatTime = (seconds) => {
    if (seconds < 60) return `${seconds}s`
    const m = Math.floor(seconds / 60)
    const s = seconds % 60
    return `${m}m ${s}s`
  }

  const clearData = () => {
    if (confirm("Are you sure? This will delete ALL quiz history.")) {
      localStorage.removeItem(STORAGE_KEY)
      setResults([])
    }
  }

  // ── Bar Chart Component (pure CSS) ──
  const BarChart = ({ data, maxValue, color }) => (
    <div style={{ display: "flex", alignItems: "flex-end", gap: "4px", height: "120px" }}>
      {data.map((item, i) => (
        <div key={i} style={{
          flex: 1,
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
        }}>
          <span style={{ fontSize: "11px", color: "#d4d4d4" }}>{item.value}%</span>
          <div style={{
            width: "100%",
            maxWidth: "40px",
            height: `${(item.value / maxValue) * 100}%`,
            backgroundColor: color || "#4CAF50",
            borderRadius: "3px 3px 0 0",
            minHeight: "2px",
          }} />
          <span style={{
            fontSize: "10px",
            color: "#888",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
            maxWidth: "50px",
          }}>
            {item.label}
          </span>
        </div>
      ))}
    </div>
  )

  if (results.length === 0) {
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
        <div style={{ fontSize: "48px", marginBottom: "16px" }}>📊</div>
        <h2 style={{ color: "#fff", marginBottom: "8px" }}>No Quiz Data Yet</h2>
        <p style={{ color: "#888" }}>Take some quizzes in the MCQ Practice Engine first!</p>
        <p style={{ color: "#555", fontSize: "13px", marginTop: "16px" }}>
          Results will appear here automatically after completing a quiz.
        </p>
      </div>
    )
  }

  return (
    <div style={{
      height: "100vh",
      backgroundColor: "#1e1e1e",
      color: "#d4d4d4",
      fontFamily: "'Segoe UI', sans-serif",
      overflow: "auto",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 20px",
        backgroundColor: "#9c27b0",
        color: "white",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}>
        <span style={{ fontWeight: "bold", fontSize: "16px" }}>📊 Quiz Progress Tracker</span>
        <div style={{ display: "flex", gap: "8px", alignItems: "center" }}>
          <select
            value={selectedTopic}
            onChange={(e) => setSelectedTopic(e.target.value)}
            style={{
              padding: "4px 12px",
              backgroundColor: "rgba(255,255,255,0.2)",
              color: "white",
              border: "1px solid rgba(255,255,255,0.3)",
              borderRadius: "4px",
              fontSize: "13px",
            }}
          >
            {topics.map((t) => (
              <option key={t} value={t} style={{ color: "#000" }}>{t}</option>
            ))}
          </select>

          {["week", "month", "all"].map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              style={{
                padding: "4px 12px",
                backgroundColor: timeRange === range ? "white" : "transparent",
                color: timeRange === range ? "#9c27b0" : "white",
                border: "1px solid rgba(255,255,255,0.3)",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "12px",
                fontWeight: timeRange === range ? "bold" : "normal",
              }}
            >
              {range === "all" ? "All Time" : range === "week" ? "This Week" : "This Month"}
            </button>
          ))}
        </div>
      </div>

      <div style={{ padding: "20px", maxWidth: "1200px", margin: "0 auto" }}>
        {/* Top Stats Cards */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))",
          gap: "12px",
          marginBottom: "24px",
        }}>
          {[
            { label: "Quizzes Taken", value: stats.totalQuizzes, icon: "📝", color: "#2196F3" },
            { label: "Questions Done", value: stats.totalQuestions, icon: "❓", color: "#4CAF50" },
            { label: "Avg Score", value: `${stats.avgScore}%`, icon: "📈", color: stats.avgScore >= 70 ? "#4CAF50" : stats.avgScore >= 50 ? "#ffd700" : "#f44336" },
            { label: "Best Score", value: `${stats.bestScore}%`, icon: "🏆", color: "#ffd700" },
            { label: "Study Streak", value: `${stats.streak} day${stats.streak !== 1 ? "s" : ""}`, icon: "🔥", color: "#ff6600" },
            { label: "Total Time", value: formatTime(stats.totalTime), icon: "⏱️", color: "#9c27b0" },
          ].map((card, i) => (
            <div key={i} style={{
              padding: "16px",
              backgroundColor: "#252526",
              borderRadius: "8px",
              borderLeft: `4px solid ${card.color}`,
            }}>
              <div style={{ fontSize: "20px", marginBottom: "4px" }}>{card.icon}</div>
              <div style={{ fontSize: "24px", fontWeight: "bold", color: "#fff" }}>{card.value}</div>
              <div style={{ fontSize: "12px", color: "#888" }}>{card.label}</div>
            </div>
          ))}
        </div>

        {/* Charts Row */}
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginBottom: "24px" }}>
          {/* Score Trend */}
          <div style={{
            padding: "16px",
            backgroundColor: "#252526",
            borderRadius: "8px",
          }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#fff" }}>
              📈 Score Trend (Last 10 Quizzes)
            </h3>
            {stats.recentScores.length > 0 ? (
              <BarChart
                data={stats.recentScores.map((s, i) => ({
                  label: `Q${i + 1}`,
                  value: s.score,
                }))}
                maxValue={100}
                color="#4CAF50"
              />
            ) : (
              <div style={{ color: "#888", textAlign: "center", padding: "40px" }}>
                No recent data
              </div>
            )}
          </div>

          {/* Topic Performance */}
          <div style={{
            padding: "16px",
            backgroundColor: "#252526",
            borderRadius: "8px",
          }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#fff" }}>
              📊 Performance by Topic
            </h3>
            {Object.entries(stats.topicBreakdown).length > 0 ? (
              <BarChart
                data={Object.entries(stats.topicBreakdown).map(([topic, data]) => ({
                  label: topic.substring(0, 6),
                  value: Math.round((data.correct / data.total) * 100),
                }))}
                maxValue={100}
                color="#2196F3"
              />
            ) : (
              <div style={{ color: "#888", textAlign: "center", padding: "40px" }}>
                No topic data
              </div>
            )}
          </div>
        </div>

        {/* Topic Breakdown Table */}
        <div style={{
          padding: "16px",
          backgroundColor: "#252526",
          borderRadius: "8px",
          marginBottom: "24px",
        }}>
          <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#fff" }}>
            🎯 Detailed Topic Breakdown
          </h3>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ borderBottom: "2px solid #444" }}>
                <th style={{ padding: "8px", textAlign: "left", color: "#888" }}>Topic</th>
                <th style={{ padding: "8px", textAlign: "center", color: "#888" }}>Quizzes</th>
                <th style={{ padding: "8px", textAlign: "center", color: "#888" }}>Questions</th>
                <th style={{ padding: "8px", textAlign: "center", color: "#888" }}>Correct</th>
                <th style={{ padding: "8px", textAlign: "center", color: "#888" }}>Accuracy</th>
                <th style={{ padding: "8px", textAlign: "left", color: "#888" }}>Progress</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(stats.topicBreakdown)
                .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
                .map(([topic, data]) => {
                  const accuracy = Math.round((data.correct / data.total) * 100)
                  return (
                    <tr key={topic} style={{ borderBottom: "1px solid #333" }}>
                      <td style={{ padding: "8px", fontWeight: "bold" }}>{topic}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{data.quizzes}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>{data.total}</td>
                      <td style={{ padding: "8px", textAlign: "center", color: "#4CAF50" }}>{data.correct}</td>
                      <td style={{ padding: "8px", textAlign: "center" }}>
                        <span style={{
                          padding: "2px 8px",
                          borderRadius: "10px",
                          backgroundColor: accuracy >= 70 ? "#1a3a1a" : accuracy >= 50 ? "#3a3a1a" : "#3a1a1a",
                          color: accuracy >= 70 ? "#4CAF50" : accuracy >= 50 ? "#ffd700" : "#f44336",
                          fontWeight: "bold",
                        }}>
                          {accuracy}%
                        </span>
                      </td>
                      <td style={{ padding: "8px" }}>
                        <div style={{
                          height: "8px",
                          backgroundColor: "#333",
                          borderRadius: "4px",
                          overflow: "hidden",
                        }}>
                          <div style={{
                            height: "100%",
                            width: `${accuracy}%`,
                            backgroundColor: accuracy >= 70 ? "#4CAF50" : accuracy >= 50 ? "#ffd700" : "#f44336",
                            borderRadius: "4px",
                            transition: "width 0.5s ease",
                          }} />
                        </div>
                      </td>
                    </tr>
                  )
                })}
            </tbody>
          </table>
        </div>

        {/* Accuracy Overview */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: "16px",
          marginBottom: "24px",
        }}>
          {/* Correct vs Wrong */}
          <div style={{
            padding: "16px",
            backgroundColor: "#252526",
            borderRadius: "8px",
            textAlign: "center",
          }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#fff" }}>
              ✅ Overall Accuracy
            </h3>
            <div style={{ display: "flex", justifyContent: "center", gap: "32px" }}>
              <div>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#4CAF50" }}>
                  {stats.totalCorrect}
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>Correct</div>
              </div>
              <div>
                <div style={{ fontSize: "32px", fontWeight: "bold", color: "#f44336" }}>
                  {stats.totalWrong}
                </div>
                <div style={{ fontSize: "12px", color: "#888" }}>Wrong</div>
              </div>
            </div>
            <div style={{
              marginTop: "12px",
              height: "12px",
              backgroundColor: "#f44336",
              borderRadius: "6px",
              overflow: "hidden",
            }}>
              <div style={{
                height: "100%",
                width: stats.totalQuestions > 0
                  ? `${(stats.totalCorrect / (stats.totalCorrect + stats.totalWrong)) * 100}%`
                  : "0%",
                backgroundColor: "#4CAF50",
                borderRadius: "6px",
              }} />
            </div>
          </div>

          {/* Study Recommendations */}
          <div style={{
            padding: "16px",
            backgroundColor: "#252526",
            borderRadius: "8px",
          }}>
            <h3 style={{ margin: "0 0 12px 0", fontSize: "14px", color: "#fff" }}>
              💡 Study Recommendations
            </h3>
            <div style={{ fontSize: "13px", lineHeight: 1.8 }}>
              {Object.entries(stats.topicBreakdown)
                .filter(([, data]) => (data.correct / data.total) < 0.7)
                .sort(([, a], [, b]) => (a.correct / a.total) - (b.correct / b.total))
                .slice(0, 3)
                .map(([topic, data]) => (
                  <div key={topic} style={{ color: "#ffd700" }}>
                    ⚠️ Practice more <strong>{topic}</strong> ({Math.round((data.correct / data.total) * 100)}% accuracy)
                  </div>
                ))}
              {Object.entries(stats.topicBreakdown)
                .filter(([, data]) => (data.correct / data.total) >= 0.7)
                .map(([topic]) => (
                  <div key={topic} style={{ color: "#4CAF50" }}>
                    ✅ <strong>{topic}</strong> — looking good! Try harder difficulty.
                  </div>
                ))}
              {stats.totalQuizzes < 3 && (
                <div style={{ color: "#888" }}>
                  📝 Take more quizzes for better recommendations.
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Recent Quiz History */}
        <div style={{
          padding: "16px",
          backgroundColor: "#252526",
          borderRadius: "8px",
          marginBottom: "24px",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
            <h3 style={{ margin: 0, fontSize: "14px", color: "#fff" }}>
              📋 Recent Quiz History
            </h3>
            <button
              onClick={clearData}
              style={{
                padding: "4px 12px",
                backgroundColor: "transparent",
                color: "#f44336",
                border: "1px solid #f44336",
                borderRadius: "4px",
                cursor: "pointer",
                fontSize: "11px",
              }}
            >
              Clear All Data
            </button>
          </div>
          {results
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, 10)
            .map((r, i) => (
              <div key={i} style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "8px 12px",
                borderBottom: "1px solid #333",
                fontSize: "13px",
              }}>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ color: "#888" }}>
                    {new Date(r.date).toLocaleDateString()}
                  </span>
                  <span style={{ fontWeight: "bold" }}>{r.topic}</span>
                  <span style={{ color: "#888", fontSize: "11px" }}>{r.difficulty}</span>
                </div>
                <div style={{ display: "flex", gap: "12px", alignItems: "center" }}>
                  <span style={{ color: "#4CAF50" }}>✅ {r.correct}</span>
                  <span style={{ color: "#f44336" }}>❌ {r.wrong}</span>
                  <span style={{
                    padding: "2px 10px",
                    borderRadius: "10px",
                    backgroundColor: r.percentage >= 70 ? "#1a3a1a" : r.percentage >= 50 ? "#3a3a1a" : "#3a1a1a",
                    color: r.percentage >= 70 ? "#4CAF50" : r.percentage >= 50 ? "#ffd700" : "#f44336",
                    fontWeight: "bold",
                  }}>
                    {r.percentage}%
                  </span>
                  <span style={{ color: "#888", fontSize: "12px" }}>{formatTime(r.timeSpent)}</span>
                </div>
              </div>
            ))}
        </div>
      </div>
    </div>
  )
}

export default ProgressTracker
```

> **Checkpoint**: Does the dashboard show stats, charts, and recommendations? Move on!

---

## Lesson 4: Understanding the Dashboard Layout

### Component Structure

```
┌──────────────────────────────────────────────────────────────┐
│ 📊 Quiz Progress Tracker    [Topic ▼] [Week] [Month] [All] │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐    │
│  │📝 12 │ │❓ 120│ │📈 72%│ │🏆 95%│ │🔥 5  │ │⏱ 45m│    │
│  │Quiz  │ │Quest │ │Avg   │ │Best  │ │Streak│ │Time  │    │
│  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘ └──────┘    │
│                                                              │
│  ┌──────────────────────┐ ┌──────────────────────┐          │
│  │ 📈 Score Trend       │ │ 📊 Topic Performance │          │
│  │  ██                  │ │  ██ ██               │          │
│  │  ██ ██    ██         │ │  ██ ██ ██    ██      │          │
│  │  ██ ██ ██ ██ ██      │ │  ██ ██ ██ ██ ██      │          │
│  │  Q1 Q2 Q3 Q4 Q5     │ │  JS SQL Py DSA Git   │          │
│  └──────────────────────┘ └──────────────────────┘          │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 🎯 Topic Breakdown                                     │  │
│  │ Topic      Quizzes  Questions  Correct  Accuracy  Bar  │  │
│  │ SQL          3        15        8        53%  ████░░░  │  │
│  │ Python       2        10        7        70%  ██████░  │  │
│  │ JavaScript   5        25       21        84%  ████████ │  │
│  └────────────────────────────────────────────────────────┘  │
│                                                              │
│  ┌─────────────────────────┐ ┌────────────────────────────┐ │
│  │ ✅ Overall Accuracy     │ │ 💡 Recommendations          │ │
│  │ Correct: 36  Wrong: 14  │ │ ⚠️ Practice SQL (53%)       │ │
│  │ ██████████████░░░░░     │ │ ✅ JavaScript — looking good │ │
│  └─────────────────────────┘ └────────────────────────────┘ │
│                                                              │
│  ┌────────────────────────────────────────────────────────┐  │
│  │ 📋 Recent Quiz History                  [Clear Data]   │  │
│  │ Jun 1  JavaScript  All   ✅7 ❌2  70%  4m 5s           │  │
│  │ May 31 SQL         easy  ✅5 ❌0  100% 2m 30s          │  │
│  │ May 30 Python      med   ✅3 ❌2  60%  3m 15s          │  │
│  └────────────────────────────────────────────────────────┘  │
└──────────────────────────────────────────────────────────────┘
```

---

## Lesson 5: Connect MCQ Engine to Progress Tracker

### Modify the MCQ Practice Engine to Save Results

In your `McqPractice.jsx`, when the quiz finishes, save the result:

```jsx
// When quiz finishes (in the nextQuestion function, when at last question):
const finishQuiz = () => {
  setQuizFinished(true)
  setTimerActive(false)

  // Save result to localStorage for the Progress Tracker
  const result = {
    id: `qr_${Date.now()}`,
    date: new Date().toISOString(),
    topic: selectedTopic,
    difficulty: selectedDifficulty,
    totalQuestions: filteredQuestions.length,
    correct: score.correct,
    wrong: score.wrong,
    skipped: score.skipped,
    percentage: Math.round(
      (score.correct / filteredQuestions.length) * 100
    ),
    timeSpent: timer,
    answers: answers,
  }

  const existing = JSON.parse(
    localStorage.getItem("quiz_progress_data") || "[]"
  )
  existing.push(result)
  localStorage.setItem("quiz_progress_data", JSON.stringify(existing))
}
```

### The Data Pipeline

```
User answers question
       │
       ▼
McqPractice tracks score
       │
       ▼
Quiz finishes
       │
       ▼
Result object created
       │
       ▼
Saved to localStorage ──────► ProgressTracker reads it
                              │
                              ▼
                         Stats calculated
                              │
                              ▼
                         Dashboard rendered
```

---

## Lesson 6: Gamification — Motivating Consistent Practice

### Achievement Badges

```jsx
const getAchievements = (results) => {
  const achievements = []

  if (results.length >= 1)
    achievements.push({ icon: "🎯", name: "First Quiz", desc: "Completed your first quiz" })
  if (results.length >= 10)
    achievements.push({ icon: "📚", name: "Dedicated", desc: "Completed 10 quizzes" })
  if (results.length >= 50)
    achievements.push({ icon: "🏅", name: "Expert", desc: "Completed 50 quizzes" })

  if (results.some((r) => r.percentage === 100))
    achievements.push({ icon: "💯", name: "Perfect Score", desc: "Got 100% on a quiz" })

  const topics = new Set(results.map((r) => r.topic))
  if (topics.size >= 3)
    achievements.push({ icon: "🌈", name: "Well-Rounded", desc: "Practiced 3+ topics" })
  if (topics.size >= 5)
    achievements.push({ icon: "🎓", name: "Scholar", desc: "Practiced 5+ topics" })

  // Streak achievements from stats
  return achievements
}
```

### Achievement Display

```
┌─────────────────────────────────────────┐
│ 🏆 Achievements                         │
│                                         │
│  🎯 First Quiz    📚 Dedicated          │
│  💯 Perfect Score 🌈 Well-Rounded       │
│  🏅 Expert (☐ locked — need 50 quizzes) │
└─────────────────────────────────────────┘
```

### Weekly Goals

```jsx
const weeklyGoal = {
  quizzesTarget: 5,     // Take 5 quizzes per week
  questionsTarget: 50,  // Answer 50 questions per week
  scoreTarget: 70,      // Maintain 70%+ average
}

// Calculate this week's progress
const thisWeek = results.filter((r) => {
  const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  return new Date(r.date) >= weekAgo
})

const weeklyProgress = {
  quizzes: thisWeek.length,
  questions: thisWeek.reduce((s, r) => s + r.totalQuestions, 0),
  avgScore: thisWeek.length > 0
    ? Math.round(thisWeek.reduce((s, r) => s + r.percentage, 0) / thisWeek.length)
    : 0,
}
```

---

## Lesson 7: Making Data-Driven Study Decisions

### Interpreting Your Dashboard

| What You See | What It Means | What to Do |
|-------------|--------------|------------|
| Topic < 50% accuracy | Significant knowledge gap | Focus all study time here |
| Topic 50-70% accuracy | Understanding but needs practice | Regular quiz practice |
| Topic > 70% accuracy | Good grasp | Try harder difficulty |
| Declining trend | Getting worse over time | Review fundamentals |
| Flat trend | Plateau | Try different question types |
| Growing streak | Consistent practice | Keep going! |
| Score varies wildly | Inconsistent understanding | Identify specific weak questions |

### Study Plan Template

Based on your dashboard data:

```
Weekly Study Plan
═════════════════

Monday:    [Weakest Topic] — Easy questions (build confidence)
Tuesday:   [Weakest Topic] — Medium questions (push understanding)
Wednesday: [Second Weakest] — Easy + Medium mix
Thursday:  [Strongest Topic] — Hard questions (challenge yourself)
Friday:    [Mixed Topics] — Review mode (all topics, random)

Weekend:   Review wrong answers from the week
```

### The Feedback Loop

```
Take a Quiz
     │
     ▼
Check Dashboard ◄──────────┐
     │                      │
     ▼                      │
Identify Weak Areas         │
     │                      │
     ▼                      │
Study Those Topics          │
     │                      │
     ▼                      │
Take Another Quiz ──────────┘

Each loop = You get better!
```

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | Why track progress | Data-driven learning beats guessing; know your weak spots |
| 2 | Data model design | Quiz results in localStorage with topic, score, time, answers |
| 3 | Dashboard component | Stats cards, bar charts, topic breakdown, recommendations |
| 4 | Dashboard layout | Six-stat overview, trend charts, detailed tables |
| 5 | MCQ integration | Save quiz results to localStorage on quiz completion |
| 6 | Gamification | Achievements, badges, streaks, weekly goals |
| 7 | Data-driven study | Use accuracy by topic to prioritize what to study |

### What to Build Next

- [ ] Export progress report as PDF
- [ ] Add weekly email summary (with server-side support)
- [ ] Compare performance with friends (leaderboard)
- [ ] Spaced repetition scheduling based on weak topics
- [ ] Add heatmap calendar (like GitHub contribution graph)
- [ ] Set custom goals and track completion
- [ ] Save data to server database instead of only localStorage
- [ ] Add graphs using a chart library (Chart.js or Recharts)
