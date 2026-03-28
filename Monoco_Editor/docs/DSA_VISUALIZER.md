# Self-Learning Course: Build a DSA Visualizer in the Browser

> **Course Goal**: By the end of this course, you will build an interactive Data Structures & Algorithms visualizer that animates sorting algorithms, searching techniques, and data structures step-by-step — helping you SEE how they work.
>
> **Prerequisites**: Basic React knowledge. Basic understanding of arrays and loops.
>
> **Time**: ~50 minutes, 7 lessons

---

## Lesson 1: Why Visualize Algorithms?

Reading about algorithms is one thing. **Watching them work** is completely different. Visualization turns abstract logic into something you can see and understand instantly.

### The Problem with Learning DSA from Books

```
Book says:                               What you see in a visualizer:
"Bubble Sort compares                    ┌─────────────────────────┐
 adjacent elements and                   │ ██                      │
 swaps them if they're                   │ ████  ██    ██████████  │
 in the wrong order.                     │ ████  ████  ██████████  │
 This process repeats                    │ ████  ████  ██████████  │
 n-1 times."                             │ ████  ████████████████  │
                                         └─────────────────────────┘
                                          Two bars turn RED → swap! → turn GREEN
```

Seeing bars move and swap makes algorithms click in seconds.

### What We'll Visualize

```
Sorting Algorithms:            Data Structures:
├── Bubble Sort                ├── Arrays
├── Selection Sort             ├── Stacks
├── Insertion Sort             ├── Queues
├── Merge Sort                 └── Linked Lists
└── Quick Sort

Searching Algorithms:
├── Linear Search
└── Binary Search
```

### How Visualization Helps

| Without Visualization | With Visualization |
|----------------------|-------------------|
| "Sort compares elements" | You SEE which two bars are being compared |
| "It swaps if out of order" | You SEE the bars physically swap positions |
| "Time complexity is O(n²)" | You SEE it get slower with more elements |
| "Binary search halves the range" | You SEE the search space shrink each step |

### Quick Check

> **Question**: Why is Bubble Sort O(n²)?
>
> **Answer**: It does n passes, and each pass compares up to n elements. n × n = n². In the visualizer, you'll literally SEE it doing all those comparisons — and realize why it's slow for large arrays!

---

## Lesson 2: Build the Sorting Visualizer

### Create `src/components/DsaVisualizer.jsx`:

```jsx
import React, { useState, useEffect, useRef } from "react"

function DsaVisualizer() {
  const [array, setArray] = useState([])
  const [arraySize, setArraySize] = useState(30)
  const [speed, setSpeed] = useState(50)
  const [sorting, setSorting] = useState(false)
  const [algorithm, setAlgorithm] = useState("bubble")
  const [comparing, setComparing] = useState([])
  const [swapping, setSwapping] = useState([])
  const [sorted, setSorted] = useState([])
  const [stats, setStats] = useState({ comparisons: 0, swaps: 0 })
  const stopRef = useRef(false)

  // Generate random array
  const generateArray = () => {
    stopRef.current = true
    const newArr = Array.from({ length: arraySize }, () =>
      Math.floor(Math.random() * 400) + 10
    )
    setArray(newArr)
    setComparing([])
    setSwapping([])
    setSorted([])
    setSorting(false)
    setStats({ comparisons: 0, swaps: 0 })
  }

  useEffect(() => {
    generateArray()
  }, [arraySize])

  // Sleep utility for animation
  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

  // ═══════════════════════════════════════
  // BUBBLE SORT
  // ═══════════════════════════════════════
  const bubbleSort = async () => {
    const arr = [...array]
    let comparisons = 0, swaps = 0

    for (let i = 0; i < arr.length - 1; i++) {
      for (let j = 0; j < arr.length - i - 1; j++) {
        if (stopRef.current) return

        setComparing([j, j + 1])
        comparisons++
        await sleep(speed)

        if (arr[j] > arr[j + 1]) {
          // Swap
          ;[arr[j], arr[j + 1]] = [arr[j + 1], arr[j]]
          setSwapping([j, j + 1])
          swaps++
          setArray([...arr])
          await sleep(speed)
          setSwapping([])
        }
      }
      setSorted((prev) => [...prev, arr.length - 1 - i])
      setStats({ comparisons, swaps })
    }

    setSorted(Array.from({ length: arr.length }, (_, i) => i))
    setComparing([])
    setSorting(false)
  }

  // ═══════════════════════════════════════
  // SELECTION SORT
  // ═══════════════════════════════════════
  const selectionSort = async () => {
    const arr = [...array]
    let comparisons = 0, swaps = 0

    for (let i = 0; i < arr.length - 1; i++) {
      let minIdx = i

      for (let j = i + 1; j < arr.length; j++) {
        if (stopRef.current) return

        setComparing([minIdx, j])
        comparisons++
        await sleep(speed)

        if (arr[j] < arr[minIdx]) {
          minIdx = j
        }
      }

      if (minIdx !== i) {
        ;[arr[i], arr[minIdx]] = [arr[minIdx], arr[i]]
        setSwapping([i, minIdx])
        swaps++
        setArray([...arr])
        await sleep(speed)
        setSwapping([])
      }

      setSorted((prev) => [...prev, i])
      setStats({ comparisons, swaps })
    }

    setSorted(Array.from({ length: arr.length }, (_, i) => i))
    setComparing([])
    setSorting(false)
  }

  // ═══════════════════════════════════════
  // INSERTION SORT
  // ═══════════════════════════════════════
  const insertionSort = async () => {
    const arr = [...array]
    let comparisons = 0, swaps = 0

    for (let i = 1; i < arr.length; i++) {
      const key = arr[i]
      let j = i - 1

      setComparing([i])
      await sleep(speed)

      while (j >= 0 && arr[j] > key) {
        if (stopRef.current) return

        comparisons++
        arr[j + 1] = arr[j]
        setSwapping([j, j + 1])
        swaps++
        setArray([...arr])
        await sleep(speed)
        j--
      }

      arr[j + 1] = key
      setArray([...arr])
      setSwapping([])
      setStats({ comparisons, swaps })
    }

    setSorted(Array.from({ length: arr.length }, (_, i) => i))
    setComparing([])
    setSorting(false)
  }

  // ═══════════════════════════════════════
  // QUICK SORT
  // ═══════════════════════════════════════
  const quickSort = async () => {
    const arr = [...array]
    let comparisons = 0, swaps = 0

    const partition = async (low, high) => {
      const pivot = arr[high]
      let i = low - 1

      for (let j = low; j < high; j++) {
        if (stopRef.current) return -1

        setComparing([j, high])
        comparisons++
        await sleep(speed)

        if (arr[j] < pivot) {
          i++
          ;[arr[i], arr[j]] = [arr[j], arr[i]]
          setSwapping([i, j])
          swaps++
          setArray([...arr])
          await sleep(speed)
          setSwapping([])
        }
      }

      ;[arr[i + 1], arr[high]] = [arr[high], arr[i + 1]]
      setSwapping([i + 1, high])
      swaps++
      setArray([...arr])
      await sleep(speed)
      setSwapping([])
      setStats({ comparisons, swaps })

      return i + 1
    }

    const sort = async (low, high) => {
      if (low < high) {
        const pi = await partition(low, high)
        if (pi === -1) return
        setSorted((prev) => [...prev, pi])
        await sort(low, pi - 1)
        await sort(pi + 1, high)
      } else if (low >= 0 && low < arr.length) {
        setSorted((prev) => [...prev, low])
      }
    }

    await sort(0, arr.length - 1)
    setSorted(Array.from({ length: arr.length }, (_, i) => i))
    setComparing([])
    setSorting(false)
  }

  // Start sorting
  const startSort = () => {
    if (sorting) return
    setSorting(true)
    stopRef.current = false
    setSorted([])
    setStats({ comparisons: 0, swaps: 0 })

    switch (algorithm) {
      case "bubble": bubbleSort(); break
      case "selection": selectionSort(); break
      case "insertion": insertionSort(); break
      case "quick": quickSort(); break
    }
  }

  const stopSort = () => {
    stopRef.current = true
    setSorting(false)
  }

  // Get bar color based on state
  const getBarColor = (index) => {
    if (sorted.includes(index)) return "#4CAF50"     // Green = sorted
    if (swapping.includes(index)) return "#ff6348"    // Red = swapping
    if (comparing.includes(index)) return "#ffd700"   // Yellow = comparing
    return "#5dade2"                                   // Blue = default
  }

  const algorithms = [
    { id: "bubble", name: "Bubble Sort", complexity: "O(n²)" },
    { id: "selection", name: "Selection Sort", complexity: "O(n²)" },
    { id: "insertion", name: "Insertion Sort", complexity: "O(n²)" },
    { id: "quick", name: "Quick Sort", complexity: "O(n log n)" },
  ]

  return (
    <div style={{
      display: "flex",
      flexDirection: "column",
      height: "100vh",
      backgroundColor: "#1a1a2e",
      color: "#d4d4d4",
      fontFamily: "'Segoe UI', sans-serif",
    }}>
      {/* Header */}
      <div style={{
        padding: "12px 20px",
        backgroundColor: "#e74c3c",
        color: "white",
        fontWeight: "bold",
        fontSize: "16px",
      }}>
        DSA Visualizer — See Algorithms in Action
      </div>

      {/* Controls */}
      <div style={{
        display: "flex",
        gap: "16px",
        padding: "12px 20px",
        backgroundColor: "#16213e",
        alignItems: "center",
        flexWrap: "wrap",
      }}>
        {/* Algorithm Selector */}
        <div style={{ display: "flex", gap: "6px" }}>
          {algorithms.map((algo) => (
            <button
              key={algo.id}
              onClick={() => setAlgorithm(algo.id)}
              disabled={sorting}
              style={{
                padding: "8px 14px",
                backgroundColor: algorithm === algo.id ? "#e74c3c" : "#2d2d44",
                color: "white",
                border: algorithm === algo.id ? "2px solid #ff6348" : "1px solid #444",
                borderRadius: "6px",
                cursor: sorting ? "not-allowed" : "pointer",
                fontSize: "13px",
              }}
            >
              {algo.name}<br/>
              <span style={{ fontSize: "10px", opacity: 0.7 }}>{algo.complexity}</span>
            </button>
          ))}
        </div>

        {/* Size Slider */}
        <label style={{ fontSize: "13px" }}>
          Size: {arraySize}
          <input
            type="range"
            min="10"
            max="100"
            value={arraySize}
            onChange={(e) => setArraySize(Number(e.target.value))}
            disabled={sorting}
            style={{ marginLeft: "8px", width: "100px" }}
          />
        </label>

        {/* Speed Slider */}
        <label style={{ fontSize: "13px" }}>
          Speed: {speed}ms
          <input
            type="range"
            min="5"
            max="200"
            value={speed}
            onChange={(e) => setSpeed(Number(e.target.value))}
            style={{ marginLeft: "8px", width: "100px" }}
          />
        </label>

        {/* Action Buttons */}
        <button onClick={generateArray} disabled={sorting} style={actionBtn("#3498db")}>
          🔄 New Array
        </button>
        <button onClick={startSort} disabled={sorting} style={actionBtn("#2ecc71")}>
          ▶ Sort
        </button>
        <button onClick={stopSort} disabled={!sorting} style={actionBtn("#e74c3c")}>
          ⏹ Stop
        </button>

        {/* Stats */}
        <div style={{ marginLeft: "auto", fontSize: "13px", color: "#888" }}>
          Comparisons: <b style={{ color: "#ffd700" }}>{stats.comparisons}</b> |
          Swaps: <b style={{ color: "#ff6348" }}>{stats.swaps}</b>
        </div>
      </div>

      {/* Visualization Area */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "flex-end",
        justifyContent: "center",
        gap: "1px",
        padding: "20px",
        overflow: "hidden",
      }}>
        {array.map((value, index) => (
          <div
            key={index}
            style={{
              width: `${Math.max(800 / arraySize - 1, 2)}px`,
              height: `${value}px`,
              backgroundColor: getBarColor(index),
              transition: "height 0.1s ease, background-color 0.15s",
              borderRadius: "2px 2px 0 0",
            }}
          />
        ))}
      </div>

      {/* Legend */}
      <div style={{
        display: "flex",
        gap: "24px",
        justifyContent: "center",
        padding: "12px",
        backgroundColor: "#16213e",
        fontSize: "13px",
      }}>
        <span>🔵 Unsorted</span>
        <span>🟡 Comparing</span>
        <span>🔴 Swapping</span>
        <span>🟢 Sorted</span>
      </div>
    </div>
  )
}

const actionBtn = (bg) => ({
  padding: "8px 16px",
  backgroundColor: bg,
  color: "white",
  border: "none",
  borderRadius: "6px",
  cursor: "pointer",
  fontSize: "13px",
  fontWeight: "bold",
})

export default DsaVisualizer
```

### What we built:

```
┌──────────────────────────────────────────────────────────────┐
│ DSA Visualizer — See Algorithms in Action                    │
├──────────────────────────────────────────────────────────────┤
│ [Bubble] [Selection] [Insertion] [Quick]  Size  Speed  [▶]  │
├──────────────────────────────────────────────────────────────┤
│                                                              │
│     █                        █                               │
│     █  █              █      █                               │
│     █  █  █     █     █   █  █                               │
│  █  █  █  █  █  █  █  █   █  █  █                            │ ← Bars represent
│  █  █  █  █  █  █  █  █   █  █  █  █                         │   array values
│  █  █  █  █  █  █  █  █   █  █  █  █  █                      │
│                                                              │
├──────────────────────────────────────────────────────────────┤
│ 🔵 Unsorted  🟡 Comparing  🔴 Swapping  🟢 Sorted           │
└──────────────────────────────────────────────────────────────┘
```

### Try It Yourself

1. Add the component to your app
2. Click "New Array" — see random bars
3. Select "Bubble Sort" and click "Sort" — watch the bars dance!
4. Try each algorithm — notice the speed difference between O(n²) and O(n log n)

> **Checkpoint**: Bars animate and change color during sorting? You have a working visualizer!

---

## Lesson 3: Understanding Sorting Algorithms

### Bubble Sort — The Simplest (But Slowest)

```
How it works:
  Compare neighbors → swap if wrong order → repeat

Pass 1: [5, 3, 8, 1, 9] → [3, 5, 1, 8, 9]  (largest bubbles to end)
Pass 2: [3, 5, 1, 8, 9] → [3, 1, 5, 8, 9]
Pass 3: [3, 1, 5, 8, 9] → [1, 3, 5, 8, 9]  ✅ DONE

Time:  O(n²) — slow for large arrays
Space: O(1) — no extra memory needed
Best for: Learning! Not for production.
```

### Selection Sort — Find the Minimum Each Time

```
How it works:
  Find smallest element → put it first → find next smallest → put it second

Step 1: [5, 3, 8, 1, 9] → 1 is smallest → [1, 3, 8, 5, 9]
Step 2: [1, 3, 8, 5, 9] → 3 is next smallest → [1, 3, 8, 5, 9]
Step 3: [1, 3, 8, 5, 9] → 5 is next → [1, 3, 5, 8, 9]  ✅ DONE

Time:  O(n²) — always, even if already sorted
Space: O(1)
Best for: Small arrays, when memory is limited
```

### Insertion Sort — Like Sorting Cards

```
How it works:
  Take each element → insert it in the right position among sorted elements

Step 1: [|5, 3, 8, 1, 9] → [5 |3, 8, 1, 9] → insert 3 → [3, 5 |8, 1, 9]
Step 2: insert 8 → [3, 5, 8 |1, 9]
Step 3: insert 1 → [1, 3, 5, 8 |9]
Step 4: insert 9 → [1, 3, 5, 8, 9]  ✅ DONE

Time:  O(n²) worst case, O(n) best case (already sorted!)
Space: O(1)
Best for: Small or nearly-sorted arrays
```

### Quick Sort — The Champion

```
How it works:
  Pick a pivot → partition (smaller left, larger right) → recurse

[5, 3, 8, 1, 9, 4]  pivot = 4
Partition: [3, 1] [4] [5, 8, 9]
           ↓          ↓
        [1, 3]     [5, 8, 9]
                      ↓
                  [5] [8] [9]

Result: [1, 3, 4, 5, 8, 9]  ✅ DONE

Time:  O(n log n) average — MUCH faster
Space: O(log n) — for recursion stack
Best for: General-purpose sorting. This is what most languages use!
```

### Comparison Table

| Algorithm | Best | Average | Worst | Space | Stable? |
|-----------|------|---------|-------|-------|---------|
| Bubble Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Selection Sort | O(n²) | O(n²) | O(n²) | O(1) | No |
| Insertion Sort | O(n) | O(n²) | O(n²) | O(1) | Yes |
| Quick Sort | O(n log n) | O(n log n) | O(n²) | O(log n) | No |
| Merge Sort | O(n log n) | O(n log n) | O(n log n) | O(n) | Yes |

### Try It Yourself

1. Set array size to 50
2. Run Bubble Sort — count the comparisons
3. Generate a new array of the same size
4. Run Quick Sort — compare the comparisons count
5. Notice the massive difference!

---

## Lesson 4: Add a Searching Visualizer

### Add Linear and Binary Search:

```jsx
const [searchTarget, setSearchTarget] = useState("")
const [searchResult, setSearchResult] = useState("")
const [searchHighlight, setSearchHighlight] = useState(-1)
const [searchRange, setSearchRange] = useState([])

// LINEAR SEARCH
const linearSearch = async () => {
  const target = parseInt(searchTarget)
  if (isNaN(target)) return

  setSearchResult("🔍 Searching...")

  for (let i = 0; i < array.length; i++) {
    if (stopRef.current) return

    setSearchHighlight(i)
    await sleep(speed)

    if (array[i] === target) {
      setSearchResult(`✅ Found ${target} at index ${i}! (${i + 1} steps)`)
      return
    }
  }

  setSearchHighlight(-1)
  setSearchResult(`❌ ${target} not found. (${array.length} steps — checked every element)`)
}

// BINARY SEARCH (requires sorted array)
const binarySearch = async () => {
  const target = parseInt(searchTarget)
  if (isNaN(target)) return

  // First sort the array
  const sortedArr = [...array].sort((a, b) => a - b)
  setArray(sortedArr)
  setSorted(Array.from({ length: sortedArr.length }, (_, i) => i))
  await sleep(500)

  setSearchResult("🔍 Binary searching (array is sorted)...")

  let left = 0, right = sortedArr.length - 1, steps = 0

  while (left <= right) {
    if (stopRef.current) return

    const mid = Math.floor((left + right) / 2)
    steps++

    setSearchRange([left, right])
    setSearchHighlight(mid)
    await sleep(speed * 3)

    if (sortedArr[mid] === target) {
      setSearchResult(`✅ Found ${target} at index ${mid}! Only ${steps} steps! (vs ${sortedArr.length} for linear)`)
      return
    } else if (sortedArr[mid] < target) {
      left = mid + 1
    } else {
      right = mid - 1
    }
  }

  setSearchHighlight(-1)
  setSearchRange([])
  setSearchResult(`❌ ${target} not found. (${steps} steps — binary search is efficient!)`)
}
```

### Search Comparison

```
Array: [1, 3, 5, 7, 9, 11, 13, 15, 17, 19]  (10 elements)
Target: 15

Linear Search: 1→3→5→7→9→11→13→15  ✅ (8 steps)
Binary Search: 11→15  ✅ (2 steps!)

For 1,000,000 elements:
  Linear: up to 1,000,000 steps
  Binary: only about 20 steps!
```

---

## Lesson 5: Data Structure Visualizations

### Stack Visualization (LIFO — Last In, First Out)

```
Think of a stack of plates:

  push(A)    push(B)    push(C)    pop()     pop()
                                   returns C  returns B
  ┌───┐     ┌───┐     ┌───┐      ┌───┐     ┌───┐
  │   │     │   │     │ C │      │   │     │   │
  │   │     │ B │     │ B │      │ B │     │   │
  │ A │     │ A │     │ A │      │ A │     │ A │
  └───┘     └───┘     └───┘      └───┘     └───┘
```

### Queue Visualization (FIFO — First In, First Out)

```
Think of a line at a store:

  enqueue(A)  enqueue(B)  enqueue(C)  dequeue()  dequeue()
                                       returns A   returns B

  Front → [A]  [A, B]  [A, B, C]  [B, C]  [C]  ← Back
```

### Add Stack/Queue to your component:

```jsx
const [stack, setStack] = useState([])
const [queue, setQueue] = useState([])

const pushStack = (val) => setStack((prev) => [...prev, val])
const popStack = () => setStack((prev) => prev.slice(0, -1))

const enqueue = (val) => setQueue((prev) => [...prev, val])
const dequeue = () => setQueue((prev) => prev.slice(1))
```

---

## Lesson 6: Algorithm Complexity — Big O Explained

### What is Big O?

Big O describes how an algorithm's performance **scales** with input size.

```
                    Time
                     ↑
               O(n!) │                    /
                     │                   /
               O(2ⁿ) │                 /
                     │               /
               O(n²) │           ___/
                     │       ___/
            O(n log n)│    __/
                     │  _/
               O(n)  │ /
                     │/_______________
            O(log n) │                 → Input Size
               O(1)  │________________
```

### Visual Guide

| Big O | Name | Example | 100 items | 1,000 items |
|-------|------|---------|-----------|-------------|
| O(1) | Constant | Array access by index | 1 op | 1 op |
| O(log n) | Logarithmic | Binary Search | 7 ops | 10 ops |
| O(n) | Linear | Linear Search | 100 ops | 1,000 ops |
| O(n log n) | Linearithmic | Quick Sort, Merge Sort | 700 ops | 10,000 ops |
| O(n²) | Quadratic | Bubble Sort, Selection Sort | 10,000 ops | 1,000,000 ops |

### Try It Yourself

1. Set array size to 20 → run Bubble Sort → note comparisons
2. Set array size to 40 → run Bubble Sort → note comparisons
3. The comparisons should roughly **quadruple** (because 20² = 400, 40² = 1600)
4. Now do the same with Quick Sort — the growth is much slower!

---

## Lesson 7: Practice Challenges

### Challenge 1: Compare All Algorithms

1. Generate an array of size 50
2. Run each algorithm one by one (generate same array each time)
3. Record comparisons and swaps for each

| Algorithm | Comparisons | Swaps |
|-----------|-------------|-------|
| Bubble Sort | ? | ? |
| Selection Sort | ? | ? |
| Insertion Sort | ? | ? |
| Quick Sort | ? | ? |

Which one had the fewest comparisons?

### Challenge 2: Best vs Worst Case

1. Sort an array (it's now in order)
2. Run Insertion Sort on the sorted array — count comparisons
3. Generate a reversed array (worst case)
4. Run Insertion Sort again — see the massive difference!

**Why?** Insertion Sort's best case is O(n) (already sorted) but worst case is O(n²) (reverse sorted).

### Challenge 3: When to Use What?

Match the scenario with the best algorithm:

| Scenario | Best Algorithm |
|----------|---------------|
| 10 elements, nearly sorted | Insertion Sort |
| 1 million random elements | Quick Sort |
| Need stable sort (preserve order of equals) | Merge Sort |
| Very limited memory | Selection Sort |
| Searching a sorted array | Binary Search |

---

## Course Summary

### What You Learned

| Lesson | Topic | Key Takeaway |
|--------|-------|-------------|
| 1 | Why visualize? | Seeing > reading for understanding algorithms |
| 2 | Sorting visualizer | Animated bars with color-coded states |
| 3 | Sorting algorithms | Bubble, Selection, Insertion, Quick Sort explained |
| 4 | Searching visualizer | Linear vs Binary search — see the speed difference |
| 5 | Data structures | Stack (LIFO), Queue (FIFO) visualizations |
| 6 | Big O complexity | How algorithms scale with input size |
| 7 | Practice challenges | Compare algorithms empirically |

### What to Build Next

- [ ] Add Merge Sort visualization (splitting and merging subarrays)
- [ ] Add Heap Sort with binary heap visualization
- [ ] Visualize a linked list with node-and-pointer graphics
- [ ] Add a binary search tree with insert/delete animations
- [ ] Graph algorithms: BFS, DFS, Dijkstra with animated nodes
- [ ] Add step-by-step mode (click to advance one operation at a time)
