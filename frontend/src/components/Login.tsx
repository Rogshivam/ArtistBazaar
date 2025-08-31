import { useState, useContext, ChangeEvent } from "react";
import { useNavigate, Link } from "react-router-dom";
import AlertContext from "../context/alert/AlertContext";

interface Credentials {
  email: string;
  password: string;
  userType: "Admin" | "Seller" | "Services";
}

export default function Login() {
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
    userType: "Admin",
  });

  const [errorMsg, setErrorMsg] = useState("An unknown error occurred");

  const API_URL = import.meta.env.VITE_URL as string;
  const navigate = useNavigate();

  const { showAlert } = useContext(AlertContext)!;

  const { email, password, userType } = credentials;

  const handleSubmit = async () => {
    let endpoint = "/api/auth/login";

    if (userType === "Seller") endpoint = "/api/handle-seller/login";
    if (userType === "Services") endpoint = "/api/services/login";

    try {
      const response = await fetch(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const json = await response.json();
      setErrorMsg(json.message);

      if (response.ok) {
        localStorage.setItem("auth-token", json.authToken);
        showAlert(json.message, "success");
        setCredentials({ email: "", password: "", userType });

        if (userType === "Admin") navigate("/admin");
        if (userType === "Seller") navigate(`/seller/${json.seller.id}`);
        if (userType === "Services") navigate(`/services/${json.services.id}`);
      } else {
        showAlert(json.message, "danger");
      }
    } catch (error: any) {
      setErrorMsg(error.message);
      showAlert(error.message, "danger");
      console.error(error);
    }
  };

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  return (
    <div className="flex justify-center items-center h-screen bg-foreground/20">
      <div className="w-full max-w-md p-8 bg-slate-200 shadow-xl rounded-xl">
        <h2 className="text-2xl font-bold text-center mb-6 text-primary">Login</h2>

        {/* User Type */}
         <div className="mb-4">
          <label htmlFor="userType" className="block mb-1 font-semibold text-primary">
            Login as
          </label>
          <select
            name="userType"
            value={userType}
            onChange={onChange}
            className="w-full border text-slate-200 border-primary bg-zinc-700 text-primary px-3 py-2 rounded-md"
          >
            <option >Admin</option>
            <option>Seller</option>
            <option>Services</option>
          </select>
        </div>

        {/* Email */}
        <div className="mb-4">
          <label htmlFor="email" className="block mb-1 font-semibold text-primary">
            Email
          </label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={onChange}
            className="w-full border border-primary bg-zinc-700 text-white px-3 py-2 rounded-md"
            required
          />
        </div>

        {/* Password */}
        <div className="mb-4">
          <label htmlFor="password" className="block mb-1 font-semibold text-primary">
            Password
          </label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={onChange}
            className="w-full border border-primary bg-zinc-700 text-white px-3 py-2 rounded-md"
            required
          />
        </div>

        <div className="mt-6">
          <button
            type="button"
            onClick={handleSubmit}
            className="w-full bg-primary text-white px-4 py-2 rounded-md hover:bg-primary/70"
          >
            Login
          </button>
        </div>

        <div className="text-center mt-4">
          <p className="text-primary">
            Don’t have an account?{" "}
            <Link
              to="/signup"
              className="text-blue-600 hover:text-yellow-900 underline transition"
            >
              Sign up
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
