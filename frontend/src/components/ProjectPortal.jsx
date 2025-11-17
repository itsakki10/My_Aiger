import React from "react";
import { useOutletContext } from "react-router-dom";

const ProjectPortal = () => {
  const context = useOutletContext();
  const { onLogout } = context || {};

  return (
    <div className="p-8 bg-white rounded-xl shadow-lg border border-purple-200 min-h-[80vh]">
      <h1 className="text-3xl font-extrabold text-purple-700 mb-4 flex items-center gap-3">
        <span role="img" aria-label="Book">
          📚
        </span>{" "}
        Project Portal (Notion-like Workspace)
      </h1>
      <p className="text-gray-700 text-lg">
        This area will contain the rich text editor and collaboration tools. The
        structure is now in place!
      </p>
      <button
        onClick={onLogout}
        className="mt-6 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
      >
        Test Logout
      </button>
    </div>
  );
};

export default ProjectPortal;
