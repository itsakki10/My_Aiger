import { useState, useMemo } from "react";
import { useOutletContext } from "react-router-dom";
import { CheckCircle2, Filter, Clock3, SortAsc, Award } from "lucide-react";

// Note: Using the provided SORT_OPTIONS and defining the UI entirely inline
// to guarantee the intended look.

const SORT_OPTIONS = [
  { id: "newest", label: "Newest", icon: <Clock3 className="w-4 h-4" /> },
  { id: "oldest", label: "Oldest", icon: <SortAsc className="w-4 h-4" /> },
  {
    id: "priority",
    label: "Priority",
    icon: <Award className="w-4 h-4" />,
  },
];

// Importing TaskItem remains crucial but is assumed to be available
import TaskItem from "../components/TaskItem";

const CompletedTasks = () => {
  const { tasks, refreshTasks } = useOutletContext();
  const [sortBy, setSortBy] = useState("newest");

  const sortedCompletedTasks = useMemo(() => {
    return tasks
      .filter((task) =>
        [true, 1, "yes"].includes(
          typeof task.completed === "string"
            ? task.completed.toLowerCase()
            : task.completed
        )
      )
      .sort((a, b) => {
        switch (sortBy) {
          case "newest":
            return new Date(b.createdAt) - new Date(a.createdAt);
          case "oldest":
            return new Date(a.createdAt) - new Date(b.createdAt);
          case "priority": {
            const order = { high: 3, medium: 2, low: 1 };
            const priorityA = a.priority?.toLowerCase() || "low";
            const priorityB = b.priority?.toLowerCase() || "low";
            return order[priorityB] - order[priorityA];
          }
          default:
            return 0;
        }
      });
  }, [tasks, sortBy]);

  return (
    // Background is set in Layout.jsx (dynamic gradient)
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-[calc(100vh-64px)]">
      {/* --- Header & Sort Controls --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between pb-6 mb-8 border-b-2 border-purple-300">
        <div className="mb-4 md:mb-0">
          <h1 className="flex items-center gap-3 text-3xl md:text-4xl font-extrabold text-gray-900">
            <CheckCircle2 className="text-purple-700 w-7 h-7" />
            <span className="truncate">Mission Accomplished!</span>
          </h1>
          <p className="text-base text-gray-600 mt-1 pl-10">
            {sortedCompletedTasks.length} successful completion
            {sortedCompletedTasks.length !== 1 && "s"} recorded.
          </p>
        </div>

        {/* Sort Controls */}
        <div className="flex-shrink-0">
          <div className="flex items-center space-x-3 bg-white p-2 rounded-xl shadow-lg border border-gray-200">
            <div className="hidden md:flex items-center gap-2 text-gray-700 font-semibold">
              <Filter className="w-5 h-5 text-purple-600" />
              <span className="text-sm font-semibold">Sort History:</span>
            </div>

            {/* Mobile Dropdown */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="md:hidden p-2 border border-gray-300 rounded-lg text-sm focus:ring-purple-500 focus:border-purple-500"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.label}
                </option>
              ))}
            </select>

            {/* Desktop Buttons */}
            <div className="hidden md:flex space-x-1.5">
              {SORT_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => setSortBy(opt.id)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors duration-200 flex items-center gap-1.5 shadow-md ${
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
      {/* --- End Header --- */}

      {/* --- Task List --- */}
      <div className="grid grid-cols-1 gap-5">
        {sortedCompletedTasks.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-xl shadow-2xl border border-purple-200">
            <div className="w-16 h-16 mx-auto flex items-center justify-center rounded-full bg-purple-100 mb-4">
              <CheckCircle2 className="w-8 h-8 text-purple-700" />
            </div>
            <h3 className="text-xl font-bold text-gray-800">
              No completed tasks yet.
            </h3>
            <p className="text-gray-500 mt-1">
              Keep up the great work! Finished tasks will appear here.
            </p>
          </div>
        ) : (
          sortedCompletedTasks.map((task) => (
            <TaskItem
              key={task._id || task.id}
              task={task}
              onRefresh={refreshTasks}
              showCompleteCheckbox={false}
              // Enhanced styling for completed items
              className="opacity-95 hover:opacity-100 transition-opacity text-base bg-white border border-green-300 shadow-lg hover:shadow-xl rounded-xl"
            />
          ))
        )}
      </div>
      {/* --- End Task List --- */}
    </div>
  );
};

export default CompletedTasks;
