import { useState, useEffect } from "react";
import axios from "axios";
import { format, isToday } from "date-fns";
import TaskModal from "./AddTask";
import {
  CheckCircle2,
  MoreVertical,
  Clock,
  Calendar,
  Pencil,
  Trash2,
  List,
} from "lucide-react";

// NOTE: Defining assumed classes and helper functions for the new design inline
const getPriorityColor = (priority) => {
  const p = priority?.toLowerCase() || "low";
  // Stronger color definitions for borders
  if (p === "high") return "border-red-600 hover:border-red-700";
  if (p === "medium") return "border-yellow-600 hover:border-yellow-700";
  return "border-gray-400 hover:border-gray-500";
};

const getPriorityBadgeColor = (priority) => {
  const p = priority?.toLowerCase() || "low";
  // Vivid badge colors
  if (p === "high")
    return "bg-red-500 text-white font-bold border border-red-500";
  if (p === "medium")
    return "bg-yellow-100 text-yellow-700 font-bold border border-yellow-300";
  return "bg-gray-200 text-gray-600 font-medium border border-gray-300";
};

const MENU_OPTIONS = [
  { action: "edit", label: "Edit Task", icon: <Pencil className="w-4 h-4" /> },
  {
    action: "delete",
    label: "Delete",
    icon: <Trash2 className="w-4 h-4 text-red-500" />,
  },
];

const API_BASE = "http://localhost:4000/api/tasks";

const TaskItem = ({
  task,
  onRefresh,
  onLogout,
  showCompleteCheckbox = true,
}) => {
  const [showMenu, setShowMenu] = useState(false);
  const [isCompleted, setIsCompleted] = useState(
    [true, 1, "yes"].includes(
      typeof task.completed === "string"
        ? task.completed.toLowerCase()
        : task.completed
    )
  );
  const [showEditModal, setShowEditModal] = useState(false);
  const [subtasks, setSubtasks] = useState(
    JSON.parse(JSON.stringify(task.subtasks || []))
  );

  useEffect(() => {
    setIsCompleted(
      [true, 1, "yes"].includes(
        typeof task.completed === "string"
          ? task.completed.toLowerCase()
          : task.completed
      )
    );
    setSubtasks(JSON.parse(JSON.stringify(task.subtasks || [])));
  }, [task.completed, task.subtasks]);

  const getAuthHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");
    return { Authorization: `Bearer ${token}` };
  };

  const borderColor = isCompleted
    ? "border-green-500"
    : getPriorityColor(task.priority);

  const handleComplete = async () => {
    const newStatus = isCompleted ? "No" : "Yes";
    try {
      await axios.put(
        `${API_BASE}/${task._id}/gp`,
        { completed: newStatus },
        { headers: getAuthHeaders() }
      );
      setIsCompleted(!isCompleted);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleAction = (action) => {
    setShowMenu(false);
    if (action === "edit") setShowEditModal(true);
    if (action === "delete") handleDelete();
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Are you sure you want to delete the task: "${task.title}"?`
      )
    )
      return;
    try {
      await axios.delete(`${API_BASE}/${task._id}/gp`, {
        headers: getAuthHeaders(),
      });
      onRefresh?.();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleSave = async (updatedTask) => {
    try {
      const payload = {
        title: updatedTask.title,
        description: updatedTask.description,
        priority: updatedTask.priority,
        dueDate: updatedTask.dueDate,
        completed: updatedTask.completed,
        subtasks: subtasks,
      };

      await axios.put(`${API_BASE}/${task._id}/gp`, payload, {
        headers: getAuthHeaders(),
      });
      setShowEditModal(false);
      onRefresh?.();
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401) onLogout?.();
    }
  };

  const handleSubtaskChange = (index) => {
    setSubtasks((prev) =>
      prev.map((s, idx) =>
        idx === index ? { ...s, completed: !s.completed } : s
      )
    );
  };

  const progress = subtasks.length
    ? (subtasks.filter((st) => st.completed).length / subtasks.length) * 100
    : 0;

  // Calculate Due Date urgency
  const isDueToday = task.dueDate && isToday(new Date(task.dueDate));
  const dateTextColor = isCompleted
    ? "text-gray-400"
    : isDueToday
    ? "text-red-600 font-extrabold" // Stronger text for TODAY
    : "text-gray-600";

  return (
    <>
      <div
        className={`flex items-start justify-between p-4 bg-white rounded-xl shadow-lg transition-all duration-300 border-l-4 hover:shadow-xl ${borderColor} ${
          isCompleted ? "opacity-90 bg-green-50/50" : "opacity-100"
        }`}
      >
        <div className="flex items-start gap-4 flex-1 min-w-0">
          {/* Completion Checkbox */}
          {showCompleteCheckbox && (
            <button
              onClick={handleComplete}
              className={`p-0 mt-0.5 transition-colors duration-200 flex-shrink-0 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 rounded-full ${
                isCompleted
                  ? "text-green-600 hover:text-green-700"
                  : "text-gray-400 hover:text-purple-600"
              }`}
              aria-label={
                isCompleted ? "Mark as Incomplete" : "Mark as Complete"
              }
            >
              <CheckCircle2
                className={`w-6 h-6 ${
                  isCompleted ? "fill-green-600" : "fill-none stroke-current"
                }`}
              />
            </button>
          )}

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-1 flex-wrap">
              <h3
                className={`text-lg font-bold truncate max-w-full ${
                  isCompleted ? "text-gray-500 line-through" : "text-gray-900"
                }`}
              >
                {task.title}
              </h3>
              <span
                className={`px-3 py-0.5 text-xs rounded-full border shrink-0 uppercase tracking-wider ${getPriorityBadgeColor(
                  task.priority
                )}`}
              >
                {task.priority}
              </span>
            </div>

            {task.description && (
              <p className="text-sm text-gray-600 mt-1 mb-2">
                {task.description}
              </p>
            )}

            {/* Subtasks Section */}
            {subtasks.length > 0 && (
              <div className="p-3 mt-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="flex items-center justify-between text-xs text-gray-600 font-bold mb-2">
                  <span className="flex items-center gap-1">
                    <List className="w-3.5 h-3.5" /> Subtasks Progress
                  </span>
                  <span className="text-purple-700 font-extrabold">
                    {Math.round(progress)}%
                  </span>
                </div>

                <div className="h-1.5 bg-gray-300 rounded-full">
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-600 to-purple-700 rounded-full transition-all duration-500"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                <div className="space-y-2 pt-2 mt-2 border-t border-gray-100">
                  {subtasks.map((st, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-3 group/subtask"
                    >
                      <input
                        type="checkbox"
                        checked={st.completed}
                        onChange={() => handleSubtaskChange(i)}
                        className="w-4 h-4 text-purple-700 rounded border-gray-300 focus:ring-purple-600"
                      />
                      <span
                        className={`text-sm truncate ${
                          st.completed
                            ? "text-gray-400 line-through italic"
                            : "text-gray-700 group-hover/subtask:text-purple-700"
                        } transition-colors duration-200`}
                      >
                        {st.title}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Container: Dates and Menu */}
        <div className="flex items-center gap-4 pl-4 border-l border-gray-200 flex-shrink-0">
          {/* Date Information */}
          <div className="text-right">
            <div
              className={`flex items-center gap-1.5 text-sm font-semibold ${dateTextColor}`}
            >
              <Calendar className="w-4 h-4" />
              {task.dueDate
                ? isDueToday
                  ? "DUE TODAY"
                  : format(new Date(task.dueDate), "MMM dd, yyyy")
                : "— No Due Date"}
            </div>
            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
              <Clock className="w-3.5 h-3.5" />
              {task.createdAt
                ? `Created ${format(new Date(task.createdAt), "MMM dd, yyyy")}`
                : "No creation date"}
            </div>
          </div>

          {/* Action Menu */}
          <div className="relative">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowMenu(!showMenu);
              }}
              className="p-2 rounded-full text-gray-500 hover:bg-purple-100 hover:text-purple-700 transition-colors duration-200"
              aria-expanded={showMenu}
            >
              <MoreVertical size={20} />
            </button>
            {showMenu && (
              <div className="absolute right-0 mt-2 w-40 bg-white rounded-lg shadow-2xl border border-gray-100 z-10 overflow-hidden animate-fadeIn">
                {MENU_OPTIONS.map((opt) => (
                  <button
                    key={opt.action}
                    onClick={() => handleAction(opt.action)}
                    className={`w-full px-4 py-2 text-left text-sm flex items-center gap-3 transition-colors duration-200 ${
                      opt.action === "delete"
                        ? "text-red-700 hover:bg-red-50"
                        : "text-gray-700 hover:bg-purple-50 hover:text-purple-700"
                    }`}
                  >
                    {opt.icon}
                    {opt.label}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <TaskModal
        isOpen={showEditModal}
        onClose={() => {
          setShowEditModal(false);
          onRefresh?.();
        }}
        taskToEdit={task}
        onSave={handleSave}
      />
    </>
  );
};

export default TaskItem;
