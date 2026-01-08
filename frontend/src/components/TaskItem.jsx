

import React, { useEffect, useState } from "react";
import {
  getPriorityBadgeColor,
  getPriorityColor,
  MENU_OPTIONS,
  TI_CLASSES,
} from "../assets/dummy";
import { Calendar, CheckCircle2, Clock, MoreVertical } from "lucide-react";
import axios from "axios";
import { format, isToday } from "date-fns";
import TaskModal from "./TaskModal";

const API_BASE = "http://localhost:4000/api/tasks";

const TaskItem = ({ task, onRefresh, onLogout, showCompleteCheckbox = true }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    [true, 1, "yes"].includes(
      typeof task.completed === "string"
        ? task.completed.toLowerCase()
        : task.completed
    )
  );

  useEffect(() => {
    setIsCompleted(
      [true, 1, "yes"].includes(
        typeof task.completed === "string"
          ? task.completed.toLowerCase()
          : task.completed
      )
    );
  }, [task.completed]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token");
    return { Authorization: `Bearer ${token}` };
  };

  const borderColor = isCompleted
    ? "border-green-500"
    : getPriorityColor(task.priority).split(" ")[0];


 
  const handleComplete = async () => {
  try {
    await axios.put(
      `${API_BASE}/gp/${task._id}`, // ← Fixed: was missing /gp
      { completed: isCompleted ? "No" : "Yes" },
      { headers: getAuthHeaders() }
    );
    onRefresh?.();
  } catch (error) {
    if (error.response?.status === 401) onLogout?.();
  }
};

  

  const handleDelete = async () => {
  try {
    await axios.delete(`${API_BASE}/gp/${task._id}`, { // ← Fixed
      headers: getAuthHeaders(),
    });
    onRefresh?.();
  } catch (error) {
    if (error.response?.status === 401) onLogout?.();
  }
};

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === "edit") setShowEditModal(true);
    if (action === "delete") handleDelete();
  };

  // ✅ CALLED AFTER MODAL SAVES
  const handleSave = () => {
    setShowEditModal(false);
    onRefresh?.();
  };

  return (
    <>
      <div className={`${TI_CLASSES.wrapper} ${borderColor}`}>
        <div className={TI_CLASSES.leftContainer}>
          {showCompleteCheckbox && (
            <button
              onClick={handleComplete}
              className={`${TI_CLASSES.completeBtn} ${
                isCompleted ? "text-green-500" : "text-gray-300"
              }`}
            >
              <CheckCircle2
                size={18}
                className={`${TI_CLASSES.checkboxIconBase} ${
                  isCompleted ? "fill-green-500" : ""
                }`}
              />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-baseline gap-2 mb-1 flex-wrap">
              <h3
                className={`${TI_CLASSES.titleBase} ${
                  isCompleted
                    ? "text-gray-400 line-through"
                    : "text-gray-800"
                }`}
              >
                {task.title}
              </h3>

              <span
                className={`${TI_CLASSES.priorityBadge} ${getPriorityBadgeColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>

            <div>{task.description}</div>
          </div>
        </div>

        <div className={TI_CLASSES.rightContainer}>
          <div className="relative">
            <button
              onClick={() => setShowMenu(!showMenu)}
              className={TI_CLASSES.menuButton}
            >
              <MoreVertical size={18} />
            </button>

            {showMenu && (
              <div className={TI_CLASSES.menuDropdown}>
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => handleAction(opt.action)}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-purple-50 flex items-center gap-2"
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>

          <div>
            <div
              className={`${TI_CLASSES.dateRow} ${
                task.dueDate && isToday(new Date(task.dueDate))
                  ? "text-fuchsia-600"
                  : "text-gray-500"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              {task.dueDate
                ? isToday(new Date(task.dueDate))
                  ? "Today"
                  : format(new Date(task.dueDate), "MMM dd")
                : "-"}
            </div>

            <div className={TI_CLASSES.createdRow}>
              <Clock className="w-3.5 h-3.5" />
              {task.createdAt
                ? `Created ${format(new Date(task.createdAt), "MMM dd")}`
                : "No date"}
            </div>
          </div>
        </div>
      </div>

    
      <TaskModal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        taskToEdit={task}
        onSave={handleSave}
        onLogout={onLogout}
      />
    </>
  );
};

export default TaskItem;
