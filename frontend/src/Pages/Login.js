import React, { useState } from "react";
import "./Login.css";
import carImage from "../images/login-car.jpg";
import logo from "../images/logo.png";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [submitting, setSubmitting] = useState(false);

    const validateEmail = (value) => {
        if (!value) return "Email is required.";
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return "Please enter a valid email address.";
        return "";
    };

    const validatePassword = (value) => {
        if (!value) return "Password is required.";
        if (value.length < 8) return "Password must be at least 8 characters.";
        return "";
    };

    const getCookie = (name) => {
        const matches = document.cookie.match(new RegExp(
            "(?:^|; )" + name.replace(/([.$?*|{}()[\]\\/+^])/g, '\\$1') + "=([^;]*)"
        ));
        return matches ? decodeURIComponent(matches[1]) : undefined;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        console.log("Email:", email, "Password:", password);
        setError("");

        const emailError = validateEmail(email);
        const passwordError = validatePassword(password);

        if (emailError || passwordError) {
            setError(emailError || passwordError);
            setSubmitting(false);
            return;
        }
        else {
            setSubmitting(true);
        }


        const payload = {
            email: email.trim(),
            password: password,
        };

        console.log("Prepared payload for API:", payload); 

        const endpoint = "/api/login/";

        try {
            const headers = {
                "Content-Type": "application/json",
                "Accept": "application/json",
                "X-Requested-With": "XMLHttpRequest",
            };
            const csrftoken = getCookie("csrftoken");
            if (csrftoken) headers["X-CSRFToken"] = csrftoken;

            const res = await fetch(endpoint, {
                method: "POST",
                headers,
                body: JSON.stringify(payload),
                credentials: "include", 
            });

            if (res.ok) {
                const data = await res.json().catch(() => ({}));

                if (data.token) {
                    sessionStorage.setItem("authToken", data.token);
                }

                window.location.href = data.redirect || "/dashboard";
                return;
            }
             if (res.status === 400 || res.status === 401) {
                const errData = await res.json().catch(() => null);
                const message = errData?.detail || errData?.error || errData?.message || "Invalid email or password.";
                setError(message);
            } else {
                setError("Server error. Please try again later.");
            }
        } catch (err) {
            console.error("Login request failed:", err);
            setError("Network error. Please check your connection and try again.");
        } finally {
            setSubmitting(false);
        }

    };

    return (
        <div className="login-page">
            <div className="login-left">
                <div className="login-header">
                    <img src={logo} alt="Royal Auto Logo" className="login-logo" />
                    <h2>Royal Auto – Staff Login</h2>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    <h3>Login</h3>

                    {error && <div className="form-error" role="alert">{error}</div>}

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        aria-invalid={!!validateEmail(email)}
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                        aria-invalid={!!validatePassword(password)}
                    />

                    <div className="remember">
                        <label className="switch">
                            <input type="checkbox" id="remember" />
                            <span class="slider round"></span>
                        </label>
                        <label className="remember-label" htmlFor="remember">Remember me</label>
                    </div>
                    <button type="submit" disabled={!submitting}>{submitting ? "Signing in..." : "SIGN IN"}</button>
                </form>
            </div>


            <div className="login-right">
                <img src={carImage} alt="Car" />
            </div>
        </div>
    );
}

export default Login;
