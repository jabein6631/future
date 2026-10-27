import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

// Comprehensive 20-Question Banks for Academic Qualification
const QUESTION_BANKS = {
  python: [
    { q: "What is the primary difference between Python's list and tuple?", opts: ["Tuples are immutable; lists are mutable", "Lists are faster than tuples", "Tuples cannot hold mixed types", "Lists cannot be nested"], ans: 0, exp: "Tuples cannot be altered in memory after instantiation, making them hashable and memory efficient." },
    { q: "In Python, which dunder method overrides the '+' operator for custom classes?", opts: ["__plus__", "__add__", "__concat__", "__append__"], ans: 1, exp: "__add__(self, other) implements binary addition." },
    { q: "What is the time complexity of searching a key in a standard Python dictionary?", opts: ["O(N)", "O(log N)", "Average O(1)", "O(N log N)"], ans: 2, exp: "Python dictionaries use hash tables offering O(1) average-case lookup." },
    { q: "What will `[x**2 for x in range(5) if x % 2 == 0]` evaluate to?", opts: ["[0, 4, 16]", "[1, 9]", "[0, 2, 4]", "[4, 16]"], ans: 0, exp: "Evens in range(5) are 0, 2, 4. Their squares are 0, 4, 16." },
    { q: "What is the Global Interpreter Lock (GIL) in CPython?", opts: ["A security sandbox preventing OS calls", "A mutex preventing multiple native threads from executing Python bytecodes at once", "A memory garbage collection lock", "A compiler optimization tool"], ans: 1, exp: "The GIL prevents multi-threading race conditions inside CPython memory management." },
    { q: "How do generator functions in Python produce sequential values lazily?", opts: ["Using the return keyword", "Using the yield keyword", "Using async/await", "Using the defer keyword"], ans: 1, exp: "The yield keyword pauses execution and resumes on next() calls." },
    { q: "What is the method resolution order (MRO) algorithm used in Python 3?", opts: ["Depth-First Search", "Breadth-First Search", "C3 Linearization", "Dijkstra's Algorithm"], ans: 2, exp: "Python uses C3 linearization to resolve multiple inheritance ambiguity." },
    { q: "Which standard module handles serialization and deserialization of Python objects?", opts: ["json", "pickle", "marshal", "serialize"], ans: 1, exp: "pickle translates Python objects into byte streams." },
    { q: "What is the output of `type(lambda x: x)`?", opts: ["<class 'function'>", "<class 'lambda'>", "<class 'object'>", "<class 'method'>"], ans: 0, exp: "Lambdas are instances of the standard function type in Python." },
    { q: "How does Python handle memory management under the hood?", opts: ["Manual malloc/free", "Purely Mark-and-Sweep", "Reference counting combined with a cyclic garbage collector", "Static stack allocation"], ans: 2, exp: "Python pairs reference counting with generational cyclic garbage collection." },
    { q: "What does the `@staticmethod` decorator do in a class definition?", opts: ["Passes `self` as the first argument", "Passes `cls` as the first argument", "Defines a method that receives neither self nor cls", "Makes the method private"], ans: 2, exp: "Static methods behave as regular functions isolated inside class namespaces." },
    { q: "What is the result of `bool([])` in Python?", opts: ["True", "False", "None", "TypeError"], ans: 1, exp: "Empty sequences have a truth value of False." },
    { q: "Which clause executes in a try-except block ONLY if no exception was raised?", opts: ["finally", "else", "then", "catch"], ans: 1, exp: "The else block executes exclusively when no exception occurs in the try clause." },
    { q: "What built-in function returns an iterator of tuples pairing elements from multiple iterables?", opts: ["combine()", "zip()", "pair()", "map()"], ans: 1, exp: "zip(*iterables) aggregates items into tuple pairs." },
    { q: "What is a closure in Python?", opts: ["A class destructor", "A function object that remembers values in enclosing scopes even if not in memory", "A loop termination flag", "An anonymous lambda"], ans: 1, exp: "A closure retains access to variables from its outer lexical scope." },
    { q: "What does `*args` and `**kwargs` represent in function signatures?", opts: ["Mandatory pointer types", "Positional and keyword variable arguments", "Multiply and exponentiate flags", "Reference pointers"], ans: 1, exp: "*args captures variable positional args as a tuple; **kwargs captures keyword args as a dict." },
    { q: "Which collection type guarantees ordered insertion starting from Python 3.7?", opts: ["set", "dict", "frozenset", "defaultdict"], ans: 1, exp: "Dictionaries guarantee insertion-order retention by language specification." },
    { q: "What is the purpose of `__slots__` in Python classes?", opts: ["Restricts dynamic attributes and optimizes RAM usage", "Enables multithreading", "Forces slot-machine randomization", "Enables inheritance"], ans: 0, exp: "__slots__ avoids __dict__ allocation per instance, drastically saving memory." },
    { q: "What does the `is` operator compare in Python?", opts: ["Value equality", "Object identity (memory address)", "Type compatibility", "Hash equality"], ans: 1, exp: "'is' tests whether two references point to the exact same memory address." },
    { q: "What does `functools.lru_cache` achieve when decorating a function?", opts: ["Validates input arguments", "Memoizes function results with a Least Recently Used eviction strategy", "Runs the function in a background thread", "Compresses output"], ans: 1, exp: "lru_cache caches recent return values to eliminate redundant computations." }
  ],
  react: [
    { q: "What is the purpose of React's Virtual DOM diffing (Reconciliation)?", opts: ["Directly styles DOM elements", "Compares Virtual DOM with snapshot and applies minimal patch operations", "Increases internet download speed", "Compiles JSX to C++"], ans: 1, exp: "Reconciliation computes an O(N) heuristic diff to minimize costly real DOM mutations." },
    { q: "What happens if an empty dependency array `[]` is passed to `useEffect`?", opts: ["Runs after every single render", "Runs only once on component mount", "Never runs at all", "Causes an infinite render loop"], ans: 1, exp: "Empty dependencies tell React the effect does not depend on any state/props." },
    { q: "Why must `key` props be stable and unique when rendering lists in React?", opts: ["Preserves component state and avoids remounting entire DOM nodes during diffing", "Required by W3C HTML5 validator", "Mandatory for CSS animation styling", "Speeds up browser TCP connections"], ans: 0, exp: "Keys help React identify which items have changed, moved, or deleted." },
    { q: "What is the primary difference between `useMemo` and `useCallback`?", opts: ["useMemo caches a computed value; useCallback caches a function definition", "useMemo is for animations; useCallback is for data fetching", "There is no difference", "useCallback is synchronous; useMemo is asynchronous"], ans: 0, exp: "useMemo returns a memoized result; useCallback returns a memoized callback function." },
    { q: "What is prop drilling and which built-in feature mitigates it?", opts: ["Passing state down multiple intermediate levels; React Context API", "Exporting components; Webpack", "Rendering lists; Key props", "Component life cycles; Error boundaries"], ans: 0, exp: "React Context provides a way to pass data through the component tree without prop drilling." },
    { q: "What rule must be followed when calling React Hooks?", opts: ["Must be called inside loops", "Must only be called at the top level of function components", "Must always return JSX", "Must be called inside setTimeout"], ans: 1, exp: "Hooks must be called unconditionally at the top level to preserve execution order." },
    { q: "What does the `useRef` hook return?", opts: ["A reactive state tuple", "A mutable ref object whose `.current` property persists across renders without triggering a re-render", "A DOM snapshot", "A memoized function"], ans: 1, exp: "useRef stores values across renders without causing component updates." },
    { q: "In React 18, what does automatic batching do?", opts: ["Batches multiple state updates across promises, timeouts, and native handlers into a single render", "Compresses JavaScript files", "Loads images in batches", "Renders components on the server"], ans: 0, exp: "Automatic batching groups state updates together to prevent unnecessary intermediate renders." },
    { q: "What is a Pure Component in React?", opts: ["A component that has no styles", "A component that implements shallow props/state comparison to prevent re-renders", "A component without JSX", "A stateless HTML element"], ans: 1, exp: "Pure components do shallow comparison on props and state to optimize rendering." },
    { q: "What does `React.memo` do for functional components?", opts: ["Memoizes the rendered output and skips re-rendering if props have not changed", "Enables memory leak detection", "Stores data in localStorage", "Creates a service worker"], ans: 0, exp: "React.memo is a higher-order component that prevents re-renders when props are identical." },
    { q: "How should you update state when the new state depends on the previous state?", opts: ["setCount(count + 1)", "setCount(prev => prev + 1)", "count++", "this.state.count = count + 1"], ans: 1, exp: "Passing an updater function guarantees access to the latest state value." },
    { q: "What is an Error Boundary in React?", opts: ["A try/catch block around every hook", "A class component that catches JavaScript errors anywhere in its child component tree", "A linter warning", "A CSS overflow property"], ans: 1, exp: "Error boundaries catch errors during rendering, lifecycle methods, and constructors." },
    { q: "What is the purpose of `useReducer`?", opts: ["Replaces Redux for complex state logic with dispatch actions", "Reduces CSS bundle sizes", "Decreases memory consumption", "Minimizes network traffic"], ans: 0, exp: "useReducer is ideal for complex state transitions following the (state, action) => newState pattern." },
    { q: "Why should you never mutate state directly in React?", opts: ["It will crash the browser immediately", "React uses reference equality to detect changes; direct mutations skip re-renders", "Direct mutations are illegal syntax", "It slows down CPU clock speed"], ans: 1, exp: "React checks object references; mutating in-place prevents React from recognizing changes." },
    { q: "What does the `useLayoutEffect` hook do differently from `useEffect`?", opts: ["Runs synchronously immediately after DOM mutations before the browser paints", "Runs on the server only", "Has no cleanup function", "Runs asynchronously after paint"], ans: 0, exp: "useLayoutEffect fires before paint, preventing visible UI flickering during DOM measurements." },
    { q: "What is JSX?", opts: ["A syntax extension for JavaScript that looks similar to XML/HTML", "A new database query language", "A replacement for CSS", "A binary format"], ans: 0, exp: "JSX provides syntactic sugar for React.createElement() calls." },
    { q: "What does the `key` prop do when changing component types?", opts: ["Forces React to completely destroy and recreate the component subtree", "Preserves state across unmounts", "Styles the element", "Nothing"], ans: 0, exp: "Changing a component's key resets its state and remounts it fresh." },
    { q: "What is React Fiber?", opts: ["A lightweight CSS library", "React's re-architected reconciliation engine enabling incremental rendering and concurrency", "A fiber-optic network protocol", "An npm package for animations"], ans: 1, exp: "Fiber enables interruptible rendering and priority-based scheduling." },
    { q: "What does the `useId` hook generate in React 18?", opts: ["Unique IDs for accessibility attributes that are stable across SSR and client", "Random UUIDv4 strings for crypto", "User database keys", "Session tokens"], ans: 0, exp: "useId generates unique, deterministic accessibility IDs." },
    { q: "What is a controlled component in React?", opts: ["A component controlled by external CSS", "A form element whose input value is controlled entirely by React state", "A component with strict types", "A server component"], ans: 1, exp: "Controlled components take their current value through props and notify changes via callbacks." }
  ]
};

export default function QuizModal({ onClose, onPromoteTier }) {
  const { user, updateCredits } = useAuth();
  const [domain, setDomain] = useState('python');
  const [examStarted, setExamStarted] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [answers, setAnswers] = useState({}); // { [questionIdx]: selectedOptionIdx }
  const [timeLeft, setTimeLeft] = useState(300); // 5 minutes
  const [isFinished, setIsFinished] = useState(false);
  const [examResult, setExamResult] = useState(null);

  const questions = QUESTION_BANKS[domain] || QUESTION_BANKS.python;

  // Countdown Timer
  useEffect(() => {
    if (!examStarted || isFinished) return;
    const interval = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(interval);
          handleSubmitExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [examStarted, isFinished, answers]);

  const handleSelectAnswer = (optionIdx) => {
    setAnswers(prev => ({
      ...prev,
      [currentIdx]: optionIdx
    }));
  };

  const handleClearChoice = () => {
    setAnswers(prev => {
      const copy = { ...prev };
      delete copy[currentIdx];
      return copy;
    });
  };

  const handleSubmitExam = () => {
    let score = 0;
    let correctCount = 0;
    let wrongCount = 0;
    let unattemptedCount = 0;

    questions.forEach((q, idx) => {
      const userChoice = answers[idx];
      if (userChoice === undefined) {
        unattemptedCount++;
      } else if (userChoice === q.ans) {
        correctCount++;
        score += 3;
      } else {
        wrongCount++;
        score -= 1;
      }
    });

    const finalMarks = Math.max(0, score);
    const percentage = Math.round((finalMarks / 60) * 100);

    // Classification Rules:
    // Bronze: 42-53 Marks (70%-89%) -> 1.0 Cr
    // Silver: >=54 Marks (>=90%) -> 1.5 Cr
    // Advanced: 42-53 + Cert -> 2.0 Cr
    // Elite Master: >=54 + Cert -> 2.5 Cr
    let tierEarned = 'Needs Revision';
    let rate = 1.0;

    if (percentage >= 90) {
      tierEarned = '🥇 Elite Master Tutor';
      rate = 2.5;
    } else if (percentage >= 70) {
      tierEarned = '🥈 Silver Tutor';
      rate = 1.5;
    } else if (percentage >= 50) {
      tierEarned = '🥉 Bronze Tutor';
      rate = 1.0;
    }

    const result = {
      score: finalMarks,
      percentage,
      correctCount,
      wrongCount,
      unattemptedCount,
      tierEarned,
      rate
    };

    setExamResult(result);
    setIsFinished(true);

    // Reward user with 2.0 bonus credits for completing assessment
    if (percentage >= 70 && updateCredits) {
      const bonus = (user?.credits || 0) + 2.0;
      updateCredits(bonus);
      if (onPromoteTier) onPromoteTier(tierEarned, rate);
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div className="modal-overlay active" style={{ zIndex: 1200 }}>
      <div style={{
        background: 'var(--bg-card, #ffffff)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '840px',
        border: '1px solid var(--border-subtle)',
        boxShadow: 'var(--shadow-xl)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: '90vh'
      }}>
        {/* Top Header */}
        <div style={{
          background: 'linear-gradient(135deg, #1e1b4b, #312e81)',
          padding: '1.25rem 1.75rem',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
              <span style={{ fontSize: '1.3rem' }}>🧠</span>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: '800' }}>
                AI Dynamic 20-Question Assessment
              </h2>
            </div>
            <div style={{ fontSize: '0.75rem', color: '#a5b4fc', marginTop: '0.2rem' }}>
              Marking Scheme: <strong style={{ color: '#34d399' }}>+3 Correct</strong> • <strong style={{ color: '#f87171' }}>-1 Incorrect</strong> • <strong style={{ color: '#94a3b8' }}>0 Skipped</strong>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            {examStarted && !isFinished && (
              <div style={{
                background: timeLeft < 60 ? '#ef4444' : 'rgba(255,255,255,0.15)',
                padding: '0.4rem 0.85rem',
                borderRadius: '8px',
                fontWeight: '700',
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem'
              }}>
                <i className="fa-regular fa-clock"></i>
                <span>{formatTime(timeLeft)}</span>
              </div>
            )}
            <button onClick={onClose} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', color: '#fff', borderRadius: '50%', width: '32px', height: '32px', cursor: 'pointer' }}>✕</button>
          </div>
        </div>

        {/* Content Area */}
        {!examStarted ? (
          /* Domain Selection & Pre-Exam Screen */
          <div style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem', textAlign: 'center' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.3rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Select Your Examination Domain
              </h3>
              <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', maxWidth: '540px', margin: '0.5rem auto 0' }}>
                Pass the 20-question merit assessment to qualify as a verified tutor, raise your hourly rate up to 2.5 Cr/hr, and earn teaching badges.
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '1rem', maxWidth: '540px', margin: '0 auto', width: '100%' }}>
              <button
                type="button"
                onClick={() => setDomain('python')}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: domain === 'python' ? '2px solid #4f46e5' : '1px solid var(--border-medium)',
                  background: domain === 'python' ? '#eef2ff' : 'var(--bg-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>🐍</div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>Python & OOP</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Data structures, algorithms, GIL, and OOP</div>
              </button>

              <button
                type="button"
                onClick={() => setDomain('react')}
                style={{
                  padding: '1.25rem',
                  borderRadius: '12px',
                  border: domain === 'react' ? '2px solid #3b82f6' : '1px solid var(--border-medium)',
                  background: domain === 'react' ? '#eff6ff' : 'var(--bg-subtle)',
                  cursor: 'pointer',
                  textAlign: 'left'
                }}
              >
                <div style={{ fontSize: '1.5rem', marginBottom: '0.4rem' }}>⚛️</div>
                <div style={{ fontWeight: '700', fontSize: '0.95rem', color: 'var(--text-primary)' }}>React.js Frontend</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Hooks, state, reconciliation, and Virtual DOM</div>
              </button>
            </div>

            <div style={{
              background: '#f8fafc',
              border: '1px solid var(--border-subtle)',
              borderRadius: '12px',
              padding: '1rem',
              maxWidth: '540px',
              margin: '0 auto',
              width: '100%',
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              textAlign: 'left'
            }}>
              <strong>Exam Instructions:</strong>
              <ul style={{ margin: '0.4rem 0 0', paddingLeft: '1.2rem', lineHeight: 1.5 }}>
                <li>20 Multiple Choice Questions (5 minutes countdown).</li>
                <li><strong>Negative Marking:</strong> Wrong answers deduct 1 mark. Use "Clear Choice" to skip and preserve your score.</li>
                <li>Score ≥70% unlocks tutor verification and 2.0 Bonus Credits.</li>
              </ul>
            </div>

            <button
              onClick={() => setExamStarted(true)}
              style={{
                background: 'linear-gradient(135deg, #4f46e5, #7c3aed)',
                color: '#ffffff',
                border: 'none',
                borderRadius: '10px',
                padding: '0.85rem 2rem',
                fontSize: '1rem',
                fontWeight: '700',
                cursor: 'pointer',
                margin: '0 auto',
                boxShadow: '0 4px 14px rgba(79, 70, 229, 0.35)'
              }}
            >
              Start 20-Question Assessment
            </button>
          </div>
        ) : isFinished ? (
          /* Results Screen */
          <div style={{ padding: '2.5rem 2rem', textAlign: 'center', display: 'flex', flexDirection: 'column', gap: '1.25rem', alignItems: 'center' }}>
            <div style={{ fontSize: '3rem' }}>
              {examResult?.percentage >= 70 ? '🎉' : '📚'}
            </div>
            <div>
              <h3 style={{ margin: 0, fontSize: '1.5rem', fontWeight: '800', color: 'var(--text-primary)' }}>
                Assessment Completed!
              </h3>
              <div style={{ fontSize: '1.1rem', fontWeight: '700', color: '#4f46e5', marginTop: '0.35rem' }}>
                Score: {examResult?.score} / 60 Marks ({examResult?.percentage}%)
              </div>
            </div>

            {/* Performance Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1rem', width: '100%', maxWidth: '440px' }}>
              <div style={{ background: '#ecfdf5', padding: '0.85rem', borderRadius: '12px', border: '1px solid #10b981' }}>
                <div style={{ fontSize: '0.72rem', color: '#065f46' }}>Correct (+3)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#059669' }}>{examResult?.correctCount}</div>
              </div>
              <div style={{ background: '#fef2f2', padding: '0.85rem', borderRadius: '12px', border: '1px solid #f87171' }}>
                <div style={{ fontSize: '0.72rem', color: '#991b1b' }}>Incorrect (-1)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#dc2626' }}>{examResult?.wrongCount}</div>
              </div>
              <div style={{ background: '#f1f5f9', padding: '0.85rem', borderRadius: '12px', border: '1px solid #cbd5e1' }}>
                <div style={{ fontSize: '0.72rem', color: '#475569' }}>Skipped (0)</div>
                <div style={{ fontSize: '1.3rem', fontWeight: '800', color: '#64748b' }}>{examResult?.unattemptedCount}</div>
              </div>
            </div>

            {/* Award Badge */}
            <div style={{ background: '#f5f3ff', border: '1px solid #c4b5fd', borderRadius: '14px', padding: '1rem 1.5rem', maxWidth: '440px', width: '100%' }}>
              <div style={{ fontSize: '0.8rem', color: '#5b21b6', fontWeight: '600' }}>Classification Awarded:</div>
              <div style={{ fontSize: '1.25rem', fontWeight: '800', color: '#6d28d9', marginTop: '0.2rem' }}>
                {examResult?.tierEarned}
              </div>
              <div style={{ fontSize: '0.8rem', color: '#7c3aed', marginTop: '0.2rem' }}>
                Authorized Rate: {examResult?.rate.toFixed(1)} Credits / hour
              </div>
            </div>

            <button
              onClick={onClose}
              style={{
                background: '#0d233a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.75rem 2rem',
                fontSize: '0.9rem',
                fontWeight: '700',
                cursor: 'pointer'
              }}
            >
              Back to Marketplace
            </button>
          </div>
        ) : (
          /* Live Exam Screen */
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, overflow: 'hidden' }}>
            {/* 20-Question Jump Matrix */}
            <div style={{
              background: '#f8fafc',
              padding: '0.85rem 1.5rem',
              borderBottom: '1px solid var(--border-subtle)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '1rem',
              flexWrap: 'wrap'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', flexWrap: 'wrap' }}>
                {questions.map((_, idx) => {
                  const isCurrent = currentIdx === idx;
                  const isAnswered = answers[idx] !== undefined;

                  return (
                    <button
                      key={idx}
                      onClick={() => setCurrentIdx(idx)}
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '6px',
                        border: isCurrent ? '2px solid #4f46e5' : '1px solid var(--border-medium)',
                        background: isCurrent ? '#4f46e5' : isAnswered ? '#10b981' : '#ffffff',
                        color: isCurrent || isAnswered ? '#ffffff' : 'var(--text-secondary)',
                        fontSize: '0.78rem',
                        fontWeight: '700',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.15s ease'
                      }}
                      title={`Jump to Question ${idx + 1}`}
                    >
                      {idx + 1}
                    </button>
                  );
                })}
              </div>

              {/* Legend */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#10b981' }}></span> Answered
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#4f46e5' }}></span> Current
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                  <span style={{ width: '10px', height: '10px', borderRadius: '2px', background: '#ffffff', border: '1px solid #cbd5e1' }}></span> Skipped
                </span>
              </div>
            </div>

            {/* Question Card */}
            <div style={{ padding: '1.75rem', flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#4f46e5', textTransform: 'uppercase' }}>
                  Question {currentIdx + 1} of 20
                </span>
                <button
                  type="button"
                  onClick={handleClearChoice}
                  style={{
                    background: '#fef2f2',
                    border: '1px solid #fecaca',
                    color: '#dc2626',
                    borderRadius: '6px',
                    padding: '0.35rem 0.75rem',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer'
                  }}
                  title="Clear selection to avoid -1 penalty"
                >
                  Clear Choice (0 Marks)
                </button>
              </div>

              <div style={{ fontSize: '1.05rem', fontWeight: '700', color: 'var(--text-primary)', lineHeight: 1.4 }}>
                {questions[currentIdx].q}
              </div>

              {/* Options */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.65rem' }}>
                {questions[currentIdx].opts.map((opt, optIdx) => {
                  const isSelected = answers[currentIdx] === optIdx;
                  return (
                    <label
                      key={optIdx}
                      onClick={() => handleSelectAnswer(optIdx)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.85rem',
                        padding: '0.85rem 1rem',
                        borderRadius: '10px',
                        border: isSelected ? '2px solid #4f46e5' : '1px solid var(--border-medium)',
                        background: isSelected ? '#f5f3ff' : 'var(--bg-subtle)',
                        cursor: 'pointer',
                        fontSize: '0.88rem',
                        color: 'var(--text-primary)',
                        transition: 'all 0.15s ease'
                      }}
                    >
                      <input
                        type="radio"
                        name={`q_${currentIdx}`}
                        checked={isSelected}
                        onChange={() => handleSelectAnswer(optIdx)}
                        style={{ accentColor: '#4f46e5' }}
                      />
                      <span>{opt}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            {/* Bottom Nav: Prev, Next, Submit */}
            <div style={{
              padding: '1rem 1.75rem',
              borderTop: '1px solid var(--border-subtle)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#f8fafc'
            }}>
              <button
                disabled={currentIdx === 0}
                onClick={() => setCurrentIdx(prev => Math.max(0, prev - 1))}
                style={{
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-medium)',
                  borderRadius: '8px',
                  padding: '0.55rem 1rem',
                  fontSize: '0.82rem',
                  fontWeight: '600',
                  cursor: currentIdx === 0 ? 'not-allowed' : 'pointer',
                  opacity: currentIdx === 0 ? 0.5 : 1
                }}
              >
                ← Previous
              </button>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                {currentIdx < questions.length - 1 ? (
                  <button
                    onClick={() => setCurrentIdx(prev => prev + 1)}
                    style={{
                      background: '#0d233a',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      padding: '0.55rem 1.25rem',
                      fontSize: '0.82rem',
                      fontWeight: '600',
                      cursor: 'pointer'
                    }}
                  >
                    Next →
                  </button>
                ) : null}

                <button
                  onClick={handleSubmitExam}
                  style={{
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    padding: '0.55rem 1.25rem',
                    fontSize: '0.82rem',
                    fontWeight: '700',
                    cursor: 'pointer',
                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)'
                  }}
                >
                  Submit Assessment
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
