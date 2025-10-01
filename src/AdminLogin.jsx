import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function AdminLogin() {
  // Add state for the username
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // NOTE: In a real application, you would use a secure backend API call here,
  // NOT a hardcoded username/password like this.
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.get("http://localhost:5000/api/auth/login", {
        username,
        password,
      });

      // Save token + user info
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("user", JSON.stringify(res.data.user));

      navigate("/admin/panel"); // go to admin panel
    } catch (err) {
      setError("Invalid username or password");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-sm">
        <div className="text-center mb-6">
          {/* Using a simple icon for visual appeal */}
          <span className="text-5xl text-indigo-600">🔑</span> 
          <h1 className="text-3xl font-extrabold text-gray-900 mt-2">
            Admin Access
          </h1>
          <p className="text-sm text-gray-500">Sign in to manage reports</p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="bg-white p-8 rounded-lg shadow-xl border border-gray-100"
        >
          {/* New Username Section */}
          <div className="mb-4">
            <label 
              htmlFor="username" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
                Administrator Username
            </label>
            <input
              id="username"
              type="text"
              placeholder="Enter your username"
              value={username}
              // Update state on change
              onChange={(e) => setUsername(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150"
              required
            />
          </div>

          {/* Existing Password Section */}
          <div className="mb-6">
            <label 
              htmlFor="password" 
              className="block text-sm font-medium text-gray-700 mb-1"
            >
                Security Password
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-indigo-500 focus:border-indigo-500 text-lg transition duration-150"
              required
            />
          </div>

          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-3 py-2 rounded-md mb-4 text-sm">
                {error}
            </div>
          )}

          <button
            type="submit"
            className="w-full bg-indigo-600 text-white font-semibold py-3 rounded-lg shadow-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-150 ease-in-out"
          >
            Authenticate & Login
          </button>
        </form>
      </div>
    </div>
  );
}