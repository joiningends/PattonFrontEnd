import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

const API_BASE_URL = "http://localhost:3000/api";

export default function FirstTimeLogin() {
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      const response = await axios.post(`${API_BASE_URL}/auth/first-time-login`, {
        email,
      });

      console.log("response: ", response);

      setMessage(response.data.message);
      setError("");
      setTimeout(() => navigate(`/reset/password?userId=${response.data.data.id}`), 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to send reset link.");
      setMessage("");
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#000060] to-[#2D4DBF]">
      <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8 space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-2xl font-bold text-[#000060]">First time login</h1>
          <p className="text-gray-600">
            Enter your email to set password and login.
          </p>
        </div>

        {message && <div className="text-green-500 text-center">{message}</div>}
        {error && <div className="text-red-500 text-center">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="Enter your email"
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#000060]"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <button
            type="submit"
            className="w-full py-2 px-4 bg-[#000060] text-white rounded-lg hover:bg-[#011B8E] transition-colors font-medium"
          >
            Next
          </button>
        </form>

        <div className="text-center text-sm text-gray-600">
          Not first time login?{" "}
          <button
            onClick={() => navigate("/")}
            className="text-[#000060] hover:text-[#2D4DBF]"
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}