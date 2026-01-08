


import React, { useMemo, useState, useEffect } from 'react'
import { layoutClasses } from '../assets/dummy'
import { Clock, ListChecks, Plus } from 'lucide-react'
import TaskItem from '../components/TaskItem'
import TaskModal from '../components/TaskModal'
import axios from 'axios'

const API_BASE = 'http://localhost:4000/api/tasks'

const PendingPage = () => {
  const [tasks, setTasks] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [showModal, setShowModal] = useState(false)
  const [selectedTask, setSelectedTask] = useState(null)
  const [loading, setLoading] = useState(true)

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  })

  // Fetch tasks from correct endpoint
  const refreshTasks = async () => {
    try {
      setLoading(true)
      const res = await fetch(`${API_BASE}/gp`, getHeaders())
      const data = await res.json()
      if (!res.ok) throw new Error(data.message || 'Failed to fetch tasks')
      setTasks(data.tasks || data)
    } catch (err) {
      console.error('Error fetching tasks:', err)
      setTasks([])
    } finally {
      setLoading(false)
    }
  }

  // Load tasks on mount
  useEffect(() => {
    refreshTasks()
  }, [])

  // -------------------- DELETE --------------------
  const handleDelete = async (id) => {
    try {
      await axios.delete(`${API_BASE}/gp/${id}`, getHeaders())
      refreshTasks()
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  // -------------------- TOGGLE COMPLETE --------------------
  const handleToggleComplete = async (task) => {
    try {
      await axios.patch(
        `${API_BASE}/gp/${task._id}`,
        {
          status: 'completed',
          completed: true,
        },
        getHeaders()
      )
      refreshTasks()
    } catch (err) {
      console.error('Toggle complete failed:', err)
    }
  }

  // -------------------- FILTER + SORT --------------------
  const sortedPendingTasks = useMemo(() => {
    // Filter for ONLY in-progress/pending tasks
    const filtered = tasks.filter((t) => {
      // Check if task is NOT completed using multiple conditions
      const isNotCompleted = 
        t.status?.toLowerCase() !== 'completed' &&
        t.completed !== true &&
        t.completed !== 1 &&
        !(typeof t.completed === 'string' && t.completed.toLowerCase() === 'yes')
      
      return isNotCompleted
    })

    return [...filtered].sort((a, b) => {
      if (sortBy === 'newest') {
        return new Date(b.createdAt) - new Date(a.createdAt)
      }
      if (sortBy === 'oldest') {
        return new Date(a.createdAt) - new Date(b.createdAt)
      }
      if (sortBy === 'priority') {
        const order = { high: 3, medium: 2, low: 1 }
        return (
          (order[b.priority?.toLowerCase()] || 0) -
          (order[a.priority?.toLowerCase()] || 0)
        )
      }
      return 0
    })
  }, [tasks, sortBy])

  if (loading) {
    return (
      <div className={layoutClasses.container}>
        <p className="text-center text-gray-500">Loading tasks...</p>
      </div>
    )
  }

  return (
    <div className={layoutClasses.container}>
      {/* HEADER */}
      <div className={layoutClasses.headerWrapper}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <ListChecks className="text-purple-500" />
            Pending Tasks
          </h1>
          <p className="text-sm text-gray-500 ml-7">
            {sortedPendingTasks.length} pending task(s)
          </p>
        </div>

        {/* Sort Dropdown */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-purple-200 rounded-lg text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* ADD TASK */}
      <div
        className={layoutClasses.addBox}
        onClick={() => setShowModal(true)}
      >
        <Plus className="text-purple-500" />
        <span>Add new task</span>
      </div>

      {/* TASK LIST */}
      <div className="space-y-4">
        {sortedPendingTasks.length === 0 ? (
          <div className={layoutClasses.emptyState}>
            <Clock className="w-8 h-8 text-purple-500 mx-auto" />
            <p>No pending tasks 🎉</p>
          </div>
        ) : (
          sortedPendingTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              showCompleteCheckbox
              onDelete={() => handleDelete(task._id)}
              onToggleComplete={() => handleToggleComplete(task)}
              onEdit={() => {
                setSelectedTask(task)
                setShowModal(true)
              }}
              onRefresh={refreshTasks}
            />
          ))
        )}
      </div>

      {/* MODAL */}
      <TaskModal
        isOpen={showModal || !!selectedTask}
        onClose={() => {
          setShowModal(false)
          setSelectedTask(null)
          refreshTasks()
        }}
        taskToEdit={selectedTask}
        onSave={refreshTasks}
      />
    </div>
  )
}

export default PendingPage