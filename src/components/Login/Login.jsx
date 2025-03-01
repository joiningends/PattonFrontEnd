import { useState } from "react";
import { EyeIcon, EyeOffIcon } from "lucide-react";

export default function PattonLoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
  });

  const handleSubmit = e => {
    e.preventDefault();
    // Handle login logic here
    console.log("Login attempt:", formData);
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-b from-[#000060] to-[#2D4DBF]">
      <div className="w-full max-w-6xl grid lg:grid-cols-2 gap-8 items-center p-4">
        {/* Left side - Company Info */}
        <div className="hidden lg:flex flex-col items-center justify-center p-8 text-white space-y-6">
          <div className="text-6xl font-bold tracking-wider border-4 border-white px-8 py-4">
            PATTON
          </div>
          <div className="text-center space-y-4">
            <h2 className="text-2xl font-bold">Patton International Limited</h2>
            <p className="text-sm opacity-90">
              ISO 9001:2015 Certified Company
            </p>
            <div className="max-w-md text-sm opacity-80">
              A government-recognised export house manufacturing premier Conduit
              Fittings and EMT Fittings
            </div>
          </div>
        </div>

        {/* Right side - Login Form */}
        <div className="w-full max-w-md mx-auto bg-white rounded-xl shadow-2xl p-8 space-y-6">
          <div className="lg:hidden flex justify-center mb-6">
            <div className="text-4xl font-bold tracking-wider text-[#000060] border-4 border-[#000060] px-6 py-3">
              PATTON
            </div>
          </div>

          <div className="space-y-2 text-center">
            <h1 className="text-2xl font-bold text-[#000060]">
              Welcome to Patton Portal
            </h1>
            <p className="text-gray-600">Please login to access your account</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-4">
              <div>
                <label
                  htmlFor="identifier"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Username or Email
                </label>
                <input
                  id="identifier"
                  type="text"
                  placeholder="Enter your username or email"
                  className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#000060]"
                  value={formData.identifier}
                  onChange={e =>
                    setFormData({ ...formData, identifier: e.target.value })
                  }
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-[#000060]"
                    value={formData.password}
                    onChange={e =>
                      setFormData({ ...formData, password: e.target.value })
                    }
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-5 w-5" />
                    ) : (
                      <EyeIcon className="h-5 w-5" />
                    )}
                  </button>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                type="button"
                className="text-sm text-[#000060] hover:text-[#2D4DBF]"
              >
                Forgot password?
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-2 px-4 bg-[#000060] text-white rounded-lg hover:bg-[#011B8E] transition-colors font-medium"
            >
              Login
            </button>
          </form>

          <div className="text-center text-sm text-gray-600">
            Having trouble? Contact{" "}
            <a
              href="mailto:it.support@pattonindia.com"
              className="text-[#000060] hover:text-[#2D4DBF]"
            >
              IT Support
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
