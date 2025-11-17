import { useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Plus,
  Filter,
  Clock,
  Flame,
  CheckSquare,
  BarChart3,
  TrendingUp,
  Calendar as CalendarIcon,
} from "lucide-react";
import TaskModal from "../components/AddTask";
import TaskItem from "../components/TaskItem";
import axios from "axios";

// API Base
const API_BASE = "http://localhost:4000/api/tasks";

// Shared Stat Card Data (Icons and Colors)
const STATS = [
  {
    key: "total",
    label: "Total Tasks",
    icon: BarChart3,
    colorClass: "text-purple-600 bg-purple-100",
    valueKey: "total",
    borderColor: "border-purple-500",
    gradient: true,
  },
  {
    key: "pending",
    label: "Tasks Pending",
    icon: Clock,
    colorClass: "text-fuchsia-600 bg-fuchsia-100",
    valueKey: "pending",
    borderColor: "border-fuchsia-500",
    textColor: "text-fuchsia-700",
  },
  {
    key: "highPriority",
    label: "Urgent (High Priority)",
    icon: Flame,
    colorClass: "text-red-600 bg-red-100",
    valueKey: "highPriority",
    borderColor: "border-red-500",
    textColor: "text-red-700",
  },
  {
    key: "completed",
    label: "Completed",
    icon: CheckSquare,
    colorClass: "text-green-600 bg-green-100",
    valueKey: "completed",
    borderColor: "border-green-500",
    textColor: "text-green-700",
  },
];

const FILTER_OPTIONS = ["all", "today", "week", "high", "medium", "low"];
const FILTER_LABELS = {
  all: "All Active Tasks",
  today: "Due Today",
  week: "Due This Week",
  high: "Urgent Tasks (High Priority)",
  medium: "Medium Priority Tasks",
  low: "Low Priority Tasks",
};

// Helper function to check if a date is within the next 7 days (inclusive)
const isWithinNextWeek = (date) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);
  return date >= today && date < nextWeek;
};

const Dashboard = () => {
  // We now assume teamMembers is available from context via Layout.jsx
  const { tasks, refreshTasks, teamMembers } = useOutletContext();
  const [filter, setFilter] = useState("all");
  const [showModal, setShowModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Calculate stats
  const stats = useMemo(() => {
    const isCompleted = (t) =>
      t.completed === true ||
      t.completed === 1 ||
      (typeof t.completed === "string" && t.toLowerCase() === "yes");
    const completedTasks = tasks.filter(isCompleted).length;
    const totalCount = tasks.length;

    return {
      total: totalCount,
      pending: totalCount - completedTasks,
      completed: completedTasks,
      lowPriority: tasks.filter(
        (t) => t.priority?.toLowerCase() === "low" && !isCompleted(t)
      ).length,
      mediumPriority: tasks.filter(
        (t) => t.priority?.toLowerCase() === "medium" && !isCompleted(t)
      ).length,
      highPriority: tasks.filter(
        (t) => t.priority?.toLowerCase() === "high" && !isCompleted(t)
      ).length,
    };
  }, [tasks]);

  // Filter tasks
  const filteredTasks = useMemo(
    () =>
      tasks.filter((task) => {
        const isTaskCompleted =
          task.completed === true ||
          task.completed === 1 ||
          (typeof task.completed === "string" && task.toLowerCase() === "yes");

        if (isTaskCompleted) {
          return false;
        }

        const dueDate = task.dueDate ? new Date(task.dueDate) : null;
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        switch (filter) {
          case "today":
            return dueDate && dueDate.toDateString() === today.toDateString();
          case "week":
            return dueDate && isWithinNextWeek(dueDate);
          case "high":
          case "medium":
          case "low":
            return task.priority?.toLowerCase() === filter;
          default:
            return true;
        }
      }),
    [tasks, filter]
  );

  // Save tasks
  const handleTaskSave = useCallback(
    async (taskData) => {
      try {
        // Ensure taskData includes assignedTo if it was set in the modal
        if (taskData.id)
          await axios.put(`${API_BASE}/${taskData.id}/gp`, taskData);
        refreshTasks();
        setShowModal(false);
        setSelectedTask(null);
      } catch (error) {
        console.error("Error saving task:", error);
      }
    },
    [refreshTasks]
  );

  // FINAL HORIZONTAL STAT CARD COMPONENT FOR GUARANTEED LOOK
  const HorizontalStatCard = ({ label, valueKey, icon: Icon }) => {
    const value = stats[valueKey] || 0;
    let iconBgClass = "";
    let valueColor = "text-gray-800";

    if (valueKey === "total") {
      iconBgClass = "bg-purple-600";
      valueColor = "text-purple-600";
    } else if (valueKey === "pending") {
      iconBgClass = "bg-fuchsia-600";
      valueColor = "text-fuchsia-600";
    } else if (valueKey === "highPriority") {
      iconBgClass = "bg-red-600";
      valueColor = "text-red-600";
    } else if (valueKey === "completed") {
      iconBgClass = "bg-green-600";
      valueColor = "text-green-600";
    }

    return (
      <div className="p-5 rounded-xl shadow-lg transition-all duration-300 bg-white border border-gray-200 hover:shadow-xl">
        <div className="flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className={`text-3xl font-extrabold leading-none ${valueColor}`}>
              {value}
            </p>
            <p className="text-sm text-gray-600 font-semibold mt-1">{label}</p>
          </div>
          <div
            className={`p-3 rounded-xl flex-shrink-0 text-white ${iconBgClass} shadow-md`}
          >
            <Icon className="w-6 h-6" />
          </div>
        </div>
      </div>
    );
  };

  return (
    // Wrapper uses minimal padding, relying on Layout.jsx for vertical push-down
    <div className="px-4 md:px-8 max-w-7xl mx-auto pb-8">
      {/* Header (Corrected Text Visibility) */}
      <div className="flex items-center justify-between pb-6 mb-6 border-b-2 border-purple-300">
        <div className="min-w-0">
          {/* ✅ TEXT FIX: Changed title and icon color for high contrast */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
            <TrendingUp className="text-fuchsia-300 w-7 h-7 shrink-0" />
            <span className="truncate">Task Overview</span>
          </h1>
          {/* ✅ TEXT FIX: Subtitle changed to light purple */}
          <p className="text-base text-purple-200 mt-1 ml-10 truncate">
            Focus on what matters most today.
          </p>
        </div>
        <button
          onClick={() => {
            setSelectedTask(null);
            setShowModal(true);
          }}
          className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-white font-semibold bg-gradient-to-r from-fuchsia-700 to-purple-800 shadow-xl shadow-purple-400/50 hover:shadow-2xl transition-all duration-300"
        >
          <Plus size={20} />
          Create New Task
        </button>
      </div>

      {/* STATS GRID */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
        <HorizontalStatCard
          key="total"
          label="Total Tasks"
          valueKey="total"
          icon={BarChart3}
        />
        <HorizontalStatCard
          key="pending"
          label="Tasks Pending"
          valueKey="pending"
          icon={Clock}
        />
        <HorizontalStatCard
          key="highPriority"
          label="Urgent (High Priority)"
          valueKey="highPriority"
          icon={Flame}
        />
        <HorizontalStatCard
          key="completed"
          label="Completed"
          valueKey="completed"
          icon={CheckSquare}
        />
      </div>

      {/* Content */}
      <div className="space-y-6">
        {/* Filter Bar */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-white shadow-xl border border-gray-200">
          <div className="flex items-center gap-3 min-w-0">
            <Filter className="w-6 h-6 text-purple-700 shrink-0" />
            <h2 className="text-xl font-bold text-gray-900 truncate">
              {FILTER_LABELS[filter]}
            </h2>
          </div>

          {/* Mobile Select */}
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="md:hidden p-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-700 focus:border-purple-700"
          >
            {FILTER_OPTIONS.map((opt) => (
              <option key={opt} value={opt}>
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </option>
            ))}
          </select>

          {/* Desktop Tabs */}
          <div className="hidden md:flex space-x-1">
            {FILTER_OPTIONS.map((opt) => (
              <button
                key={opt}
                onClick={() => setFilter(opt)}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 ${
                  filter === opt
                    ? "bg-purple-700 text-white hover:bg-purple-800 shadow-md"
                    : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-300"
                }`}
              >
                {opt.charAt(0).toUpperCase() + opt.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Task List */}
        <div className="space-y-5">
          {filteredTasks.length === 0 ? (
            <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-purple-200">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
                <CalendarIcon className="w-8 h-8 text-purple-700" />
              </div>
              <h3 className="text-xl font-bold text-gray-800 mb-2">
                {filter === "all"
                  ? "No active tasks found."
                  : `No tasks match the '${
                      filter.charAt(0).toUpperCase() + filter.slice(1)
                    }' filter.`}
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                {filter === "all"
                  ? "Ready to create your first task?"
                  : "Try adjusting your filter or check your completed tasks."}
              </p>
              <button
                onClick={() => {
                  setSelectedTask(null);
                  setShowModal(true);
                }}
                className="px-6 py-2 bg-purple-700 text-white rounded-lg font-semibold hover:bg-purple-800 transition-colors shadow-lg flex items-center mx-auto"
              >
                <Plus className="w-4 h-4 mr-1" /> Create New Task
              </button>
            </div>
          ) : (
            filteredTasks.map((task) => (
              <TaskItem
                key={task._id || task.id}
                task={task}
                onRefresh={refreshTasks}
                showCompleteCheckbox
                onEdit={() => {
                  setSelectedTask(task);
                  setShowModal(true);
                }}
              />
            ))
          )}
        </div>

        {/* Add Task (Desktop Footer CTA) */}
        <div
          onClick={() => {
            setSelectedTask(null);
            setShowModal(true);
          }}
          className="flex items-center justify-center p-5 border-2 border-dashed border-purple-300 rounded-xl hover:border-purple-500 bg-purple-50/70 cursor-pointer transition-colors mt-6"
        >
          <Plus className="w-6 h-6 text-purple-700 mr-2" />
          <span className="text-lg text-gray-700 font-semibold">
            Quick Add New Task
          </span>
        </div>
      </div>

      {/* Modal */}
      <TaskModal
        isOpen={showModal || !!selectedTask}
        onClose={() => {
          setShowModal(false);
          setSelectedTask(null);
          refreshTasks();
        }}
        taskToEdit={selectedTask}
        onSave={handleTaskSave}
      />
    </div>
  );
};

export default Dashboard;
