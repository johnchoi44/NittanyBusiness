import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { useUser } from "./UserContext";
import "../components-styles/Login.css";

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
        <div className="login-container">
            <div className="login-side-bar">
                <h1 id="title">Sign In</h1>
                <div className="input-form">
                    <form onSubmit={handleLogin}>
                        <fieldset>
                            { message && <p className="error-label">&#9888; {message}</p> }
                    
                            <p className="form-label">Email</p>
                            <input
                                className="login-input"
                                type="email"
                                value={email}
                                placeholder="example@nittybiz.com"
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />

                            <p className="form-label">Password</p>
                            <input
                                className="login-input"
                                type="password"
                                placeholder="password"
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            
                            <div className="form-box">
                                <a id="form-link" href="/signup">Need to make an account?</a>
                                <button type="submit" id="submit-btn">Login</button>
                            </div>
                        </fieldset>
                    </form>
                </div>
            </div>
        </div>        
    );
};

export default Login;