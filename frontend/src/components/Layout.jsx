import { useState, useEffect, useCallback, useMemo } from "react";
import { Outlet } from "react-router-dom";
import {
  Circle,
  TrendingUp,
  BrainCircuit,
  Clock,
  CheckCircle,
  ListTodo,
} from "lucide-react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";
import axios from "axios";

const Layout = ({ user, onLogout }) => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchTasks = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No auth token found");

      const { data } = await axios.get("http://localhost:4000/api/tasks/gp", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const arr = Array.isArray(data)
        ? data
        : Array.isArray(data?.tasks)
        ? data.tasks
        : Array.isArray(data?.data)
        ? data.data
        : [];

      setTasks(arr);
    } catch (err) {
      console.error(err);
      setError(err.message || "Could not load tasks.");
      if (err.response?.status === 401) onLogout();
    } finally {
      setLoading(false);
    }
  }, [onLogout]);

  useEffect(() => {
    fetchTasks();
  }, [fetchTasks]);

  const stats = useMemo(() => {
    const isCompleted = (t) =>
      t.completed === true ||
      t.completed === 1 ||
      (typeof t.completed === "string" && t.toLowerCase() === "yes");

    const completedTasks = tasks.filter(isCompleted).length;

    const totalCount = tasks.length;
    const pendingCount = totalCount - completedTasks;
    const completionPercentage = totalCount
      ? Math.round((completedTasks / totalCount) * 100)
      : 0;

    return {
      totalCount,
      completedTasks,
      pendingCount,
      completionPercentage,
    };
  }, [tasks]); // --- REDESIGNED STAT CARD COMPONENT (Using robust inline classes) ---

  const StatCard = ({ title, value, icon, colorClass, valueColorClass }) => (
    <div className="p-4 rounded-xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-all duration-300 group">
           {" "}
      <div className="flex items-center gap-3">
               {" "}
        <div
          className={`p-2 rounded-full ${colorClass} transition-colors duration-300 group-hover:scale-105`}
        >
                    {icon}       {" "}
        </div>
               {" "}
        <div className="min-w-0">
                   {" "}
          <p
            className={`text-2xl font-extrabold leading-none ${valueColorClass}`}
          >
                        {value}         {" "}
          </p>
                   {" "}
          <p className="text-sm text-gray-500 font-medium mt-1">{title}</p>     
           {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  ); // --- END REDESIGNED STAT CARD ---
  if (loading)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-purple-800 to-fuchsia-800 flex items-center justify-center">
               {" "}
        <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-b-4 border-purple-300"></div>
             {" "}
      </div>
    );

  if (error)
    return (
      <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-purple-800 to-fuchsia-800 p-6 flex items-center justify-center">
               {" "}
        <div className="bg-red-50 text-red-700 p-6 rounded-xl border border-red-300 max-w-md shadow-lg">
                   {" "}
          <p className="font-semibold mb-2 text-lg">⚠️ Application Error</p>   
                <p className="text-sm">{error}</p>         {" "}
          <button
            onClick={fetchTasks}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-medium hover:bg-red-700 transition-colors shadow-md"
          >
                        Try Refreshing          {" "}
          </button>
                 {" "}
        </div>
             {" "}
      </div>
    );

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-800 via-purple-800 to-fuchsia-800 relative overflow-hidden">
           {" "}
      <div className="absolute top-1/4 left-1/2 w-[800px] h-[800px] bg-purple-500/30 rounded-full mix-blend-lighten filter blur-3xl animate-blob opacity-60 hidden lg:block"></div>
           {" "}
      <div className="absolute bottom-1/4 right-0 w-[600px] h-[600px] bg-fuchsia-500/30 rounded-full mix-blend-lighten filter blur-3xl animate-blob animation-delay-2000 opacity-60 hidden lg:block"></div>
           {" "}
      <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-indigo-500/30 rounded-full mix-blend-lighten filter blur-3xl animate-blob animation-delay-4000 opacity-60 hidden lg:block"></div>
            <Navbar user={user} onLogout={onLogout} />
            <Sidebar user={user} tasks={tasks} />     {" "}
      <div
        style={{ paddingTop: "150px" }}
        className="ml-0 xl:ml-64 lg:ml-64 md:ml-16 p-4 md:p-6 transition-all duration-300 max-w-full relative z-10"
      >
               {" "}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                   {" "}
          <div className="xl:col-span-2 space-y-6">
                       {" "}
            {/* 🔑 CRUCIAL CHANGE: Adding onLogout to the context 🔑 */}
                       {" "}
            <Outlet context={{ tasks, refreshTasks: fetchTasks, onLogout }} /> 
                   {" "}
          </div>
                   {" "}
          <div className="xl:col-span-1 space-y-6">
                       {" "}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-200">
                           {" "}
              <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2 border-b pb-3 border-purple-100">
                               {" "}
                <TrendingUp className="w-5 h-5 text-purple-700" />             
                  Performance Metrics              {" "}
              </h3>
                           {" "}
              <div className="grid grid-cols-2 gap-4 mb-4">
                               {" "}
                <StatCard
                  title="Total Tasks"
                  value={stats.totalCount}
                  icon={<ListTodo className="w-5 h-5 text-purple-700" />}
                  colorClass="bg-purple-100"
                  valueColorClass="text-purple-800"
                />
                               {" "}
                <StatCard
                  title="Completed"
                  value={stats.completedTasks}
                  icon={<CheckCircle className="w-5 h-5 text-green-600" />}
                  colorClass="bg-green-100"
                  valueColorClass="text-green-800"
                />
                               {" "}
                <StatCard
                  title="Pending"
                  value={stats.pendingCount}
                  icon={<Clock className="w-5 h-5 text-fuchsia-600" />}
                  colorClass="bg-fuchsia-100"
                  valueColorClass="text-fuchsia-800"
                />
                               {" "}
                <StatCard
                  title="Completion Rate"
                  value={`${stats.completionPercentage}%`}
                  icon={<BrainCircuit className="w-5 h-5 text-indigo-600" />}
                  colorClass="bg-indigo-100"
                  valueColorClass="bg-gradient-to-r from-fuchsia-600 to-purple-700 bg-clip-text text-transparent"
                />
                             {" "}
              </div>
                            {/* Progress Bar Display */}             {" "}
              <div className="space-y-3 pt-3">
                               {" "}
                <div className="flex items-center justify-between text-gray-700">
                                   {" "}
                  <span className="text-sm font-semibold flex items-center gap-2">
                                       {" "}
                    <Circle className="w-3 h-3 text-purple-700 fill-purple-700" />
                                        Overall Task Progress                  {" "}
                  </span>
                                   {" "}
                  <span className="text-sm bg-purple-700 text-white px-2 py-0.5 rounded-full font-bold">
                                        {stats.completedTasks}/
                    {stats.totalCount}                 {" "}
                  </span>
                                 {" "}
                </div>
                               {" "}
                <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-inner">
                                   {" "}
                  <div
                    className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-700 transition-all duration-500 ease-in-out"
                    style={{ width: `${stats.completionPercentage}%` }}
                  />
                                 {" "}
                </div>
                             {" "}
              </div>
                         {" "}
            </div>
                        {/* Recent Activity Panel */}           {" "}
            <div className="bg-white rounded-2xl p-6 shadow-xl border border-purple-200">
                           {" "}
              <h3 className="text-xl font-bold mb-4 text-gray-900 flex items-center gap-2 border-b pb-3 border-purple-100">
                                <Clock className="w-5 h-5 text-fuchsia-700" /> 
                              Recent Task Activity              {" "}
              </h3>
                           {" "}
              <div className="space-y-3">
                               {" "}
                {tasks.slice(0, 5).map((task) => (
                  <div
                    key={task._id || task.id}
                    className="flex items-center justify-between p-3 hover:bg-purple-50/70 rounded-xl transition-colors duration-200 border border-transparent hover:border-purple-200 cursor-pointer"
                  >
                                       {" "}
                    <div className="flex-1 min-w-0">
                                           {" "}
                      <p className="text-base font-medium text-gray-800 truncate">
                                                {task.title}                   
                         {" "}
                      </p>
                                           {" "}
                      <p className="text-xs text-gray-500 mt-0.5">
                                               {" "}
                        {task.createdAt
                          ? new Date(task.createdAt).toLocaleString("en-US", {
                              day: "numeric",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })
                          : "No date"}
                                             {" "}
                      </p>
                                         {" "}
                    </div>
                                       {" "}
                    <span
                      className={`px-3 py-1 text-xs rounded-full shrink-0 font-semibold ml-3 shadow-sm ${
                        task.completed
                          ? "bg-green-100 text-green-700 border border-green-300"
                          : "bg-fuchsia-100 text-fuchsia-700 border border-fuchsia-300"
                      }`}
                    >
                                           {" "}
                      {task.completed ? "Completed" : "Active"}                 
                       {" "}
                    </span>
                                     {" "}
                  </div>
                ))}
                               {" "}
                {tasks.length === 0 && (
                  <div className="text-center py-6 px-2 bg-gray-50 rounded-xl">
                                       {" "}
                    <div className="w-14 h-14 mx-auto mb-3 rounded-full bg-purple-200 flex items-center justify-center">
                                           {" "}
                      <ListTodo className="w-7 h-7 text-purple-700" />         
                               {" "}
                    </div>
                                       {" "}
                    <p className="text-base font-semibold text-gray-700">
                                            No tasks created yet.              
                           {" "}
                    </p>
                                       {" "}
                    <p className="text-sm text-gray-500 mt-1">
                                            Start by creating your first task!  
                                       {" "}
                    </p>
                                     {" "}
                  </div>
                )}
                             {" "}
              </div>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
             {" "}
      </div>
         {" "}
    </div>
  );
};

export default Layout;
