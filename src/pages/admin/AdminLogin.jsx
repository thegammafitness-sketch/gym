// import { useState } from "react";
// import { supabase } from "../../supabase";
// import { useNavigate } from "react-router-dom";

// export default function AdminLogin() {
//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [error, setError] = useState("");
//   const [loading, setLoading] = useState(false);

//   const navigate = useNavigate();

//   async function handleLogin(e) {
//     e.preventDefault();
//     setLoading(true);
//     setError("");

//     const { error } = await supabase.auth.signInWithPassword({
//       email,
//       password,
//     });

//     if (error) {
//       setError("Invalid email or password");
//       setLoading(false);
//       return;
//     }

//     navigate("/admin/members");
//   }

//   return (
//     <div className="min-h-screen flex items-center justify-center bg-gray-100">
//       <form
//         onSubmit={handleLogin}
//         className="bg-white p-8 rounded-2xl shadow w-full max-w-sm"
//       >
//         <h1 className="text-2xl font-bold mb-6 text-center">
//           Admin Login
//         </h1>

//         <input
//           type="email"
//           placeholder="Admin Email"
//           value={email}
//           onChange={(e) => setEmail(e.target.value)}
//           className="w-full mb-4 px-4 py-3 rounded-xl border"
//           required
//         />

//         <input
//           type="password"
//           placeholder="Password"
//           value={password}
//           onChange={(e) => setPassword(e.target.value)}
//           className="w-full mb-4 px-4 py-3 rounded-xl border"
//           required
//         />

//         {error && (
//           <p className="text-red-600 text-sm mb-3">{error}</p>
//         )}

//         <button
//           disabled={loading}
//           className="w-full py-3 rounded-xl bg-indigo-600 text-white font-semibold"
//         >
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//     </div>
//   );
// }

import { useState } from "react";
import { supabase } from "../../supabase";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff } from "lucide-react";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError("Invalid email or password");
      setLoading(false);
      return;
    }

    navigate("/admin/members");
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-600 via-purple-600 to-blue-600 relative overflow-hidden">

      {/* Background Blur Circles */}
      <div className="absolute w-72 h-72 bg-white/20 rounded-full blur-3xl top-10 left-10" />
      <div className="absolute w-96 h-96 bg-white/10 rounded-full blur-3xl bottom-10 right-10" />

      {/* Login Card */}
      <form
        onSubmit={handleLogin}
        className="relative z-10 bg-white/20 backdrop-blur-xl border border-white/30 shadow-2xl p-10 rounded-3xl w-full max-w-md animate-fadeIn"
      >
        <h1 className="text-3xl font-bold text-white text-center mb-8 tracking-tight">
          Admin Login
        </h1>

        {/* Email */}
        <div className="mb-5">
          <input
            type="email"
            placeholder="Admin Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-white/30 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white transition"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-5 relative">
          <input
            type={showPass ? "text" : "password"}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-5 py-3 rounded-2xl bg-white/30 text-white placeholder-white/80 focus:outline-none focus:ring-2 focus:ring-white transition"
            required
          />
          <button
            type="button"
            onClick={() => setShowPass(!showPass)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white"
          >
            {showPass ? <EyeOff size={20} /> : <Eye size={20} />}
          </button>
        </div>

        {/* Error */}
        {error && (
          <p className="text-red-200 text-sm mb-4 animate-pulse">
            {error}
          </p>
        )}

        {/* Button */}
        <button
          disabled={loading}
          className="w-full py-3 rounded-2xl bg-white text-indigo-600 font-semibold hover:scale-105 transition-all duration-300 shadow-lg"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        {/* Footer */}
        <p className="text-center text-white/70 text-xs mt-6">
          Gym Admin Panel
        </p>
      </form>
    </div>
  );
}
