import React, { useState } from "react";
import "./Login.css";
import carImage from "../images/login-car.jpg";
import logo from "../images/logo.png";

function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    const handleSubmit = (e) => {
        e.preventDefault();
        console.log("Email:", email, "Password:", password);
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

                    <label>Email</label>
                    <input
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                    />

                    <label>Password</label>
                    <input
                        type="password"
                        placeholder="Password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />

                    <div className="remember">
                        <label className="switch">
                            <input type="checkbox" id="remember" />
                            <span class="slider round"></span>
                        </label>
                        <label className="remember-label" htmlFor="remember">Remember me</label>
                    </div>
                    <button type="submit">SIGN IN</button>
                </form>
            </div>


            <div className="login-right">
                <img src={carImage} alt="Car" />
            </div>
        </div>
    );
}

export default Login;
