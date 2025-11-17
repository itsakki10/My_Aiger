import { useState, useEffect } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Sparkles,
  User,
  BrainCircuit,
  LogIn,
} from "lucide-react";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const CursorCharacter = () => {
  return (
    <div
      className="absolute z-0 w-64 h-64 sm:w-80 sm:h-80 lg:w-96 lg:h-96 rounded-full flex items-center justify-center
                 bg-fuchsia-400 mix-blend-lighten opacity-30 animate-spin-slow"
      style={{ top: "50%", left: "65%", transform: "translate(-50%, -50%)" }}
    >
      <BrainCircuit className="w-20 h-20 text-white opacity-80" />
    </div>
  );
};

const INITIAL_FORM = { email: "", password: "" };

const Login = ({ onSubmit, onSwitchMode }) => {
  const [formData, setFormData] = useState(INITIAL_FORM);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const url = "http://localhost:4000";

  useEffect(() => {
    const token = localStorage.getItem("token");
    const userId = localStorage.getItem("userId");
    if (token) {
      (async () => {
        try {
          const { data } = await axios.get(`${url}/api/user/me`, {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (data.success) {
            onSubmit?.({ token, userId, ...data.user });
            setTimeout(() => navigate("/"), 100);
          } else {
            localStorage.clear();
          }
        } catch {
          localStorage.clear();
        }
      })();
    }
  }, [navigate, onSubmit]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    if (!rememberMe) {
      setError('You must enable "Remember Me" to sign in.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await axios.post(`${url}/api/user/login`, formData);
      if (!data.token) throw new Error(data.message || "Sign In failed.");

      localStorage.setItem("token", data.token);
      localStorage.setItem("userId", data.user.id);

      onSubmit?.(data);
    } catch (err) {
      setError(
        err.response?.data?.message || "Invalid credentials. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSwitchMode = () => {
    navigate("/signup");
  };

  const fields = [
    { name: "email", type: "email", placeholder: "Email Address", icon: Mail },
    {
      name: "password",
      type: showPassword ? "text" : "password",
      placeholder: "Password",
      icon: Lock,
      isPassword: true,
    },
  ];

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-indigo-800 via-purple-900 to-fuchsia-900 text-white overflow-hidden flex items-center justify-center p-4">
      <ToastContainer position="top-center" autoClose={3000} hideProgressBar />

      <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-purple-500 opacity-20 rounded-full mix-blend-lighten animate-floatOne"></div>
      <div className="absolute bottom-1/3 right-1/4 w-40 h-40 bg-fuchsia-500 rounded-xl mix-blend-lighten opacity-20 animate-floatTwo transform rotate-45"></div>

      <div className="absolute z-0 hidden lg:block">
        <CursorCharacter />
      </div>

      <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20">
        <div className="flex items-center gap-2 text-2xl font-extrabold tracking-tight">
          <BrainCircuit className="w-7 h-7 text-white" />
          My Aiger{" "}
          <span className="text-purple-300 text-base font-semibold hidden sm:inline"></span>
        </div>
        <div className="flex gap-4">
          <button
            onClick={handleSwitchMode}
            className="px-5 py-2 rounded-xl border border-white text-white font-semibold hover:bg-white hover:text-purple-700 transition-colors duration-300"
          >
            Sign Up
          </button>
        </div>
      </div>

      {/* Main Hero Content & Login Form Container (Centered) */}
      <div className="relative z-10 flex flex-col lg:flex-row items-center justify-center lg:justify-between w-full max-w-6xl mx-auto gap-12 lg:gap-20">
        {/* Left Section: Hero Text & About Line */}
        <div className="text-center lg:text-left lg:w-1/2 p-4">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight tracking-tighter mb-4 drop-shadow-lg">
            Organize your life, <br /> achieve more with AI
          </h1>
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

        {/* Right Section: Translucent Login Form Card */}
        <div className="w-full max-w-md bg-white/10 backdrop-blur-sm rounded-3xl shadow-2xl p-8 sm:p-10 border border-white/20 relative">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">
            My Aiger Sign In
          </h2>
          <p className="text-purple-200 text-center mb-8">
            Access your personalized AI dashboard.
          </p>

          <form onSubmit={handleLogin} className="space-y-6">
            {fields.map(
              ({ name, type, placeholder, icon: Icon, isPassword }) => (
                <div key={name} className="relative">
                  <Icon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-purple-300" />
                  <input
                    type={type}
                    id={name}
                    name={name}
                    placeholder={placeholder}
                    value={formData[name]}
                    onChange={handleChange}
                    className="w-full pl-12 pr-4 py-3 bg-white/20 rounded-xl border border-white/30 focus:ring-2 focus:ring-purple-400 focus:border-purple-400 text-white placeholder-purple-200 outline-none transition-all duration-300"
                    required
                  />
                  {isPassword && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-purple-300 hover:text-white transition-colors"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <EyeOff className="w-5 h-5" />
                      ) : (
                        <Eye className="w-5 h-5" />
                      )}
                    </button>
                  )}
                </div>
              )
            )}

            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center">
                <input
                  id="rememberMe"
                  name="rememberMe"
                  type="checkbox"
                  checked={rememberMe}
                  onChange={() => setRememberMe(!rememberMe)}
                  className="h-4 w-4 text-purple-500 focus:ring-purple-400 border-purple-300 rounded bg-white/20"
                />
                <label
                  htmlFor="rememberMe"
                  className="ml-2 block text-purple-100"
                >
                  Remember me
                </label>
              </div>
              <a
                href="#"
                className="font-medium text-purple-200 hover:text-white transition-colors"
              >
                Forgot Password?
              </a>
            </div>

            {error && (
              <p className="text-red-300 text-sm text-center -mt-2 font-semibold">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-white text-purple-700 font-bold text-lg shadow-xl hover:scale-[1.01] hover:bg-purple-100 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
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
                  <LogIn className="w-5 h-5" /> Sign In
                </>
              )}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-purple-100">
            New to My Aiger?{" "}
            <button
              onClick={handleSwitchMode}
              className="font-medium text-purple-200 hover:text-white transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>

      {/* Footer / Copyright */}
      <div className="absolute bottom-4 left-0 right-0 text-center text-xs text-purple-200 z-20">
        © {new Date().getFullYear()} My Aiger (My AI Manager). All rights
        reserved.
      </div>

      {/* Tailwind CSS keyframes for floating elements */}
      <style>{`
        @keyframes floatOne { 0%, 100% { transform: translateY(0) rotate(0deg); } 50% { transform: translateY(-20px) rotate(10deg); } }
        @keyframes floatTwo { 0%, 100% { transform: translateY(0) rotate(45deg); } 50% { transform: translateY(15px) rotate(55deg); } }
        .animate-floatOne { animation: floatOne 8s ease-in-out infinite; }
        .animate-floatTwo { animation: floatTwo 10s ease-in-out infinite; }
      `}</style>
    </div>
  );
};

export default Login;
