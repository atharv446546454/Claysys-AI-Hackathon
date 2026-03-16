import { useState, useRef } from 'react'
import {
  Brain,
  CheckSquare,
  FileText,
  Bell,
  Send,
  Trash2,
  Clock,
  Tag,
  AlertCircle,
} from 'lucide-react'
import { categorize } from './utils/categorize'

// ── Constants ──────────────────────────────────────────────────────────────────

const TYPE_CONFIG = {
  Task: {
    icon: CheckSquare,
    label: 'Task',
    bg: 'bg-blue-50',
    border: 'border-blue-200',
    badge: 'bg-blue-100 text-blue-700',
    iconColor: 'text-blue-500',
  },
  Reminder: {
    icon: Bell,
    label: 'Reminder',
    bg: 'bg-amber-50',
    border: 'border-amber-200',
    badge: 'bg-amber-100 text-amber-700',
    iconColor: 'text-amber-500',
  },
  Note: {
    icon: FileText,
    label: 'Note',
    bg: 'bg-emerald-50',
    border: 'border-emerald-200',
    badge: 'bg-emerald-100 text-emerald-700',
    iconColor: 'text-emerald-500',
  },
}

const PRIORITY_CONFIG = {
  high: { label: 'High', color: 'text-red-600 bg-red-50' },
  medium: { label: 'Medium', color: 'text-yellow-600 bg-yellow-50' },
  low: { label: 'Low', color: 'text-green-600 bg-green-50' },
}

const FILTER_OPTIONS = ['All', 'Task', 'Reminder', 'Note']

// ── Sub-components ─────────────────────────────────────────────────────────────

function BraindumpInput({ onSubmit }) {
  const [value, setValue] = useState('')
  const textareaRef = useRef(null)

  function handleSubmit(e) {
    e.preventDefault()
    const trimmed = value.trim()
    if (!trimmed) return
    onSubmit(trimmed)
    setValue('')
    textareaRef.current?.focus()
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
      handleSubmit(e)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="relative flex flex-col gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm focus-within:border-indigo-400 focus-within:ring-2 focus-within:ring-indigo-100 transition-all">
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="What's on your mind? e.g. Buy groceries tomorrow, Meeting notes, Remind me to call John at 3pm"
          rows={3}
          className="w-full resize-none bg-transparent text-gray-800 placeholder-gray-400 text-base leading-relaxed outline-none"
          aria-label="Braindump input"
        />
        <div className="flex items-center justify-between">
          <p className="text-xs text-gray-400">
            Press <kbd className="rounded bg-gray-100 px-1 py-0.5 font-mono text-xs">⌘ Enter</kbd> or click Add
          </p>
          <button
            type="submit"
            disabled={!value.trim()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 active:bg-indigo-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            aria-label="Add item"
          >
            <Send size={14} />
            Add
          </button>
        </div>
      </div>
    </form>
  )
}

function ItemCard({ item, onDelete }) {
  const cfg = TYPE_CONFIG[item.type]
  const Icon = cfg.icon
  const formattedDate = new Date(item.createdAt).toLocaleString(undefined, {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })

  return (
    <div
      className={`group relative flex gap-3 rounded-2xl border p-4 ${cfg.bg} ${cfg.border} transition-shadow hover:shadow-md`}
      role="article"
      aria-label={`${item.type}: ${item.content}`}
    >
      {/* Type icon */}
      <div className={`mt-0.5 shrink-0 ${cfg.iconColor}`}>
        <Icon size={18} />
      </div>

      {/* Content */}
      <div className="min-w-0 flex-1">
        {/* Badge row */}
        <div className="mb-1.5 flex flex-wrap items-center gap-1.5">
          <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold ${cfg.badge}`}>
            {cfg.label}
          </span>

          {/* Priority (Task) */}
          {item.type === 'Task' && item.metadata.priority && (
            <span
              className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_CONFIG[item.metadata.priority].color}`}
            >
              <AlertCircle size={10} />
              {PRIORITY_CONFIG[item.metadata.priority].label}
            </span>
          )}

          {/* Due hint (Reminder) */}
          {item.type === 'Reminder' && item.metadata.dueHint && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-700">
              <Clock size={10} />
              {item.metadata.dueHint}
            </span>
          )}
        </div>

        {/* Main content */}
        <p className="break-words text-sm leading-relaxed text-gray-800">
          {item.content}
        </p>

        {/* Footer */}
        <div className="mt-2 flex flex-wrap items-center gap-2">
          <span className="flex items-center gap-1 text-xs text-gray-400">
            <Clock size={10} />
            {formattedDate}
          </span>

          {/* Tags */}
          {item.metadata.tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {item.metadata.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center gap-0.5 rounded-full bg-white/70 px-1.5 py-0.5 text-xs text-gray-500 ring-1 ring-gray-200"
                >
                  <Tag size={9} />
                  {tag}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Delete button */}
      <button
        onClick={() => onDelete(item.id)}
        className="absolute right-3 top-3 rounded-lg p-1 text-gray-300 opacity-0 transition-opacity group-hover:opacity-100 hover:bg-white/50 hover:text-red-400 focus-visible:opacity-100"
        aria-label={`Delete ${item.type}`}
      >
        <Trash2 size={14} />
      </button>
    </div>
  )
}

function FilterBar({ active, onChange, counts }) {
  return (
    <div className="flex flex-wrap gap-2" role="group" aria-label="Filter items">
      {FILTER_OPTIONS.map((opt) => {
        const count = opt === 'All' ? counts.total : (counts[opt] ?? 0)
        return (
          <button
            key={opt}
            onClick={() => onChange(opt)}
            className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              active === opt
                ? 'bg-indigo-600 text-white shadow-sm'
                : 'bg-white text-gray-500 ring-1 ring-gray-200 hover:bg-gray-50'
            }`}
            aria-pressed={active === opt}
          >
            {opt}
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${
                active === opt ? 'bg-indigo-500 text-white' : 'bg-gray-100 text-gray-500'
              }`}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}

function EmptyState({ filter }) {
  return (
    <div className="flex flex-col items-center gap-3 rounded-2xl border border-dashed border-gray-200 py-12 text-center">
      <Brain size={32} className="text-gray-300" />
      <div>
        <p className="text-sm font-medium text-gray-400">
          {filter === 'All' ? 'Nothing captured yet' : `No ${filter}s yet`}
        </p>
        <p className="mt-0.5 text-xs text-gray-300">
          Start typing above to braindump your thoughts
        </p>
      </div>
    </div>
  )
}

// ── Main App ───────────────────────────────────────────────────────────────────

export default function App() {
  const [items, setItems] = useState([])
  const [filter, setFilter] = useState('All')

  function handleSubmit(text) {
    const item = categorize(text)
    setItems((prev) => [item, ...prev])
  }

  function handleDelete(id) {
    setItems((prev) => prev.filter((i) => i.id !== id))
  }

  const counts = {
    total: items.length,
    Task: items.filter((i) => i.type === 'Task').length,
    Reminder: items.filter((i) => i.type === 'Reminder').length,
    Note: items.filter((i) => i.type === 'Note').length,
  }

  const filtered = filter === 'All' ? items : items.filter((i) => i.type === filter)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-xl px-4 py-8 sm:py-12">
        {/* Header */}
        <header className="mb-8 text-center">
          <div className="mb-3 inline-flex items-center justify-center rounded-2xl bg-indigo-600 p-3 shadow-md">
            <Brain size={28} className="text-white" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
            Braindump
          </h1>
          <p className="mt-1 text-sm text-gray-500">
            Capture anything. We'll sort it out.
          </p>
        </header>

        {/* Input */}
        <div className="mb-6">
          <BraindumpInput onSubmit={handleSubmit} />
        </div>

        {/* Filter bar */}
        {items.length > 0 && (
          <div className="mb-4">
            <FilterBar active={filter} onChange={setFilter} counts={counts} />
          </div>
        )}

        {/* Feed */}
        <main>
          {filtered.length === 0 ? (
            <EmptyState filter={filter} />
          ) : (
            <div className="flex flex-col gap-3">
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} onDelete={handleDelete} />
              ))}
            </div>
          )}
        </main>

        {/* Footer */}
        <footer className="mt-10 text-center text-xs text-gray-300">
          Claysys AI Hackathon &middot; Braindump
        </footer>
      </div>
    </div>
  )
}

