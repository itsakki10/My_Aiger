import React, { useState, useMemo, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  Filter,
  SortDesc,
  SortAsc,
  Award,
  Plus,
  ListChecks,
  Clock,
} from "lucide-react";
import TaskItem from "../components/TaskItem";
import TaskModal from "../components/AddTask"; // Correctly using AddTask component

// API Base
const API_BASE = "http://localhost:4000/api/tasks";
const sortOptions = [
  { id: "newest", label: "Newest", icon: <SortDesc className="w-4 h-4" /> },
  { id: "oldest", label: "Oldest", icon: <SortAsc className="w-4 h-4" /> },
  { id: "priority", label: "Priority", icon: <Award className="w-4 h-4" /> },
];

const PendingTasks = () => {
  // ✅ Accessing teamMembers from context (now ready for delegation filtering)
  const { tasks = [], refreshTasks, teamMembers } = useOutletContext();
  const [sortBy, setSortBy] = useState("newest");
  const [selectedTask, setSelectedTask] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const getHeaders = () => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  };

  const handleDelete = useCallback(
    async (id) => {
      await fetch(`${API_BASE}/${id}/gp`, {
        method: "DELETE",
        headers: getHeaders(),
      });
      refreshTasks();
    },
    [refreshTasks]
  );

  const handleToggleComplete = useCallback(
    async (id, completed) => {
      await fetch(`${API_BASE}/${id}/gp`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify({ completed: completed ? "Yes" : "No" }),
      });
      refreshTasks();
    },
    [refreshTasks]
  );

  const sortedPendingTasks = useMemo(() => {
    const filtered = tasks.filter(
      (t) =>
        !t.completed ||
        (typeof t.completed === "string" && t.completed.toLowerCase() === "no")
    );
    return filtered.sort((a, b) => {
      if (sortBy === "newest")
        return new Date(b.createdAt) - new Date(a.createdAt);
      if (sortBy === "oldest")
        return new Date(a.createdAt) - new Date(b.createdAt);
      const order = { high: 3, medium: 2, low: 1 };
      const priorityA = a.priority?.toLowerCase() || "low";
      const priorityB = b.priority?.toLowerCase() || "low";
      return order[priorityB] - order[priorityA];
    });
  }, [tasks, sortBy]);

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto">
      {/* --- Header and Sort Controls --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-6 border-b-2 border-purple-300">
        <div>
          {/* ✅ FIX 1: Changing header text to white and icon color to light purple */}
          <h1 className="text-3xl md:text-4xl font-extrabold text-white flex items-center gap-3">
            <ListChecks className="text-purple-300 w-7 h-7" /> Active Tasks
          </h1>
          {/* ✅ FIX 2: Changing subtitle text to a light color for visibility */}
          <p className="text-base text-purple-200 mt-1 pl-10">
            {sortedPendingTasks.length} item
            {sortedPendingTasks.length !== 1 && "s"} remaining
          </p>
        </div>

        <div className="flex-shrink-0">
          <div className="flex items-center space-x-3 bg-white p-2 rounded-xl shadow-lg border border-gray-200 mt-4 md:mt-0">
            <div className="flex items-center gap-2 text-gray-700 font-medium">
              <Filter className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold">Sort:</span>
            </div>

            {/* Mobile Select */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="md:hidden p-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-600 focus:border-purple-600"
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="priority">By Priority</option>
            </select>

            {/* Desktop Tab Buttons */}
            <div className="hidden md:flex space-x-1">
              {sortOptions.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 shadow-sm
                    ${
                      sortBy === opt.id
                        ? "bg-purple-700 text-white hover:bg-purple-800 shadow-purple-300"
                        : "bg-white text-gray-700 hover:bg-purple-50 hover:text-purple-700 border border-gray-300"
                    }`}
                >
                  {opt.icon}
                  {opt.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- Add New Task Button (Now uses TaskModal context) --- */}
      <div
        className="mb-6 p-4 rounded-xl border-2 border-purple-400/50 bg-purple-50 hover:bg-purple-100 transition-all duration-300 cursor-pointer shadow-md hover:shadow-lg group"
        onClick={() => {
          setSelectedTask(null);
          setShowModal(true);
        }}
      >
        <div className="flex items-center justify-center gap-4 text-gray-700 group-hover:text-purple-700 transition-colors">
          <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-lg group-hover:shadow-xl group-hover:scale-105 transition-all duration-300">
            <Plus size={20} className="text-purple-700" />
          </div>
          <span className="text-lg font-semibold">
            Create a New Task with AI Assist
          </span>
        </div>
      </div>

      {/* --- Task List --- */}
      <div className="space-y-4">
        {sortedPendingTasks.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-xl shadow-lg border border-purple-200">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-purple-100 flex items-center justify-center">
              <Clock className="w-8 h-8 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-800 mb-2">
              You're all caught up! 🚀
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              No pending tasks found. Time to relax or plan your next mission!
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
          sortedPendingTasks.map((task) => (
            <TaskItem
              key={task._id || task.id}
              task={task}
              showCompleteCheckbox
              onDelete={() => handleDelete(task._id || task.id)}
              onToggleComplete={() =>
                handleToggleComplete(task._id || task.id, !task.completed)
              }
              onEdit={() => {
                setSelectedTask(task);
                setShowModal(true);
              }}
              onRefresh={refreshTasks}
              // Added class for styling consistency
              className="bg-white border border-gray-200 shadow-md hover:shadow-lg rounded-xl"
            />
          ))
        )}
      </div>

      {/* --- Task Modal --- */}
      <TaskModal
        isOpen={!!selectedTask || showModal}
        onClose={() => {
          setShowModal(false);
          setSelectedTask(null);
          refreshTasks();
        }}
        taskToEdit={selectedTask}
        onSave={refreshTasks}
      />
    </div>
  );
};

export default PendingTasks;
