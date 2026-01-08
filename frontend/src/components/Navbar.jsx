
import React, { useRef, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, LogOut, Settings, Zap } from "lucide-react";

const Navbar = ({ user = {}, onLogout }) => {
  const menuRef = useRef(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleMenuToggle = () => setMenuOpen((prev) => !prev);

  const handleLogout = () => {
    setMenuOpen(false);
    onLogout();
  };

  // Close menu on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-50 bg-white/90 backdrop-blur-md shadow-sm border-b border-gray-200">
      <div className="flex items-center justify-between px-4 py-3 md:px-6 max-w-7xl mx-auto">
        {/* Logo */}
        <div
          className="flex items-center gap-2 cursor-pointer group"
          onClick={() => navigate("/")}
        >
          <div className="relative w-10 h-10 flex items-center justify-center rounded-xl bg-gradient-to-br from-fuchsia-500 via-purple-500 to-indigo-500 shadow-lg transition-all group-hover:scale-105">
            <Zap className="w-6 h-6 text-white" />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-white rounded-full shadow-md animate-ping" />
          </div>

          <span className="text-2xl font-extrabold bg-gradient-to-r from-fuchsia-500 via-purple-500 to-indigo-500 bg-clip-text text-transparent">
          WorkDude
          </span>
        </div>

        {/* Right Side */}
        <div className="flex items-center gap-4">
          <button
            className="p-2 text-gray-600 hover:text-purple-500 hover:bg-purple-50 rounded-full transition"
            onClick={() => navigate("/profile")}
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* User Menu */}
          <div ref={menuRef} className="relative">
            <button
              onClick={handleMenuToggle}
              className="flex items-center gap-2 px-3 py-2 rounded-full hover:bg-purple-50 transition border hover:border-purple-200"
            >
              <div className="relative">
                {user.avatar ? (
                  <img
                    src={user.avatar}
                    alt="Avatar"
                    className="w-9 h-9 rounded-full shadow-sm"
                  />
                ) : (
                  <div className="w-9 h-9 flex items-center justify-center rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 text-white font-semibold shadow-md">
                    {user.name?.[0]?.toUpperCase() || "U"}
                  </div>
                )}
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 rounded-full border-2 border-white animate-pulse" />
              </div>

              <div className="text-left hidden md:block">
                <p className="text-sm font-medium text-gray-800">
                  {user.name || "User"}
                </p>
                <p className="text-xs text-gray-500">
                  {user.email || ""}
                </p>
              </div>

              <ChevronDown
                className={`w-4 h-4 text-gray-500 transition-transform ${
                  menuOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {menuOpen && (
              <ul className="absolute top-14 right-0 w-56 bg-white rounded-xl shadow-xl border border-purple-100 z-50 overflow-hidden">
                <li className="p-2">
                  <button
                    onClick={() => {
                      setMenuOpen(false);
                      navigate("/profile");
                    }}
                    className="w-full px-4 py-2 text-left hover:bg-purple-50 text-sm text-gray-700 flex items-center gap-2 rounded-lg"
                  >
                    <Settings className="w-4 h-4" />
                    Profile Settings
                  </button>
                </li>

                <li className="p-2">
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
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
