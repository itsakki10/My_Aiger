import { useState, useRef, useEffect } from "react";
import {
  Settings,
  ChevronDown,
  LogOut,
  BrainCircuit,
  User,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

const Navbar = ({ user = {}, onLogout }) => {
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const menuRef = useRef(null);

  const handleMenuToggle = () => setMenuOpen((prev) => !prev);
  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="fixed w-full top-0 z-50 bg-white/95 backdrop-blur-md shadow-xl border-b border-gray-100 font-sans">
      <div className="flex items-center justify-between px-4 py-3 md:px-8 max-w-[90rem] mx-auto">
        <div
          className="flex items-center gap-3 cursor-pointer group ml-20 md:ml-0"
          onClick={() => navigate("/")}
        >
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-700 via-purple-700 to-indigo-700 shadow-xl shadow-purple-400/50 group-hover:shadow-purple-500/70 group-hover:scale-[1.05] transition-all duration-300">
            <BrainCircuit className="w-6 h-6 text-white" />
            <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-white rounded-full shadow-md border border-purple-700 animate-pulse" />
          </div>

          <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-700 via-purple-700 to-indigo-700 bg-clip-text text-transparent tracking-wider">
            My Aiger
          </span>
        </div>

        {/* Right - User Controls */}
        <div className="flex items-center gap-2 md:gap-4">
          <button
            className="p-3 text-gray-500 hover:text-purple-700 transition-colors duration-300 hover:bg-purple-100/70 rounded-full"
            onClick={() => navigate("/profile")}
            aria-label="Settings"
            title="Settings"
          >
            <Settings className="w-5 h-5" />
          </button>

          <div ref={menuRef} className="relative z-50">
            <button
              onClick={handleMenuToggle}
              className="flex items-center gap-2 px-1 py-1 rounded-full cursor-pointer hover:bg-purple-100 transition-colors duration-300"
              aria-expanded={menuOpen}
              aria-label="User menu"
            >
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar || "/placeholder.svg"}
                    alt="Avatar"
                    className="w-10 h-10 rounded-full object-cover bg-gray-200 border-2 border-purple-500 shadow-sm"
                  />
                ) : (
                  <div className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-600 to-purple-700 text-white font-semibold text-lg shadow-md border-2 border-white">
                    {user.name?.[0]?.toUpperCase() || (
                      <User className="w-5 h-5" />
                    )}
                  </div>
                )}
                <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white animate-pulse" />
              </div>

              <div className="text-left hidden lg:block pr-2">
                <p className="text-sm font-extrabold text-gray-900 truncate max-w-[150px] md:max-w-[120px]">
                  {user.name || "My Aiger User"}
                </p>
                <p className="text-xs text-gray-500 font-medium truncate max-w-[150px] md:max-w-[120px]">
                  {user.email || "user@myaiger.com"}
                </p>
              </div>

              <ChevronDown
                className={`w-5 h-5 text-purple-700 transition-transform duration-300 hidden lg:block ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <ul className="absolute top-14 right-0 min-w-[200px] w-auto bg-white rounded-xl shadow-2xl border border-gray-100 z-50 overflow-hidden animate-fadeIn transform origin-top-right">
                <li className="p-3 border-b border-gray-100 block lg:hidden">
                  <p className="text-sm font-bold text-gray-800 truncate">
                    {user.name || "My Aiger User"}
                  </p>
                  <p className="text-xs text-gray-500 font-medium truncate">
                    {user.email || "user@myaiger.com"}
                  </p>
                </li>

                <li className="p-1">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full px-3 py-2.5 text-left hover:bg-purple-50 rounded-lg text-sm text-gray-700 transition-colors flex items-center gap-3 font-medium"
                    role="menuitem"
                  >
                    <Settings className="w-4 h-4 text-purple-600" />
                    Profile & Settings
                  </button>
                </li>
                <li className="p-1">
                  <button
                    onClick={handleLogout}
                    className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm hover:bg-red-50 text-red-600 font-medium transition-colors border border-transparent hover:border-red-100"
                    role="menuitem"
                  >
                    <LogOut className="w-4 h-4" />
                    Log Out
                  </button>
                </li>
              </ul>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
