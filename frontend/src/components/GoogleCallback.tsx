// src/components/GoogleCallback.tsx
import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAlert } from "../context/alert/AlertContext";

export default function GoogleCallback() {
  const navigate = useNavigate();
  const location = useLocation();
  const { showError } = useAlert();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const code = params.get("code");
    if (code) {
      // Trigger the same logic as handleGoogleSignup onSuccess
      fetch(`${import.meta.env.VITE_API_URL}/google/callback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ code, role: "Customer" }), // Adjust role as needed
        credentials: "include",
      })
        .then(async (response) => {
          const json = await response.json();
          return { response, json };
        })
        .then(({ response, json }) => {
          if (response.ok) {
            localStorage.setItem("auth-token", json.authToken || "");
            localStorage.setItem("refresh-token", json.refreshToken || "");
            localStorage.setItem("auth-role", json.user?.role || "Customer");
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
          } else {
            showError(json.message || "Google authentication failed");
            navigate("/signup");
          }
        })
        .catch((error) => {
          showError("Google authentication failed: " + error.message);
          navigate("/signup");
        });
    } else {
      showError("No authorization code received");
      navigate("/signup");
    }
  }, [navigate, showError, location]);

  return <div>Processing Google authentication...</div>;
}