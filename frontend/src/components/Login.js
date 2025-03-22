import React, { useState } from "react";
import axios from "axios";
import "../App.css";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8080/login", {
                email,
                password,
            });
            setMessage(`Welcome ${res.data.user_type}! User ID: ${res.data.user_id}`);
        } catch (err) {
            setMessage(err.response?.data?.message || "Error occurred.");
        }
    };
    
    return (
        <div>
            <form className="loginDiv" onSubmit={handleLogin}>
            <h2 className="prompt">Login</h2>
                <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button className="login-btn" type="submit">Login</button>
            </form>
            <p>{message}</p>
        </div>
    );
};

export default Login;