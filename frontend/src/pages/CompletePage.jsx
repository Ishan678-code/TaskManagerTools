


import React, { useMemo, useState, useEffect } from 'react'
import { layoutClasses } from '../assets/dummy'
import { CheckCircle2, ListChecks } from 'lucide-react'
import TaskItem from '../components/TaskItem'
import axios from 'axios'

const API_BASE = 'http://localhost:4000/api/tasks'

const CompletePage = () => {
  const [tasks, setTasks] = useState([])
  const [sortBy, setSortBy] = useState('newest')
  const [loading, setLoading] = useState(true)

  const getHeaders = () => ({
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
      'Content-Type': 'application/json',
    },
  })

  // -------------------- FETCH TASKS --------------------
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

  // -------------------- MARK AS PENDING --------------------
  const handleMarkPending = async (task) => {
    try {
      await axios.patch(
        `${API_BASE}/gp/${task._id}`,
        {
          status: 'in progress',
          completed: false,
        },
        getHeaders()
      )
      refreshTasks()
    } catch (err) {
      console.error('Update failed:', err)
    }
  }

  // -------------------- FILTER + SORT --------------------
  const sortedCompletedTasks = useMemo(() => {
    // Filter for ONLY completed tasks
    const filtered = tasks.filter((t) => {
      // Check if task IS completed using multiple conditions
      const isCompleted = 
        t.status?.toLowerCase() === 'completed' ||
        t.completed === true ||
        t.completed === 1 ||
        (typeof t.completed === 'string' && t.completed.toLowerCase() === 'yes')
      
      return isCompleted
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
        <p className="text-center text-gray-500">Loading completed tasks...</p>
      </div>
    )
  }

  return (
    <div className={layoutClasses.container}>
      {/* HEADER */}
      <div className={layoutClasses.headerWrapper}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <CheckCircle2 className="text-green-500" />
            Completed Tasks
          </h1>
          <p className="text-sm text-gray-500 ml-7">
            {sortedCompletedTasks.length} completed task(s)
          </p>
        </div>

        {/* SORT */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2 border border-green-200 rounded-lg text-sm"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="priority">Priority</option>
        </select>
      </div>

      {/* TASK LIST */}
      <div className="space-y-4">
        {sortedCompletedTasks.length === 0 ? (
          <div className={layoutClasses.emptyState}>
            <ListChecks className="w-8 h-8 text-green-500 mx-auto" />
            <p>No completed tasks yet</p>
          </div>
        ) : (
          sortedCompletedTasks.map((task) => (
            <TaskItem
              key={task._id}
              task={task}
              showCompleteCheckbox={false}
              onDelete={() => handleDelete(task._id)}
              onToggleComplete={() => handleMarkPending(task)}
              onRefresh={refreshTasks}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default CompletePage