import React, { useState, useEffect } from "react";
import "./Login.css";
import carImage from "../images/login-car.jpg";
import logo from "../images/logo.png";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  // -----------------------------
  // AUTO‑REDIRECT IF ALREADY LOGGED IN
  // -----------------------------
  useEffect(() => {
    const token =
        localStorage.getItem("authToken") ||
        sessionStorage.getItem("authToken");

    if (token) {
      window.location.href = "/customer-dashboard";
    }
  }, []);

  // -----------------------------
  // VALIDATORS
  // -----------------------------
  const validateEmail = (value) => {
    if (!value) return "Email is required.";
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(value)) return "Enter a valid email.";
    return "";
  };

  const validatePassword = (value) => {
    if (!value) return "Password is required.";
    if (value.length < 8) return "Password must be at least 8 characters.";
    return "";
  };

  // -----------------------------
  // HELPER FUNCTIONS
  // -----------------------------

  // SIMPLE, BABEL-FRIENDLY COOKIE READER
  const getCookie = (name) => {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) {
      return parts.pop().split(";").shift();
    }
    return null;
  };

  const clearOldAuthStorage = () => {
    localStorage.removeItem("authToken");
    sessionStorage.removeItem("authToken");
    localStorage.removeItem("user");
    sessionStorage.removeItem("user");
  };

  // -----------------------------
  // LOGIN SUBMIT
  // -----------------------------
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    const emailErr = validateEmail(email);
    const passErr = validatePassword(password);

    if (emailErr || passErr) {
      setError(emailErr || passErr);
      return;
    }

    setSubmitting(true);

    const payload = {
      email: email.trim(),
      password,
    };

    try {
      const headers = {
        "Content-Type": "application/json",
        Accept: "application/json",
      };

      const csrftoken = getCookie("csrftoken");
      if (csrftoken) headers["X-CSRFToken"] = csrftoken;

      const res = await fetch("/api/login/", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data = await res.json();

        const user =
            data.employee || data.user || data.staff || data.admin || null;

        const storage = rememberMe ? localStorage : sessionStorage;

        clearOldAuthStorage();

        if (data.token) storage.setItem("authToken", data.token);
        if (user) storage.setItem("user", JSON.stringify(user));

        const goTo = data.redirect || "/customer-dashboard";
        window.location.href = goTo;
        return;
      }

      if (res.status === 400 || res.status === 401) {
        const errorData = await res.json();
        setError(
            errorData?.detail ||
            errorData?.error ||
            errorData?.message ||
            "Invalid email or password."
        );
      } else {
        setError("Server error. Please try again later.");
      }
    } catch (err) {
      console.error("Login failed:", err);
      setError("Network error. Check connection and try again.");
    } finally {
      setSubmitting(false);
    }
  };

  // -----------------------------
  // RENDER
  // -----------------------------
  return (
      <div className="login-page">
        <div className="login-left">
          <div className="login-header">
            <img src={logo} alt="Royal Auto" className="login-logo" />
            <h2>Royal Auto – Login</h2>
          </div>

          <form className="login-form" onSubmit={handleSubmit}>
            <h3>Login</h3>

            {error && (
                <div className="form-error" role="alert">
                  {error}
                </div>
            )}

            <label>Email</label>
            <input
                type="email"
                placeholder="Email"
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  if (error) setError("");
                }}
            />

            <label>Password</label>
            <input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  if (error) setError("");
                }}
            />

            <div className="remember">
              <label className="switch">
                <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                />
                <span className="slider round"></span>
              </label>
              <label className="remember-label">Remember me</label>
            </div>

            <button type="submit" disabled={submitting}>
              {submitting ? "Signing in..." : "SIGN IN"}
            </button>
          </form>
        </div>

        <div className="login-right">
          <img src={carImage} alt="Car" />
        </div>
      </div>
  );
}

export default Login;
