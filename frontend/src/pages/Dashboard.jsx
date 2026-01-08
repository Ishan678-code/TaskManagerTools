


import React, { useMemo, useState, useEffect } from "react";
import {
  ADD_BUTTON,
  FILTER_LABELS,
  FILTER_OPTIONS,
  FILTER_WRAPPER,
  HEADER,
  ICON_WRAPPER,
  LABEL_CLASS,
  SELECT_CLASSES,
  STAT_CARD,
  STATS,
  STATS_GRID,
  TAB_ACTIVE,
  TAB_BASE,
  TAB_INACTIVE,
  TABS_WRAPPER,
  VALUE_CLASS,
  WRAPPER,
} from "../assets/dummy";
import { Calendar, Filter, Home, Plus } from "lucide-react";
import TaskModal from "../components/TaskModal";
import TaskItem from "../components/TaskItem";

const API_BASE = "http://localhost:4000/api/tasks";

const Dashboard = () => {
  const [tasks, setTasks] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);
  const [filter, setFilter] = useState("all");
  const [loading, setLoading] = useState(true);

  // -------------------- FETCH TASKS --------------------
  const refreshTasks = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/gp`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to fetch tasks");
      setTasks(data.tasks || data);
    } catch (err) {
      console.error(err.message);
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshTasks();
  }, []);

  // -------------------- STATS --------------------
  const stats = useMemo(() => {
    const total = tasks.length;

    const completedCount = tasks.filter((t) => {
      // Check completed field
      if (t.completed === true || t.completed === 1) return true;
      if (typeof t.completed === "string" && t.completed.toLowerCase() === "yes") return true;
      // Fallback: check status field
      if (t.status?.toLowerCase() === "completed") return true;
      return false;
    }).length;

    const pendingCount = total - completedCount;
    const completionPercentage = total === 0 ? 0 : Math.round((completedCount / total) * 100);

    return {
      total,
      lowPriority: tasks.filter((t) => t.priority?.toLowerCase() === "low").length,
      mediumPriority: tasks.filter((t) => t.priority?.toLowerCase() === "medium").length,
      highPriority: tasks.filter((t) => t.priority?.toLowerCase() === "high").length,
      completed: completedCount,
      pending: pendingCount,
      completionPercentage,
    };
  }, [tasks]);

  // -------------------- FILTER TASKS --------------------
  // Shows ALL tasks but allows filtering by date/priority
  const filteredTasks = useMemo(() => {
    const today = new Date();
    const nextWeek = new Date(today);
    nextWeek.setDate(today.getDate() + 7);

    // Show ALL tasks when filter is "all"
    if (filter === "all") {
      return tasks;
    }

    return tasks.filter((task) => {
      const dueDate = task.dueDate ? new Date(task.dueDate) : null;
      switch (filter) {
        case "today":
          return dueDate && dueDate.toDateString() === today.toDateString();
        case "week":
          return dueDate && dueDate >= today && dueDate <= nextWeek;
        case "high":
        case "medium":
        case "low":
          return task.priority?.toLowerCase() === filter;
        default:
          return true;
      }
    });
  }, [tasks, filter]);

  return (
    <div className={WRAPPER}>
      {/* -------------------- HEADER -------------------- */}
      <div className={HEADER}>
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Home className="text-purple-500" />
            Task Overview
          </h1>
          <p className="text-sm text-gray-500 ml-7">Manage your tasks efficiently</p>
        </div>

        <button onClick={() => setShowModal(true)} className={ADD_BUTTON}>
          <Plus size={18} /> Add New Task
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* -------------------- LEFT: STATS + TASK LIST -------------------- */}
        <div className="lg:col-span-2 space-y-6">
          {/* Priority Stats Cards */}
          <div className={STATS_GRID}>
            {STATS.map(
              ({ key, label, icon: Icon, iconColor, borderColor, valueKey, textColor, gradient }) => (
                <div key={key} className={`${STAT_CARD} ${borderColor}`}>
                  <div className="flex items-center gap-3">
                    <div className={`${ICON_WRAPPER} ${iconColor}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p
                        className={`${VALUE_CLASS} ${
                          gradient
                            ? "bg-gradient-to-r from-fuchsia-500 to-purple-600 bg-clip-text text-transparent"
                            : textColor
                        }`}
                      >
                        {stats[valueKey]}
                      </p>
                      <p className={LABEL_CLASS}>{label}</p>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>

          {/* Filter Section */}
          <div className={FILTER_WRAPPER}>
            <div className="flex items-center gap-2">
              <Filter className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold">{FILTER_LABELS[filter]}</h2>
            </div>

            <div className="flex flex-wrap gap-2">
              {FILTER_OPTIONS.map((opt) => (
                <button
                  key={opt}
                  onClick={() => setFilter(opt)}
                  className={`${TAB_BASE} ${filter === opt ? TAB_ACTIVE : TAB_INACTIVE}`}
                >
                  {opt.charAt(0).toUpperCase() + opt.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Task List */}
          <div className="space-y-4 min-h-[200px]">
            {loading ? (
              <p className="text-center text-gray-500 py-8">Loading tasks...</p>
            ) : filteredTasks.length === 0 ? (
              <p className="text-center text-gray-500 py-8">No tasks found</p>
            ) : (
              filteredTasks.map((task) => (
                <TaskItem
                  key={task._id}
                  task={task}
                  onRefresh={refreshTasks}
                  onEdit={() => {
                    setSelectedTask(task);
                    setShowModal(true);
                  }}
                />
              ))
            )}
          </div>

          {/* Bottom Add Task Button */}
          <div
            onClick={() => setShowModal(true)}
            className="mt-6 border-2 border-dashed border-purple-300 rounded-xl py-4 flex items-center justify-center gap-2 text-purple-600 font-medium cursor-pointer hover:bg-purple-50 transition"
          >
            <Plus size={18} />
            Add New Task
          </div>
        </div>

        {/* -------------------- RIGHT: TASK STATISTICS -------------------- */}
        <div className="space-y-6">
          <div className="bg-white rounded-xl p-6 border border-purple-100 shadow-sm">
            <h3 className="text-lg font-semibold mb-6 flex items-center gap-2">
              <div className="w-8 h-8 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-purple-600 text-xl">📊</span>
              </div>
              Task Statistics
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="text-center bg-purple-50 rounded-lg py-4">
                <p className="text-3xl font-bold text-purple-600">{stats.total}</p>
                <p className="text-sm text-gray-600 mt-1">Total</p>
              </div>

              <div className="text-center bg-green-50 rounded-lg py-4">
                <p className="text-3xl font-bold text-green-600">{stats.completed}</p>
                <p className="text-sm text-gray-600 mt-1">Completed</p>
              </div>

              <div className="text-center bg-orange-50 rounded-lg py-4">
                <p className="text-3xl font-bold text-orange-600">{stats.pending}</p>
                <p className="text-sm text-gray-600 mt-1">Pending</p>
              </div>

              <div className="text-center bg-fuchsia-50 rounded-lg py-4">
                <p className="text-3xl font-bold text-fuchsia-600">{stats.completionPercentage}%</p>
                <p className="text-sm text-gray-600 mt-1">Completion</p>
              </div>
            </div>
          </div>

          {/* Optional: Recent Activities Placeholder */}
          <div className="bg-white rounded-xl p-6 border border-purple-100">
            <h3 className="text-lg font-semibold mb-4">Recent Activities</h3>
            <p className="text-center text-gray-500 py-8">No recent activity</p>
          </div>
        </div>
      </div>

      {/* -------------------- MODAL -------------------- */}
      <TaskModal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTask(null);
        }}
        taskToEdit={selectedTask}
        onSave={refreshTasks}
      />
    </div>
  );
};

export default Dashboard;