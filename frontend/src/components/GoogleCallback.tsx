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

    if (!code) {
      showError("No authorization code received");
      navigate("/signup");
      return;
    }

    // ✅ make sure API matches backend
    fetch(`${import.meta.env.VITE_API_URL}/api/auth/google/callback`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({ code }), // ✅ don't hardcode role here
      credentials: "include",
    })
      .then(async (response) => {
        const json = await response.json();
        return { response, json };
      })
      .then(({ response, json }) => {
        if (response.ok) {
          // store tokens and user data
          localStorage.setItem("auth-token", json.authToken || "");
          localStorage.setItem("refresh-token", json.refreshToken || "");
          localStorage.setItem("auth-role", json.user?.role || "Customer");
          localStorage.setItem("user-data", JSON.stringify(json.user || {}));

          // ✅ MongoDB usually sends `_id`, not `id`
          const userId = json.user?._id || json.user?.id;

          if (json.user?.role === "Seller") {
            localStorage.setItem("sellerId", userId || "");
            navigate(`/seller/${userId}`);
          } else if (json.user?.role === "Admin") {
            navigate("/admin");
          } else if (json.user?.role === "Services") {
            navigate(`/services/${userId}`);
          } else {
            navigate(`/customer/${userId}`);
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
  }, [navigate, showError, location]);

  return <div>Processing Google authentication...</div>;
}
