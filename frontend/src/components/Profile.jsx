import { useState, useEffect } from "react";
import axios from "axios";
import {
  Lock,
  ChevronLeft,
  Shield,
  LogOut,
  Save,
  UserCircle,
  Mail,
  User,
  KeyRound,
  AlertTriangle,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// NOTE: Using the provided list structures for personalFields and securityFields.

const API_URL = "http://localhost:4000";

// Defined dummy fields (re-used from input, ensuring consistency)
const personalFields = [
  { name: "name", type: "text", placeholder: "Full Name", icon: User },
  { name: "email", type: "email", placeholder: "Email Address", icon: Mail },
];
const securityFields = [
  { name: "current", placeholder: "Current Password" },
  { name: "new", placeholder: "New Password" },
  { name: "confirm", placeholder: "Confirm New Password" },
];
// End assumed constants

export default function Profile({ setCurrentUser, onLogout }) {
  const [profile, setProfile] = useState({ name: "", email: "" });
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    axios
      .get(`${API_URL}/api/user/me`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then(({ data }) => {
        if (data.success)
          setProfile({ name: data.user.name, email: data.user.email });
        else toast.error(data.message);
      })
      .catch(() => toast.error("Unable to load profile."));
  }, []);

  const saveProfile = async (e) => {
    e.preventDefault();
    setProfileLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/api/user/profile`,
        { name: profile.name, email: profile.email },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        setCurrentUser((prev) => ({
          ...prev,
          name: profile.name,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(
            profile.name
          )}&background=random`,
        }));
        toast.success("Profile updated successfully!");
      } else toast.error(data.message);
    } catch (err) {
      toast.error(err.response?.data?.message || "Profile update failed");
    } finally {
      setProfileLoading(false);
    }
  };

  const changePassword = async (e) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      return toast.error("New and Confirmation passwords do not match.");
    }
    setPasswordLoading(true);
    try {
      const token = localStorage.getItem("token");
      const { data } = await axios.put(
        `${API_URL}/api/user/password`,
        { currentPassword: passwords.current, newPassword: passwords.new },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (data.success) {
        toast.success("Password changed successfully!");
        setPasswords({ current: "", new: "", confirm: "" });
      } else toast.error(data.message);
    } catch (err) {
      toast.error(
        err.response?.data?.message ||
          "Password change failed. Check your current password."
      );
    } finally {
      setPasswordLoading(false);
    }
  };

  // --- Inline Tailwind Classes ---
  const INPUT_WRAPPER_CLASS =
    "flex items-center bg-white border border-gray-300 rounded-lg px-4 py-3 focus-within:ring-2 focus-within:ring-purple-600 focus-within:border-purple-600 transition-all duration-200";
  const FULL_BUTTON_CLASS =
    "w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg text-lg font-semibold text-white bg-purple-700 hover:bg-purple-800 transition-colors duration-300 shadow-xl shadow-purple-300/50 disabled:opacity-50";
  const SECTION_WRAPPER_CLASS =
    "bg-white p-6 md:p-8 rounded-2xl shadow-2xl border border-gray-100";
  const BACK_BUTTON_CLASS =
    "flex items-center text-purple-700 hover:text-purple-800 font-semibold transition-colors mb-8";

  return (
    // Note: Background is now the dark gradient from Layout.jsx
    <div className="min-h-screen py-10">
      <ToastContainer position="top-center" autoClose={3000} />
      <div className="max-w-5xl mx-auto p-4 md:p-6">
        {/* --- Header Section --- */}
        {/* FIX 1: Ensure Back Button is highly visible against dark background */}
        <button
          onClick={() => navigate(-1)}
          className="flex items-center text-purple-300 hover:text-white font-semibold transition-colors mb-8"
        >
          <ChevronLeft className="w-5 h-5 mr-1" />
          Back to Dashboard
        </button>

        <div className="flex items-center gap-6 mb-10 border-b border-purple-200 pb-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 flex items-center justify-center text-white text-3xl font-bold shadow-xl">
            {profile.name ? profile.name[0].toUpperCase() : "U"}
          </div>
          <div>
            {/* FIX 2: Changing title text color to white */}
            <h1 className="text-4xl font-extrabold text-white">
              Account Settings
            </h1>
            {/* FIX 3: Changing subtitle text color to light purple */}
            <p className="text-purple-200 text-base mt-1">
              Manage your profile, security, and account preferences.
            </p>
          </div>
        </div>

        {/* --- Profile & Security Forms --- */}
        <div className="grid lg:grid-cols-2 gap-8">
          {/* 1. Personal Information */}
          <section className={SECTION_WRAPPER_CLASS}>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-purple-100">
                <UserCircle className="text-purple-700 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Personal Information
              </h2>
            </div>

            <form onSubmit={saveProfile} className="space-y-6">
              {personalFields.map(({ name, type, placeholder, icon: Icon }) => (
                <div key={name} className={INPUT_WRAPPER_CLASS}>
                  <Icon className="text-purple-600 w-5 h-5 mr-3" />
                  <input
                    type={type}
                    placeholder={placeholder}
                    value={profile[name]}
                    onChange={(e) =>
                      setProfile({ ...profile, [name]: e.target.value })
                    }
                    className="w-full text-base focus:outline-none bg-transparent"
                    required
                  />
                </div>
              ))}
              <button className={FULL_BUTTON_CLASS} disabled={profileLoading}>
                {profileLoading ? (
                  "Saving Profile..."
                ) : (
                  <>
                    <Save className="w-4 h-4" /> Save Profile
                  </>
                )}
              </button>
            </form>
          </section>

          {/* 2. Security Settings */}
          <section className={SECTION_WRAPPER_CLASS}>
            <div className="flex items-center gap-3 mb-8">
              <div className="p-2 rounded-lg bg-purple-100">
                <Shield className="text-purple-700 w-6 h-6" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900">
                Security & Password
              </h2>
            </div>

            <form onSubmit={changePassword} className="space-y-6">
              {securityFields.map(({ name, placeholder }) => (
                <div key={name} className={INPUT_WRAPPER_CLASS}>
                  <KeyRound className="text-purple-600 w-5 h-5 mr-3" />
                  <input
                    type="password"
                    placeholder={placeholder}
                    value={passwords[name]}
                    onChange={(e) =>
                      setPasswords({ ...passwords, [name]: e.target.value })
                    }
                    className="w-full text-base focus:outline-none bg-transparent"
                    required
                  />
                </div>
              ))}
              <button className={FULL_BUTTON_CLASS} disabled={passwordLoading}>
                {passwordLoading ? (
                  "Updating Password..."
                ) : (
                  <>
                    <Shield className="w-4 h-4" /> Change Password
                  </>
                )}
              </button>
            </form>

            {/* Danger Zone (Enhanced Styling) */}
            <div className="mt-10 pt-6 border-t border-red-300">
              <h3 className="text-xl font-bold text-red-700 mb-4 flex items-center gap-2">
                <AlertTriangle className="w-5 h-5" /> Danger Zone
              </h3>
              <p className="text-sm text-gray-600 mb-4">
                If you are done with your session, you can securely log out
                here.
              </p>
              <button
                onClick={onLogout}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors shadow-lg"
              >
                <LogOut className="w-4 h-4" /> Logout from Device
              </button>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}
