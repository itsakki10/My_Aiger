import { useState, useEffect } from "react";
import axios from "axios";
import {
  UserPlus,
  Mail,
  Lock,
  User,
  BrainCircuit,
  Sparkles,
  LogIn,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// NOTE: Using robust, inline classes for the final design aesthetic.

const API_URL = "http://localhost:4000";
const INITIAL_FORM = { name: "", email: "", password: "" };

// Field definitions for SignUp (using Lucide icons)
const SIGNUP_FIELDS = [
  { name: "name", type: "text", placeholder: "Full Name", icon: User },
  { name: "email", type: "email", placeholder: "Email Address", icon: Mail },
  {
    name: "password",
    type: "password",
    placeholder: "Choose Password",
    icon: Lock,
  },
];

const SignUp = ({ onSwitchMode }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Basic setup logic
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    toast.dismiss();

    try {
      const { data } = await axios.post(
        `${API_URL}/api/user/register`,
        formData
      );
      console.log("SignUp successful:", data);

      toast.success("Registration successful! You can now log in.");
      setFormData(INITIAL_FORM);

      // Automatically switch to login mode after a delay
      setTimeout(() => onSwitchMode?.(), 1500);
    } catch (err) {
      console.error("SignUp error:", err);
      const msg =
        err.response?.data?.message || "An error occurred. Please try again.";
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    // Full-screen, dynamic gradient container (Matching Login)
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-800 via-purple-900 to-fuchsia-900 text-white overflow-hidden flex items-center justify-center p-4">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      {/* Floating Decorative Elements (Background) */}
      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 rounded-full mix-blend-lighten opacity-20 animate-floatOne"></div>
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-fuchsia-500 rounded-xl mix-blend-lighten opacity-20 animate-floatTwo transform rotate-45"></div>

      {/* Brand & Navigation (Fixed top bar) */}
      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <BrainCircuit className="w-7 h-7 text-white" />
          My Aiger{" "}
        </div>
        <div className="flex gap-4">
          <button
            onClick={onSwitchMode}
            className="px-5 py-2 rounded-xl border border-white text-white font-semibold hover:bg-white hover:text-purple-700 transition-colors duration-300"
          >
            Login
          </button>
        </div>
      </div>

      {/* Main Hero Content & Sign Up Form Container (Centered) */}
      <main className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full max-w-6xl mx-auto gap-12 lg:gap-20">
        {/* Left Section: Hero Text & About Line */}
        <div className="text-center lg:text-left lg:w-1/2 p-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter mb-4 drop-shadow-lg">
            Start achieving your biggest goals today.
          </h1>
          {/* New 'About' Line */}
          <p className="text-lg sm:text-xl text-purple-200 mb-8 drop-shadow-md">
            "Your intelligent assistant for managing tasks, goals, and
            productivity."
          </p>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-4 justify-center lg:justify-start">
            <button className="px-8 py-4 bg-fuchsia-500 text-white rounded-full text-lg font-semibold hover:bg-fuchsia-600 transition-colors shadow-xl">
              Explore Features
            </button>
          </div>
        </div>

        <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20 relative">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            Create My Aiger Account
          </h2>
          <p className="text-purple-200 text-center mb-8">
            Join the platform in seconds.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            {SIGNUP_FIELDS.map(({ name, type, placeholder, icon: Icon }) => (
              <div key={name} className="relative">
                <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                <input
                  type={type}
                  placeholder={placeholder}
                  value={formData[name]}
                  onChange={(e) =>
                    setFormData({ ...formData, [name]: e.target.value })
                  }
                  className="w-full pl-12 pr-4 py-3 bg-white/20 rounded-xl border border-white/30 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-purple-200 outline-none transition-all duration-300"
                  required
                />
              </div>
            ))}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center space-x-2 py-3 px-4 rounded-xl text-lg font-semibold bg-white text-purple-700 shadow-xl hover:scale-[1.01] hover:bg-purple-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-purple-700"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <>
                  <UserPlus className="w-5 h-5" /> Create Account
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-purple-100">
            Already have an account?{" "}
            <button
              type="button"
              onClick={onSwitchMode}
              className="font-medium text-purple-200 hover:text-white transition-colors"
            >
              Log in
            </button>
          </p>
        </div>
      </main>

      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-purple-200 z-20">
        © {new Date().getFullYear()} My Aiger (My AI Manager). All rights
        reserved.
      </div>

      <style>{`
        @keyframes floatOne { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
        @keyframes floatTwo { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(15px) rotate(55deg); } }
        .animate-floatOne { animation: floatOne 8s ease-in-out infinite; }
        .animate-floatTwo { animation: floatTwo 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default SignUp;
