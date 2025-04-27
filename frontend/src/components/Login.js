import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";
import { useUser } from "./UserContext";

const Login = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    const { setUserEmail, setUserType } = useUser();
    
    const handleLogin = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8080/login", {
                email,
                password,
            });
            setUserEmail(res.data.email); // set username globally
            setUserType(res.data.user_type); // set usertype globally

            if (res.data.user_type === "helpdesk") {
                navigate("/helpdesk");
            } else {
                navigate("/home");
            }
        } catch (err) {
            setMessage(err.response?.data?.message || "Error occurred.");
        }
    };
    
    return (
        <div className='loginCard'>
            <h1 className='loginTitle'>NittanyBusiness</h1>
            <form className="loginDiv" onSubmit={handleLogin}>
            <h2 className="prompt">Login</h2>
                <input className="input" type="email" placeholder="Email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                <input className="input" type="password" placeholder="Password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                <button className="login-btn" type="submit">Login</button>
            </form>
            <p>{message}</p>
            <p>Not a member yet? <button onClick={() => navigate("/signup")}>Sign Up</button></p>
        </div>
    );
};

export default Login;