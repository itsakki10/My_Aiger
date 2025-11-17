import { useState, useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  Sparkles,
  Lightbulb,
  Menu,
  X,
  PlusCircle,
  LayoutDashboard,
  ListChecks,
  CheckCircle2,
  BookOpen, // ICON IMPORT for Notes
} from "lucide-react";
import TaskModal from "../components/AddTask";

// Assumed Mobile Drawer Classes
const MOBILE_CLASSES = {
  drawer:
    "fixed top-0 left-0 w-3/4 max-w-sm h-full bg-white p-6 shadow-2xl transition-transform duration-300 overflow-y-auto",
  backdrop: "absolute inset-0 bg-black/50 transition-opacity duration-300",
};

const menuItems = [
  {
    text: "Dashboard",
    path: "/",
    icon: <LayoutDashboard className="w-5 h-5" />,
  },
  {
    text: "Active Tasks",
    path: "/pending",
    icon: <ListChecks className="w-5 h-5" />,
  },
  {
    text: "Completed History",
    path: "/completed",
    icon: <CheckCircle2 className="w-5 h-5" />,
  },
  // NEW MENU ITEM for the Notion-like Portal
  {
    text: "Notes",
    path: "/notes",
    icon: <BookOpen className="w-5 h-5" />,
  },
];

const Sidebar = ({ user, tasks }) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showModal, setShowModal] = useState(false);

  const isCompleted = (task) =>
    task.completed === true ||
    task.completed === 1 ||
    (typeof task.completed === "string" &&
      task.completed.toLowerCase() === "yes");

  const totalTasks = tasks?.length || 0;
  const completedTasks = tasks?.filter(isCompleted).length || 0;
  const productivity =
    totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  const username = user?.name || "User";
  const initial = username.charAt(0).toUpperCase();

  useEffect(() => {
    document.body.style.overflow =
      mobileOpen && window.innerWidth < 1024 ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [mobileOpen]);

  const renderMenuItems = (isMobile = false) => (
    <ul className="space-y-2">
           {" "}
      {menuItems.map(({ text, path, icon }) => (
        <li key={text}>
                   {" "}
          <NavLink
            to={path}
            className={({
              isActive,
            }) => `w-full flex items-center gap-3 py-3 px-4 rounded-xl text-sm font-semibold transition-all duration-200 group ${
              isActive
                ? "bg-purple-700 text-white shadow-lg shadow-purple-300/50 hover:bg-purple-800"
                : "text-gray-700 hover:bg-purple-100 hover:text-purple-700"
            } 
              ${
              isMobile ? "justify-start" : "justify-center lg:justify-start"
            }`}
            onClick={() => setMobileOpen(false)}
          >
                        <span className="w-5 h-5 flex-shrink-0">{icon}</span>   
                   {" "}
            <span
              className={`${
                isMobile ? "block" : "hidden lg:block"
              } whitespace-nowrap`}
            >
                            {text}           {" "}
            </span>
                     {" "}
          </NavLink>
                 {" "}
        </li>
      ))}
         {" "}
    </ul>
  );

  return (
    <>
            {/* Desktop Sidebar (W-16/W-64) - Z-INDEX 30 for hierarchy */}     {" "}
      <div className="fixed top-0 left-0 h-full w-16 lg:w-64 bg-white border-r border-gray-200 shadow-2xl transition-all duration-300 flex flex-col pt-16 z-30">
                {/* User Info Header (Visible on large screens) */}       {" "}
        <div className="p-4 border-b border-purple-200 hidden lg:block">
                   {" "}
          <div className="flex items-center gap-3">
                       {" "}
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center text-white font-bold shadow-md flex-shrink-0">
                            {initial}           {" "}
            </div>
                       {" "}
            <div>
                           {" "}
              <h2 className="text-lg font-bold text-gray-800 truncate">
                                Hey, {username}!              {" "}
              </h2>
                           {" "}
              <p className="text-sm text-purple-700 font-medium flex items-center gap-1">
                                <Sparkles className="w-3 h-3" /> Get to work    
                         {" "}
              </p>
                         {" "}
            </div>
                     {" "}
          </div>
                 {" "}
        </div>
               {" "}
        {/* Minimized User/Productivity Block (Visible on minimized W-16 view) */}
               {" "}
        <div className="p-3 mb-2 lg:hidden flex justify-center border-b border-purple-200">
                   {" "}
          {/* Centering the user initial (A) and ensuring padding is minimal */}
                   {" "}
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center text-white font-bold shadow-md">
                        {initial}         {" "}
          </div>
                 {" "}
        </div>
               {" "}
        <div className="p-4 space-y-6 overflow-y-auto flex-1">
                    {/* Productivity Card (ADJUSTED FOR MINIMIZED VIEW) */}     
             {" "}
          <div className="p-3 lg:p-4 rounded-xl bg-purple-100 border border-purple-300 shadow-inner w-full lg:w-auto">
                       {" "}
            <div className="flex justify-between items-center mb-2">
                           {" "}
              <h3 className="text-xs font-bold text-purple-800 tracking-wider hidden lg:block">
                                Productivity Score              {" "}
              </h3>
                           {" "}
              {/* Show only the percentage on the minimized view */}           
               {" "}
              <span className="text-xl font-extrabold text-purple-900 w-full text-center">
                                {productivity}%              {" "}
              </span>
                         {" "}
            </div>
                       {" "}
            {/* Progress Bar (Hidden on W-16 view to save space and prevent clipping) */}
                       {" "}
            <div className="h-2 bg-purple-300 rounded-full overflow-hidden hidden lg:block">
                           {" "}
              <div
                className="h-full bg-gradient-to-r from-fuchsia-500 to-purple-700 transition-all duration-500"
                style={{ width: `${productivity}%` }}
              />
                         {" "}
            </div>
                     {" "}
          </div>
                    {/* Navigation Links */}          {renderMenuItems()}       
            {/* Create Task Button (Primary Sidebar Action) */}         {" "}
          <button
            onClick={() => setShowModal(true)}
            className="w-full flex items-center justify-center lg:justify-start gap-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-purple-700 shadow-lg shadow-purple-300/50 hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
          >
                        <PlusCircle className="w-5 h-5" />           {" "}
            <span className="hidden lg:block">New Task</span>         {" "}
          </button>
                   {" "}
          {/* Pro Tip Card (Moved to the bottom, hidden on minimized view) */} 
                 {" "}
          <div className="mt-auto pt-6 hidden lg:block">
                       {" "}
            <div className="bg-white p-4 rounded-xl border border-purple-300 shadow-xl text-center">
                           {" "}
              <div className="flex items-start gap-3">
                               {" "}
                <div className="p-2 rounded-full bg-purple-200 flex-shrink-0">
                                   {" "}
                  <Lightbulb className="w-5 h-5 text-purple-700" />             
                   {" "}
                </div>
                               {" "}
                <div className="text-left">
                                   {" "}
                  <h3 className="text-base font-bold text-purple-800">
                                        AI Tip                  {" "}
                  </h3>
                                   {" "}
                  <p className="text-xs text-gray-600">
                                        Use AI assist to parse tasks instantly
                    from natural                     language!                  {" "}
                  </p>
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
            {/* Mobile Toggle Button (Fixed position) */}     {" "}
      {!mobileOpen && (
        <button
          onClick={() => setMobileOpen(true)}
          className="fixed top-4 left-4 p-2 bg-purple-700 text-white rounded-full shadow-xl z-50 lg:hidden hover:scale-105 transition-transform"
        >
                    <Menu className="w-6 h-6" />       {" "}
        </button>
      )}
            {/* Mobile Drawer */}     {" "}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
                   {" "}
          <div
            className={MOBILE_CLASSES.backdrop}
            onClick={() => setMobileOpen(false)}
          />
                   {" "}
          <div
            className={MOBILE_CLASSES.drawer}
            onClick={(e) => e.stopPropagation()}
          >
                       {" "}
            <div className="flex justify-between items-center mb-6 border-b pb-3">
                           {" "}
              <div className="flex items-center gap-2">
                                <Sparkles className="w-5 h-5 text-purple-700" />
                               {" "}
                <h2 className="text-xl font-bold text-purple-800">
                                    My Aiger Menu                {" "}
                </h2>
                             {" "}
              </div>
                           {" "}
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-full hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
              >
                                <X className="w-6 h-6" />             {" "}
              </button>
                         {" "}
            </div>
                       {" "}
            <div className="flex items-center gap-3 mb-6 p-3 bg-purple-50 rounded-xl border border-purple-200">
                           {" "}
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center text-white font-bold text-xl shadow-md flex-shrink-0">
                                {initial}             {" "}
              </div>
                           {" "}
              <div>
                               {" "}
                <h2 className="text-lg font-bold text-gray-800">
                                    Hello, {username}!                {" "}
                </h2>
                               {" "}
                <p className="text-sm text-purple-700 font-medium">
                                    {totalTasks} total tasks                {" "}
                </p>
                             {" "}
              </div>
                         {" "}
            </div>
                        {/* Mobile Navigation */}           {" "}
            {renderMenuItems(true)}            {/* Mobile New Task Button */}   
                   {" "}
            <button
              onClick={() => {
                setMobileOpen(false);
                setShowModal(true);
              }}
              className="w-full flex items-center justify-center gap-3 py-3 px-4 rounded-xl text-lg font-semibold text-white bg-gradient-to-r from-fuchsia-600 to-purple-700 shadow-xl shadow-purple-300/50 hover:shadow-2xl transition-all duration-200 mt-6"
            >
                            <PlusCircle className="w-6 h-6" />             
              Create Task            {" "}
            </button>
                     {" "}
          </div>
                 {" "}
        </div>
      )}
            <TaskModal isOpen={showModal} onClose={() => setShowModal(false)} />
         {" "}
    </>
  );
};

export default Sidebar;
