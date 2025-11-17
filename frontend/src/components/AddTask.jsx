// components/AddTask.jsx
import React, { useState, useEffect, useCallback } from "react";
import { useOutletContext } from "react-router-dom";
import {
  PlusCircle,
  X,
  Save,
  Calendar,
  AlignLeft,
  Flag,
  CheckCircle,
  Zap,
  Mic,
  Users,
} from "lucide-react";

// Base URLs
const API_BASE = "http://localhost:4000/api/tasks";
const AI_BASE = "http://localhost:4000/api/ai"; // Correct AI base URL

const priorityStyles = {
  Low: "bg-green-100 text-green-700 border-green-300",
  Medium: "bg-yellow-100 text-yellow-700 border-yellow-300",
  High: "bg-red-100 text-red-700 border-red-300",
};

const DEFAULT_TASK = {
  title: "",
  description: "",
  priority: "Low",
  dueDate: "",
  completed: "No",
  assignedTo: [],
};

const baseControlClasses =
  "w-full border border-gray-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-purple-600 focus:border-purple-600 transition-all duration-200 resize-none";

const TaskModal = ({ isOpen, onClose, taskToEdit, onSave, onLogout }) => {
  const context = useOutletContext();
  const teamMembers = context?.teamMembers || [];

  const [taskData, setTaskData] = useState(DEFAULT_TASK);
  const [assignedToIds, setAssignedToIds] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const today = new Date().toISOString().split("T")[0];

  const [nlText, setNlText] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (taskToEdit) {
      const normalized =
        taskToEdit.completed === "Yes" || taskToEdit.completed === true
          ? "Yes"
          : "No";
      setTaskData({
        ...DEFAULT_TASK,
        title: taskToEdit.title || "",
        description: taskToEdit.description || "",
        priority: taskToEdit.priority || "Low",
        dueDate: taskToEdit.dueDate?.split("T")[0] || "",
        completed: normalized,
        id: taskToEdit._id,
      });
      setAssignedToIds(taskToEdit.assignedTo || []);
    } else {
      setTaskData(DEFAULT_TASK);
      setAssignedToIds([]);
    }
    setError(null);
    setNlText("");
  }, [isOpen, taskToEdit]);

  const handleChange = useCallback((e) => {
    const { name, value } = e.target;
    setTaskData((prev) => ({ ...prev, [name]: value }));
  }, []);

  const handleAssigneeChange = (e) => {
    const { options } = e.target;
    const selectedIds = [];
    for (let i = 0, l = options.length; i < l; i++) {
      if (options[i].selected) {
        selectedIds.push(options[i].value);
      }
    }
    setAssignedToIds(selectedIds);
  };

  const getHeaders = useCallback(() => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("No auth token found");
    return {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    };
  }, []); // ------------------------------------------------------------------- // ✅ UPDATED AI PARSING FUNCTION (handleParseNL) with Date Validation and return checks // -------------------------------------------------------------------

  const handleParseNL = async () => {
    if (!nlText?.trim()) {
      setError("Please enter some text for the AI to parse.");
      return;
    }
    setAiLoading(true);
    setError(null); // Clear previous errors

    try {
      const token = localStorage.getItem("token");
      // Payload now includes the current date for better AI accuracy (Backend change applied in previous step)
      const res = await fetch(`${AI_BASE}/parse-task`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          naturalLanguageInput: nlText,
          currentDate: today,
        }),
      });
      if (!res.ok) {
        if (res.status === 401) return onLogout?.();
        const err = await res.json();
        throw new Error(err.error || "AI parse failed with server error.");
      }
      let parsedTaskData = await res.json();
      let validationError = null; // Use a local variable to manage errors before updating state

      const newDueDate = parsedTaskData.dueDate;
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;

      if (newDueDate) {
        if (!dateRegex.test(newDueDate)) {
          validationError = `AI provided an invalid date format: ${newDueDate}. Please enter manually.`;
          parsedTaskData.dueDate = "";
        } else if (newDueDate < today) {
          validationError = `AI suggested a past date: ${newDueDate}. Please choose a future date.`;
          parsedTaskData.dueDate = "";
        }
      }

      setTaskData((prev) => ({
        ...prev,
        title: parsedTaskData.title || prev.title,
        description: parsedTaskData.description || prev.description,
        priority: parsedTaskData.priority || prev.priority,
        dueDate: parsedTaskData.dueDate || prev.dueDate,
      }));
      setNlText("");

      // ✅ Set the success message OR the validation error message
      if (validationError) {
        setError(validationError); // Display the specific date error
      } else {
        setError("Parsed text applied! Review and save your task."); // Display success
      }
    } catch (err) {
      console.error("AI parse error", err);
      setError(
        err.message || "An unexpected error occurred during AI parsing."
      );
    } finally {
      setAiLoading(false);
    }
  }; // The handleGenerateDescription function (retained from original code, no changes needed)

  const handleGenerateDescription = async () => {
    if (!taskData.title?.trim()) {
      setError("Enter a title first to generate description.");
      return;
    }
    setAiLoading(true);
    setError(null);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${AI_BASE}/generate-description`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ title: taskData.title }),
      });
      const json = await res.json();
      if (!json.success) {
        setError(json.message || "AI generation failed");
        return;
      }
      setTaskData((prev) => ({
        ...prev,
        description: json.parsed?.description || prev.description,
      }));
      setError("Description generated! Review and refine the text.");
    } catch (err) {
      console.error("AI generate error", err);
      setError("AI service error");
    } finally {
      setAiLoading(false);
    }
  }; // -------------------------------------------------------------------
  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();

      if (taskData.dueDate && taskData.dueDate < today) {
        setError("Due date cannot be in the past.");
        return;
      }
      setLoading(true);
      setError(null);

      const finalTaskData = {
        ...taskData,
        assignedTo: assignedToIds,
      };

      try {
        const isEdit = Boolean(taskData.id);

        const url = isEdit ? `${API_BASE}/${taskData.id}/gp` : `${API_BASE}/gp`;
        const resp = await fetch(url, {
          method: isEdit ? "PUT" : "POST",
          headers: getHeaders(),
          body: JSON.stringify(finalTaskData),
        });
        if (!resp.ok) {
          if (resp.status === 401) return onLogout?.();
          const err = await resp.json();
          throw new Error(err.message || "Failed to save task");
        }
        const saved = await resp.json();
        onSave?.(saved);
        onClose();
      } catch (err) {
        console.error(err);
        setError(err.message || "An unexpected error occurred");
      } finally {
        setLoading(false);
      }
    },
    [taskData, assignedToIds, today, getHeaders, onLogout, onSave, onClose]
  );

  if (!isOpen) return null;

  const modalTitle = taskData.id ? "Edit Task" : "Create New Task";
  const modalIcon = taskData.id ? Save : PlusCircle;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-black/40 z-50 flex items-center justify-center p-4 sm:p-6">
                                   {" "}
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl p-6 sm:p-8 relative transform transition-all duration-300 animate-fadeIn border-t-4 border-purple-700 overflow-y-auto max-h-[90vh]">
                                {/* Header */}                       {" "}
        <div className="flex justify-between items-start mb-6 border-b pb-4">
                                                           {" "}
          <h2 className="text-2xl sm:text-3xl font-extrabold text-gray-900 flex items-center gap-3">
                                                                       {" "}
            {React.createElement(modalIcon, {
              className: "text-purple-700 w-6 h-6 flex-shrink-0",
            })}
                                                {modalTitle}                   {" "}
                     {" "}
          </h2>
                                                           {" "}
          <button
            onClick={onClose}
            className="p-2 bg-gray-100 rounded-full transition-colors text-gray-500 hover:bg-red-100 hover:text-red-600 shadow-sm flex-shrink-0"
            aria-label="Close modal"
          >
                                                <X className="w-6 h-6" />       
                                 {" "}
          </button>
                                                     {" "}
        </div>
                                               {" "}
        <form onSubmit={handleSubmit} className="space-y-6">
                                                           {" "}
          {/* AI Helper Section (JSX remains the same, but now calls the correct function logic) */}
                                                           {" "}
          <div className="bg-purple-50 p-4 rounded-xl border border-purple-300 space-y-3">
                                                                       {" "}
            <h3 className="text-lg font-semibold text-purple-800 flex items-center gap-2">
                                                                               
                  <Zap className="w-5 h-5 text-purple-700 fill-purple-300" /> AI
                                                        Task Assistant          
                                       {" "}
            </h3>
                                                                       {" "}
            <label className="block text-sm font-medium text-gray-700">
                                                        Natural Language Input  
                                                             {" "}
            </label>
                                                                       {" "}
            <div className="flex gap-3">
                                                                               
                 {" "}
              <input
                value={nlText}
                onChange={(e) => setNlText(e.target.value)}
                placeholder="e.g. Finish quarterly report by Friday, high priority"
                className="flex-1 rounded-lg border border-purple-300 px-4 py-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-purple-500"
              />
                                                                               
                 {" "}
              <button
                type="button"
                onClick={handleParseNL} // Calls the corrected function
                disabled={aiLoading}
                className="px-4 py-2 rounded-lg bg-purple-700 text-white text-sm font-semibold hover:bg-purple-800 transition-colors disabled:opacity-50 flex items-center gap-1 shadow-md flex-shrink-0"
              >
                                                                               {" "}
                               {" "}
                {aiLoading ? (
                  "Parsing..."
                ) : (
                  <>
                                                                               {" "}
                                        <Mic className="w-4 h-4" /> Parse      
                                                                               
                                               {" "}
                  </>
                )}
                                                                               
                         {" "}
              </button>
                                                                             {" "}
            </div>
                                                                       {" "}
            <div className="flex items-center pt-1 flex-wrap">
                                                                               
                 {" "}
              <button
                type="button"
                onClick={handleGenerateDescription}
                disabled={aiLoading || !taskData.title?.trim()}
                className="text-sm text-purple-700 hover:text-purple-900 font-medium transition-colors disabled:opacity-50 underline-offset-2 hover:underline"
              >
                                                                               {" "}
                               {" "}
                {aiLoading
                  ? "Generating..."
                  : "Generate Description from Title"}
                                                                               
                         {" "}
              </button>
                                                                               
                 {" "}
              <span className="text-xs text-gray-500 ml-3 hidden sm:block">
                                                                · AI suggestions
                are optional —                 **Review before                
                saving.**                                                      
                   {" "}
              </span>
                                                                             {" "}
            </div>
                                                                 {" "}
          </div>
                                        {/* Error Message */}                   {" "}
                   {" "}
          {error && (
            <div className="text-sm text-red-700 bg-red-100 p-3 rounded-lg border border-red-300 font-medium">
                                                        {error}                 
                               {" "}
            </div>
          )}
                                                           {" "}
          {/* Task Title (Value is correctly bound to taskData.title) */}       
                                                   {" "}
          <div>
                                                                       {" "}
            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                        Task Title              {" "}
              <span className="text-red-500">*</span>                           
                                                 {" "}
            </label>
                                                                       {" "}
            <div className="flex items-center border border-gray-300 rounded-lg px-3 py-2.5 focus-within:ring-2 focus-within:ring-purple-600 focus-within:border-purple-600 transition-all duration-200 bg-gray-50">
                                                                               
                 {" "}
              <input
                type="text"
                name="title"
                required
                value={taskData.title}
                onChange={handleChange}
                className="w-full focus:outline-none text-base bg-transparent"
                placeholder="e.g., Finalize Q3 Marketing Strategy"
              />
                                                                             {" "}
            </div>
                                                                 {" "}
          </div>
                                        {/* Delegation Field (New Feature) */} 
                                               {" "}
          {teamMembers.length > 0 && (
            <div>
                                                                               
                 {" "}
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                                               {" "}
                <Users className="w-4 h-4 text-purple-600" />                  
                              Assign To (Team                 Lead Feature)    
                                                                     {" "}
              </label>
                                                                               
                 {" "}
              <select
                name="assignedTo"
                multiple
                value={assignedToIds}
                onChange={handleAssigneeChange}
                className={`${baseControlClasses} bg-gray-50 h-24 overflow-y-auto`}
              >
                                                                               {" "}
                               {" "}
                {teamMembers.map((member) => (
                  <option key={member.id} value={member.id}>
                                                                               {" "}
                    {member.name} (                     {member.email})        
                                                                               
                                             {" "}
                  </option>
                ))}
                                                                               
                         {" "}
              </select>
                                                                               
                 {" "}
              <p className="text-xs text-gray-500 mt-1">
                                                                Hold Ctrl/Cmd to
                select multiple                 members.                        
                                                 {" "}
              </p>
                                                                             {" "}
            </div>
          )}
                                                           {" "}
          {/* Description (Value is correctly bound to taskData.description) */}
                                                           {" "}
          <div>
                                                                       {" "}
            <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                                     {" "}
              <AlignLeft className="w-4 h-4 text-purple-600" />                
                          Description                                    {" "}
            </label>
                                                                       {" "}
            <textarea
              name="description"
              rows="3"
              value={taskData.description}
              onChange={handleChange}
              className={`${baseControlClasses} bg-gray-50`}
              placeholder="Add details, subtasks, or project context"
            />
                                                                 {" "}
          </div>
                                        {/* Priority and Due Date */}           
                           {" "}
          <div className="grid grid-cols-2 gap-4">
                                                                       {" "}
            {/* Priority Select (Value is correctly bound to taskData.priority) */}
                                                                       {" "}
            <div>
                                                                               
                 {" "}
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                                               {" "}
                <Flag className="w-4 h-4 text-purple-600" />                    
                            Priority                                          {" "}
              </label>
                                                                               
                 {" "}
              <select
                name="priority"
                value={taskData.priority}
                onChange={handleChange}
                className={`${baseControlClasses} appearance-none pr-8 font-medium ${
                  priorityStyles[taskData.priority]
                }`}
              >
                                                               {" "}
                <option value="Low">Low</option>                               
                                               {" "}
                <option value="Medium">Medium</option>                         
                                      <option value="High">High</option>       
                                                                 {" "}
              </select>
                                                                             {" "}
            </div>
                                                                       {" "}
            {/* Due Date Input (Value is correctly bound to taskData.dueDate) */}
                                                                       {" "}
            <div>
                                                                               
                 {" "}
              <label className="text-sm font-medium text-gray-700 mb-1 flex items-center gap-1">
                                                                               {" "}
                <Calendar className="w-4 h-4 text-purple-600" />                
                                Due Date                {" "}
                <span className="text-red-500">*</span>                         
                                                               {" "}
              </label>
                                                                               
                 {" "}
              <input
                type="date"
                name="dueDate"
                required
                min={today}
                value={taskData.dueDate}
                onChange={handleChange}
                className={baseControlClasses}
              />
                                                                             {" "}
            </div>
                                                                 {" "}
          </div>
                                        {/* Status Radios */}                   {" "}
                   {" "}
          <div>
                                                                       {" "}
            <label className="text-sm font-medium text-gray-700 mb-2 flex items-center gap-1">
                                                                     {" "}
              <CheckCircle className="w-4 h-4 text-purple-600" />              
                            Status                                    {" "}
            </label>
                                                                       {" "}
            <div className="flex gap-6 p-2 rounded-lg bg-gray-50 border border-gray-200 flex-wrap">
                                                                               
                 {" "}
              {[
                { val: "Yes", label: "Completed" },
                { val: "No", label: "In Progress" },
              ].map(({ val, label }) => (
                <label key={val} className="flex items-center cursor-pointer">
                                                                               
                                             {" "}
                  <input
                    type="radio"
                    name="completed"
                    value={val}
                    checked={taskData.completed === val}
                    onChange={handleChange}
                    className="h-5 w-5 text-purple-600 focus:ring-purple-600 border-gray-300 checked:bg-purple-600 checked:border-transparent rounded-full"
                  />
                                                                               
                                             {" "}
                  <span className="ml-2 text-sm font-medium text-gray-800">
                                                                               {" "}
                    {label}                                                     
                                       {" "}
                  </span>
                                                                               
                                       {" "}
                </label>
              ))}
                                                                             {" "}
            </div>
                                                                 {" "}
          </div>
                                        {/* Save/Update Button */}             
                         {" "}
          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-fuchsia-600 to-purple-700 text-white font-semibold py-3 px-4 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 hover:shadow-xl hover:shadow-purple-300 transition-all duration-200 text-lg mt-8"
          >
                                                                       {" "}
            {loading ? (
              "Saving..."
            ) : taskData.id ? (
              <>
                                                               {" "}
                <Save className="w-5 h-5" />                 Update Task        
                                                                 {" "}
              </>
            ) : (
              <>
                                                                               {" "}
                <PlusCircle className="w-5 h-5" /> Create Task                  
                                                                       {" "}
              </>
            )}
                                                                 {" "}
          </button>
                                                     {" "}
        </form>
                                         {" "}
      </div>
                             {" "}
    </div>
  );
};

export default TaskModal;
