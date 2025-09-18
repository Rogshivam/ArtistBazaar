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

interface FormData {
  email: string;
  name: string;
  role: "Customer" | "Seller" | "Services";
  password: string;
  confirmPassword: string;
}

export default function Signup() {
  const { showSuccess, showError } = useAlert();
  const navigate = useNavigate();
  const API_URL = import.meta.env.VITE_API_URL as string; // e.g., http://localhost:4000
  const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID as string;

  const [formData, setFormData] = useState<FormData>({
    email: "",
    name: "",
    role: "Customer",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const MAX_RETRIES = 3;

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

  const validateInputs = () => {
    if (!formData.name.trim()) {
      showError("Please enter your name");
      return false;
    }
    if (!/^[a-zA-Z\s]+$/.test(formData.name)) {
      showError("Name must contain only letters and spaces");
      return false;
    }
    if (!formData.email.trim()) {
      showError("Please enter your email");
      return false;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      showError("Please enter a valid email address");
      return false;
    }
    if (formData.password.length < 6) {
      showError("Password must be at least 6 characters long");
      return false;
    }
    if (formData.password !== formData.confirmPassword) {
      showError("Passwords do not match");
      return false;
    }
    return true;
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

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

  const handleSignup = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);
    const endpoint = "/api/auth/signup";

    try {
      const response = await fetchWithRetry(`${API_URL}${endpoint}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({
          email: formData.email,
          name: formData.name,
          password: formData.password,
          role: formData.role,
        }),
        credentials: "include",
      });

      // Check if response is JSON
      const contentType = response.headers.get("content-type");
      if (!contentType || !contentType.includes("application/json")) {
        const text = await response.text();
        console.error("Non-JSON response:", text);
        throw new Error("Server returned a non-JSON response. Please check the API endpoint.");
      }

      const result = await response.json();

      if (response.ok) {
        showSuccess(result.message || "Account created successfully!");
        setFormData({
          email: "",
          name: "",
          role: "Customer",
          password: "",
          confirmPassword: "",
        });
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        showError(result.message || "Signup failed");
      }
    } catch (error: any) {
      showError(error.message || "Something went wrong. Please try again.");
      console.error("Signup error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignup = useGoogleLogin({
    onSuccess: async (credentialResponse) => {
      setIsLoading(true);
      try {
        const redirectUri = `${window.location.origin}/google-callback`;
        const response = await fetchWithRetry(`${API_URL}/api/auth/google/callback`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Accept": "application/json",
          },
          body: JSON.stringify({
            code: credentialResponse.code,
            role: formData.role,
            redirectUri,
          }),
          credentials: "include",
        });

        // Check if response is JSON
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
          localStorage.setItem("auth-role", json.user?.role || formData.role);
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
          showError(json.message || "Google signup failed");
        }
      } catch (error: any) {
        showError(`Google signup failed: ${error.message}`);
        console.error("Google signup error:", error);
      } finally {
        setIsLoading(false);
        setRetryCount(0);
      }
    },
    onError: (errorResponse) => {
      console.error("Google auth error:", errorResponse);
      showError("Google authentication failed. Please try again or use manual signup.");
      setIsLoading(false);
    },
    flow: "auth-code",
    scope: "openid profile email",
    ux_mode: "redirect",
    redirect_uri: `${window.location.origin}/google-callback`,
    extraParams: {
      prompt: "select_account", // 👈 correct way to force account chooser
    },
  });


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-orange-50 to-amber-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Create Your Account</CardTitle>
          <CardDescription>Join our community of artisans and customers</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="role">Account Type</Label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm"
              disabled={isLoading}
            >
              <option value="Customer">Customer</option>
              <option value="Seller">Seller (Artisan)</option>
              <option value="Services">Services Provider</option>
            </select>
          </div>

          <Button
            variant="outline"
            className="w-full"
            onClick={() => {
              if (retryCount >= MAX_RETRIES) {
                showError("Too many attempts. Please try again later or use manual signup.");
                return;
              }
              if (!GOOGLE_CLIENT_ID) {
                showError("Google Sign-In is not configured properly. Please try manual signup.");
                return;
              }
              try {
                console.log("Initiating Google OAuth with redirect mode");
                handleGoogleSignup();
                setRetryCount(prev => prev + 1);
              } catch (error) {
                showError("Failed to initiate Google Sign-In. Please try again.");
                console.error("Google signup error:", error);
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
            {isLoading ? "Processing..." : "Sign up with Google"}
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
            <Label htmlFor="name">Full Name</Label>
            <Input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter your full name"
              required
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
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
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password (min 6 characters)"
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

          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? "text" : "password"}
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                required
                disabled={isLoading}
              />
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className="absolute right-0 top-0 h-full px-3"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                disabled={isLoading}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <Button
            type="button"
            className="w-full"
            onClick={handleSignup}
            disabled={isLoading || retryCount >= MAX_RETRIES}
          >
            {isLoading ? "Creating Account..." : "Create Account"}
          </Button>

          <div className="text-center text-sm">
            <span className="text-muted-foreground">Already have an account? </span>
            <Link to="/login" className="text-primary hover:underline font-medium">
              Sign in
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}