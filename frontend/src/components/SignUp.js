import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    
    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8080/register", {
                email,
                password,
            });
            setMessage(`Welcome ${res.data.user_type}! User ID: ${res.data.user_id}`);
            navigate("/login");
        } catch (err) {
            setMessage(err.response?.data?.message || "Error occurred.");
        }
    };
    
    return (
        <div className='loginCard'>
            <h1 className='loginTitle'>NittanyBusiness</h1>
            <form className="loginDiv" onSubmit={handleSignUp}>
            <h2 className="prompt">Sign Up</h2>
                <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button className="login-btn" type="submit">Sign Up</button>
            </form>
            <p>{message}</p>
            <p>Already a member? <button onClick={() => navigate("/login")}>Login</button></p>
        </div>
    );
};

export default SignUp;