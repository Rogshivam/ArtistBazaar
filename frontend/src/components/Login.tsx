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
  const API_URL = import.meta.env.VITE_API_URL as string; // e.g., http://localhost:4000/api/auth
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

  // Validate environment variables
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

  // Disable popups to enforce redirect mode
  useEffect(() => {
    const originalOpen = window.open;
    window.open = null; // Prevent popup attempts
    return () => {
      window.open = originalOpen; // Restore on cleanup
    };
  }, []);

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

  const handleSubmit = async () => {
    const { email, password, userType } = credentials;
    if (!email.trim()) {
      showError("Please enter your email");
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError("Please enter a valid email address");
      return;
    }
    if (!password) {
      showError("Please enter your password");
      return;
    }

    setIsLoading(true);
    const endpoint = "/api/auth/login";

    try {
      const response = await fetchWithRetry(`${API_URL}${endpoint}`, {
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

        const userRole = json.user?.role || userType;

        if (userRole === "Seller") {
          localStorage.setItem("sellerId", json.user?.id || "");
          navigate(`/seller/${json.user?.id}`);
        } else if (userRole === "Admin") {
          navigate("/admin");
        } else if (userRole === "Services") {
          navigate(`/services/${json.user?.id}`);
        } else {
          navigate(`/customer/${json.user?.id}`);
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

  const handleGoogleLogin = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      setIsLoading(true);
      try {
        const redirectUri = `${window.location.origin}/google-callback`;
        console.log("Google OAuth config:", {
          flow: "auth-code",
          scope: "openid profile email",
          ux_mode: "redirect",
          redirect_uri: redirectUri,
          client_id: GOOGLE_CLIENT_ID,
        });
        console.log("Google auth code:", credentialResponse.code);
        const response = await fetchWithRetry(`${API_URL}/google/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            code: credentialResponse.code,
            role: credentials.userType,
          }),
          credentials: "include",
        });
        const json = await response.json();
        console.log("Backend response:", json);
        if (response.ok) {
          localStorage.setItem("auth-token", json.authToken || "");
          localStorage.setItem("refresh-token", json.refreshToken || "");
          localStorage.setItem("auth-role", json.user?.role || credentials.userType);
          localStorage.setItem("user-data", JSON.stringify(json.user || {}));
          if (json.user?.role === "Seller") {
            localStorage.setItem("sellerId", json.user?.id || "");
            navigate(`/seller/${json.user?.id}`);
          } else if (json.user?.role === "Admin") {
            navigate("/admin");
          } else if (json.user?.role === "Services") {
            navigate(`/services/${json.user?.id}`);
          } else {
            navigate(`/customer/${json.user?.id}`);
          }
          showSuccess(`Welcome, ${json.user?.name || "User"}!`);
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
    onError: (errorResponse) => {
      console.error("Google auth error:", errorResponse);
      showError("Google authentication failed: Please check your Google Cloud Console configuration or try manual login.");
      setIsLoading(false);
    },
    flow: "auth-code",
    scope: "openid profile email",
    ux_mode: "redirect",
    redirect_uri: `${window.location.origin}/google-callback`, // http://localhost:5173/google-callback
    select_account: true,
    prompt: "select_account",
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
          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (retryCount >= MAX_RETRIES) {
                showError("Too many attempts. Please try again later or use manual login.");
                return;
              }
              if (!GOOGLE_CLIENT_ID) {
                showError("Google Sign-In is not configured properly. Please try manual login.");
                return;
              }
              try {
                console.log("Initiating Google OAuth with redirect mode");
                handleGoogleLogin();
                setRetryCount(prev => prev + 1);
              } catch (error) {
                showError("Failed to initiate Google Sign-In. Please try again.");
                console.error("Google login error:", error);
              }
            }}
            disabled={isLoading || retryCount >= MAX_RETRIES || !GOOGLE_CLIENT_ID}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="#34A853"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="#FBBC05"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="#EA4335"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
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