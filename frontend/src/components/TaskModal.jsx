


import React, { useCallback, useEffect, useState } from "react";
import {
  baseControlClasses,
  DEFAULT_TASK,
  priorityStyles,
} from "../assets/dummy";
import {
  AlignLeft,
  Calendar,
  CheckCircle,
  Flag,
  PlusCircle,
  Save,
  X,
} from "lucide-react";

const Base_URL = "http://localhost:4000/api/tasks";

const TaskModal = ({ isOpen, onClose, taskToEdit, onSave, onLogout }) => {
  const [taskData, setTaskData] = useState(DEFAULT_TASK);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  // -------------------- PREFILL --------------------
  useEffect(() => {
    if (!isOpen) return;

    if (taskToEdit) {
      setTaskData({
        ...DEFAULT_TASK,
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        priority: taskToEdit.priority || "Low",
        dueDate: taskToEdit.dueDate?.split("T")[0] || "",
        completed: taskToEdit.status === "completed" ? "Yes" : "No",
        id: taskToEdit._id,
      });
    } else {
      setTaskData({
        ...DEFAULT_TASK,
        completed: "No", // ✅ default In Progress
      });
    }

    setError(null);
  }, [isOpen, taskToEdit]);

  // -------------------- INPUT CHANGE --------------------
  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  }, []);

  // -------------------- HEADERS --------------------
  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth Token found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []);

  // -------------------- SUBMIT --------------------
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (taskData.dueDate < today) {
        setError("Due date cannot be in the past");
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const isEdit = Boolean(taskData.id);

        // ✅ MAP UI → BACKEND FORMAT
        const payload = {
          title: taskData.title,
          description: taskData.description,
          priority: taskData.priority,
          dueDate: taskData.dueDate,
          status: taskData.completed === "Yes" ? "completed" : "in progress",
          completed: taskData.completed === "Yes",
        };

        const requesturl = isEdit
          ? `${Base_URL}/gp/${taskData.id}`
          : `${Base_URL}/gp`;

        const resp = await fetch(requesturl, {
          method: isEdit ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(payload),
        });

        if (!resp.ok) {
          if (resp.status === 401) return onLogout?.();
          const error = await resp.json();
          throw new Error(error.message);
        }

        await resp.json();
        onSave?.();
        onClose();
      } catch (error) {
        console.error(error);
        setError(error.message);
      } finally {
        setLoading(false);
      }
    },
    [taskData, today, getHeaders, onLogout, onSave, onClose]
  );

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/20 z-50 flex items-center justify-center p-4">
      <div className="bg-white border border-purple-100 rounded-xl max-w-md w-full shadow-lg relative p-6">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            {taskData.id ? <Save className="text-purple-500" /> : <PlusCircle className="text-purple-500" />}
            {taskData.id ? "Edit Task" : "Create New Task"}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-purple-100 rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-lg">
              {error}
            </div>
          )}

          <input
            type="text"
            name="title"
            required
            value={taskData.title}
            onChange={handleChange}
            className={baseControlClasses}
            placeholder="Task title"
          />

          <textarea
            name="description"
            rows="3"
            value={taskData.description}
            onChange={handleChange}
            className={baseControlClasses}
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              name="priority"
              value={taskData.priority}
              onChange={handleChange}
              className={`${baseControlClasses} ${priorityStyles[taskData.priority]}`}
            >
              <option>Low</option>
              <option>Medium</option>
              <option>High</option>
            </select>

            <input
              type="date"
              name="dueDate"
              min={today}
              value={taskData.dueDate}
              onChange={handleChange}
              className={baseControlClasses}
            />
          </div>

          {/* STATUS */}
          <div>
            <label className="flex items-center gap-2 text-sm font-medium mb-2">
              <CheckCircle className="w-4 h-4 text-purple-500" />
              Status
            </label>

            <div className="flex gap-4">
              {[
                { val: "No", label: "In progress" },
                { val: "Yes", label: "Completed" },
              ].map(({ val, label }) => (
                <label key={val} className="flex items-center">
                  <input
                    type="radio"
                    name="completed"
                    value={val}
                    checked={taskData.completed === val}
                    onChange={handleChange}
                  />
                  <span className="ml-2">{label}</span>
                </label>
              ))}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-purple-600 text-white py-2 rounded-lg"
          >
            {loading ? "Saving..." : taskData.id ? "Update Task" : "Create Task"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
