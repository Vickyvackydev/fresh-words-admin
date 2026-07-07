import React, { useState } from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Lock, Mail, Eye, EyeOff, Loader2 } from "lucide-react";
import { setToken, setUser, setRole } from "../state/slices/authReducer";
import toast from "react-hot-toast";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email || !password) {
      toast.error("Please fill in all fields");
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      setIsLoading(false);
      
      if (email.includes("@") && password.length >= 6) {
        const mockUser = {
          id: "admin-1",
          first_name: "John",
          last_name: "Doe",
          email: email
        };
        const mockToken = "mock-jwt-token-xyz-123";
        
        dispatch(setUser(mockUser));
        dispatch(setToken(mockToken));
        dispatch(setRole("ADMIN"));
        
        toast.success("Welcome back, Pastor John!");
        navigate("/dashboard");
      } else {
        toast.error("Invalid credentials (password must be at least 6 characters)");
      }
    }, 1000);
  };

  return (
    <div className="min-h-screen w-screen flex items-center justify-center bg-[#0B0F19] p-4 relative font-sans select-none">
      <div className="w-full max-w-sm bg-[#121214] border border-[#232326] rounded-md shadow-2xl p-6 relative z-10">
        
        {/* Brand Header */}
        <div className="flex flex-col items-center mb-6">
          <div className="w-10 h-10 rounded-sm bg-[#27272A] border border-[#3F3F46] flex items-center justify-center font-bold text-white text-xl mb-2">
            FW
          </div>
          <h2 className="text-lg font-bold text-white tracking-wide">Fresh Words Admin</h2>
          <p className="text-xxs text-slate-500 font-mono tracking-wider uppercase mt-0.5">Console authentication</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSignIn} className="space-y-4">
          {/* Email input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Email Address
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Mail className="w-4 h-4" />
              </span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="pastor.john@freshwords.org"
                className="w-full pl-9 pr-3 py-2 bg-[#161619] border border-[#232326] rounded-md text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-all font-semibold"
              />
            </div>
          </div>

          {/* Password input */}
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block">
              Password
            </label>
            <div className="relative">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                <Lock className="w-4 h-4" />
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full pl-9 pr-9 py-2 bg-[#161619] border border-[#232326] rounded-md text-xs text-slate-100 placeholder-slate-600 focus:outline-none focus:border-orange-500 transition-all font-mono"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-2.5 flex items-center text-slate-500 hover:text-slate-350 cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Remember Me */}
          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-2 cursor-pointer text-slate-500 hover:text-slate-400 select-none">
              <input
                type="checkbox"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 bg-[#161619] border-[#232326] rounded-sm text-orange-600 focus:ring-orange-500 focus:ring-offset-slate-900 border"
              />
              <span className="text-xxs font-bold uppercase tracking-wider">Remember Me</span>
            </label>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2.5 py-2.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs tracking-wider uppercase rounded-md transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed border-none"
          >
            {isLoading ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Validating...</span>
              </>
            ) : (
              <span>Sign In</span>
            )}
          </button>
        </form>

        {/* Demo Notice */}
        <div className="mt-5 pt-4 border-t border-[#232326] text-center">
          <p className="text-[10px] font-mono text-slate-500 leading-normal">
            Demo credentials: <span className="text-slate-400">pastor.john@freshwords.org</span> / <span className="text-slate-400">password</span>
          </p>
        </div>

      </div>
    </div>
  );
}
