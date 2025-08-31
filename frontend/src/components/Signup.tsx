import { useState, useContext, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import alertContext from "../context/alert/AlertContext";
// import loadingContext from "../context/loading/loadingContext"; // optional if you don't need loading

interface FormData {
  email: string;
  role: "Student" | "Faculty";
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const { showAlert } = useContext(alertContext) as {
    showAlert: (msg: string, type: string) => void;
  };
  // const { setLoading } = useContext(loadingContext) as { setLoading: (val: boolean) => void };

  const navigate = useNavigate();
  const api_url = import.meta.env.VITE_URL as string;

  const [formData, setFormData] = useState<FormData>({
    email: "",
    role: "Student",
    password: "",
    confirmPassword: "",
  });

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async () => {
    if (formData.password !== formData.confirmPassword) {
      showAlert("Passwords do not match", "danger");
      return;
    }

    // setLoading(true);
    const endpoint =
      formData.role === "Faculty"
        ? "/api/faculty/set-password"
        : "/api/students/set-password";

    try {
      const response = await fetch(`${api_url}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
        }),
      });

      const result = await response.json();

      if (response.ok) {
        showAlert(result.message || "Account created successfully", "success");
        setFormData({
          email: "",
          role: "Student",
          password: "",
          confirmPassword: "",
        });

        setTimeout(() => {
          navigate("/login");
        }, 1500);
      } else {
        showAlert(result.message || "Signup failed", "danger");
      }
    } catch (error: any) {
      showAlert(error.message || "Something went wrong", "danger");
    } finally {
      // setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-12 bg-foreground/20">
      <div className="w-full max-w-md bg-slate-200 rounded-2xl shadow-lg p-8">
        <h2 className="text-2xl font-semibold text-center text-primary mb-6">
          Create Your Account
        </h2>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block text-sm font-medium text-primary">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border px-3 py-2 rounded-md border-zinc-500 bg-zinc-700 text-primary"
            placeholder="Enter your email"
            required
          />
        </div>

        {/* Role */}
        <div className="mb-4">
          <label htmlFor="role" className="block text-sm font-medium text-primary">
            Role
          </label>
          <select
            name="role"
            value={formData.role}
            onChange={handleChange}
            className="w-full border border-zinc-500 bg-zinc-700 text-gray-100 px-3 py-2 rounded-md"
          >
            <option value="Student">Seller</option>
            <option value="Faculty">Services</option>
          </select>
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block text-sm font-medium text-primary">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            className="mt-1 block shadow-sm w-full border px-3 py-2 rounded-md border-zinc-500 bg-zinc-700 text-white"
            placeholder="Set a password"
            required
          />
        </div>

        {/* Confirm Password */}
        <div className="mb-6">
          <label htmlFor="confirmPassword" className="block text-sm font-medium text-primary">
            Confirm Password
          </label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            className="mt-1 block w-full shadow-sm border px-3 py-2 rounded-md border-zinc-500 bg-zinc-700 text-white"
            placeholder="Re-enter password"
            required
          />
        </div>

        <button
          onClick={handleSignup}
          className="w-full bg-primary hover:bg-primary/70 text-white font-semibold py-2 rounded-md transition"
        >
          Sign Up
        </button>

        <div className="text-center mt-2">
          <p className="text-primary">
            Already have an account?{" "}
            <Link to="/login" className="text-blue-600 hover:text-yellow-900 underline transition">
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
