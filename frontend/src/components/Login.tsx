import { useState, ChangeEvent, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Eye, EyeOff } from "lucide-react";
import { useAlert } from "../context/alert/AlertContext";
import { useGoogleLogin } from "@react-oauth/google";

interface Credentials {
  email: string;
  password: string;
  userType: "Admin" | "Seller" | "Services" | "Customer";
}

export default function Login() {
  const [credentials, setCredentials] = useState<Credentials>({
    email: "",
    password: "",
    userType: "Customer",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL as string;
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

  useEffect(() => {
    if (!API_URL) {
      showError("Application configuration error: API URL not set");
      console.error("Missing VITE_API_URL in environment variables");
    }
    if (!GOOGLE_CLIENT_ID) {
      showError("Application configuration error: Google Client ID not set");
      console.error("Missing VITE_GOOGLE_CLIENT_ID in environment variables");
    }
  }, [API_URL, GOOGLE_CLIENT_ID, showError]);

  const fetchWithRetry = async (url: string, options: RequestInit, retries = MAX_RETRIES): Promise<Response> => {
    try {
      const response = await fetch(url, options);
      if (!response.ok && response.status === 429 && retries > 0) {
        showError("Too many requests. Retrying...");
        await new Promise(resolve => setTimeout(resolve, 1000 * (MAX_RETRIES - retries + 1)));
        return fetchWithRetry(url, options, retries - 1);
      }
      return response;
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000 * (MAX_RETRIES - retries + 1)));
        return fetchWithRetry(url, options, retries - 1);
      }
      throw error;
    }
  };

  // ---------- Normal Login ----------
  const handleSubmit = async () => {
    const { email, password, userType } = credentials;
    if (!email.trim()) return showError("Please enter your email");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return showError("Invalid email address");
    if (!password) return showError("Please enter your password");

    setIsLoading(true);

    try {
      const response = await fetchWithRetry(`${API_URL}/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role: userType }),
        credentials: "include",
      });

      const json = await response.json();

      if (response.ok) {
        localStorage.setItem("auth-token", json.authToken || "");
        localStorage.setItem("refresh-token", json.refreshToken || "");
        localStorage.setItem("auth-role", json.user?.role || userType);
        localStorage.setItem("user-data", JSON.stringify(json.user || {}));

        const userId = json.user?._id || json.user?.id;
        const userRole = json.user?.role || userType;

        if (userRole === "Seller") {
          localStorage.setItem("sellerId", userId || "");
          navigate(`/seller/${userId}`);
        } else if (userRole === "Admin") {
          navigate("/admin");
        } else if (userRole === "Services") {
          navigate(`/services/${userId}`);
        } else {
          navigate(`/customer/${userId}`);
        }

        showSuccess(`Welcome back, ${json.user?.name || "User"}!`);
        setCredentials({ email: "", password: "", userType: "Customer" });
      } else {
        showError(json.message || "Login failed");
      }
    } catch (error: any) {
      showError(error.message || "Something went wrong. Please try again.");
      console.error("Login error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // ---------- Google OAuth (Redirect Mode) ----------
  const handleGoogleLogin = useGoogleLogin({
    flow: "auth-code",
    scope: "openid profile email",
    ux_mode: "redirect",
    redirect_uri: `${import.meta.env.VITE_API_URL}/api/auth/google/callback`, // Updated to match backend
    onSuccess: async (codeResponse) => {
      setIsLoading(true);
      try {
        const redirectUri = `${import.meta.env.VITE_API_URL}/api/auth/google/callback`;
        const response = await fetchWithRetry(`${API_URL}/api/auth/google/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            code: codeResponse.code,
            role: credentials.userType,
            redirectUri,
          }),
          credentials: "include",
        });

        const contentType = response.headers.get("content-type");
        if (!contentType || !contentType.includes("application/json")) {
          const text = await response.text();
          console.error("Non-JSON response:", text);
          throw new Error("Server returned a non-JSON response. Please check the API endpoint.");
        }

        const json = await response.json();

        if (response.ok) {
          localStorage.setItem("auth-token", json.authToken || "");
          localStorage.setItem("refresh-token", json.refreshToken || "");
          localStorage.setItem("auth-role", json.user?.role || credentials.userType);
          localStorage.setItem("user-data", JSON.stringify(json.user || {}));

          const userId = json.user?._id || json.user?.id;
          const userRole = json.user?.role || credentials.userType;

          if (userRole === "Seller") {
            localStorage.setItem("sellerId", userId || "");
            navigate(`/seller/${userId}`);
          } else if (userRole === "Admin") {
            navigate("/admin");
          } else if (userRole === "Services") {
            navigate(`/services/${userId}`);
          } else {
            navigate(`/customer/${userId}`);
          }

          showSuccess(`Welcome back, ${json.user?.name || "User"}!`);
        } else {
          showError(json.message || "Google login failed");
        }
      } catch (error: any) {
        showError(`Google login failed: ${error.message}`);
        console.error("Google login error:", error);
      } finally {
        setIsLoading(false);
        setRetryCount(0);
      }
    },
    onError: (error) => {
      console.error("Google auth error:", error);
      showError("Google authentication failed. Try again.");
      setIsLoading(false);
    },
  });

  const onChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setCredentials({ ...credentials, [e.target.name]: e.target.value });

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription>Sign in to your account to continue</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Google Login */}
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (retryCount >= MAX_RETRIES) {
                showError("Too many attempts. Try later or use manual login.");
                return;
              }
              handleGoogleLogin();
              setRetryCount(prev => prev + 1);
            }}
            disabled={isLoading || retryCount >= MAX_RETRIES || !GOOGLE_CLIENT_ID}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.22 3.31v2.77h3.59c2.1-1.94 3.27-4.79 3.27-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.99 7.28-2.7l-3.59-2.77c-.99.66-2.27 1.05-3.69 1.05-2.84 0-5.24-1.92-6.1-4.5H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.9 14.08c-.22-.66-.34-1.36-.34-2.08s.12-1.42.34-2.08V7.08H2.18A10.01 10.01 0 0 0 2 12c0 1.61.39 3.14 1.18 4.92L5.9 14.08z"
              />
              <path
                fill="#EA4335"
                d="M12 4.79c1.62 0 3.07.56 4.21 1.65l3.12-3.12C17.46 1.3 14.97 0 12 0 7.7 0 3.99 2.47 2.18 7.08L5.9 9.92c.86-2.58 3.26-4.5 6.1-4.5z"
              />
            </svg>
            {isLoading ? "Processing..." : "Continue with Google"}
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <Separator className="w-full" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          {/* User Role */}
          <div className="space-y-2">
            <Label htmlFor="userType">Login as</Label>
            <select
              name="userType"
              value={credentials.userType}
              onChange={onChange}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              disabled={isLoading}
            >
              <option value="Customer">Customer</option>
              <option value="Seller">Seller</option>
              <option value="Services">Services</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          {/* Email */}
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              name="email"
              value={credentials.email}
              onChange={onChange}
              placeholder="Enter your email"
              required
              disabled={isLoading}
            />
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                name="password"
                value={credentials.password}
                onChange={onChange}
                placeholder="Enter your password"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowPassword(!showPassword)}
                disabled={isLoading}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          {/* Submit */}
          <Button
            type="button"
            className="w-full"
            onClick={handleSubmit}
            disabled={isLoading}
          >
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Don't have an account? </span>
            <Link to="/signup" className="text-primary hover:underline font-medium">
              Sign up
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}