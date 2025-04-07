import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import "../App.css";

const SignUp = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [userType, setUserType] = useState("buyer"); // default user type is buyer
    const [message, setMessage] = useState("");
    const navigate = useNavigate();
    
    const handleSignUp = async (e) => {
        e.preventDefault();
        try {
            const res = await axios.post("http://localhost:8080/register", {
                email,
                password,
                user_type: userType,
            });
            setMessage(`Welcome ${res.data.user_type}! User ID: ${res.data.user_id}`);
            navigate("/");
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
                <select className="input" value={userType} onChange={(e) => setUserType(e.target.value)}>
                    <option value="buyer">Buyer</option>
                    <option value="seller">Seller</option>
                </select>
                <button className="login-btn" type="submit">Sign Up</button>
            </form>
            <p>{message}</p>
            <p>Already a member? <button onClick={() => navigate("/")}>Login</button></p>
        </div>
    );
};

export default SignUp;