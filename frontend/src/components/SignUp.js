import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import '../components-styles/LoginRegistration.css'

const SignUp = () => {
    const [userType, setUserType] = useState(""); // default user type is buyer
    const [isNext, setIsNext] = useState(false); // seller form navigation logic
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [businessName, setBusinessName] = useState("");
    const [address, setAddress] = useState("");
    const [city, setCity] = useState("");
    const [zipcode, setZipcode] = useState("");
    const [creditNum, setCreditNum] = useState("");
    const [expDate, setExpDate] = useState("");
    const [cvv, setCVV] = useState("");
    const [bankRoutingNum, setBankRoutingNum] = useState("");
    const [bankAccountNum, setBankAccountNum] = useState("");
    const [balance, setBalance] = useState("");

    const [message, setMessage] = useState("");
    const navigate = useNavigate();

    const handleNext = (e) => {
        e.preventDefault();
        setIsNext(true);
    };
    
    const handleCardInput = (e) => {
        let input = e.target.value;
        input = input.replace(/\D/g, '');
        input = input.slice(0, 16);
        input = input.match(/.{1,4}/g)?.join('-') || '';
        setCreditNum(input);
    };

    const handleCVV = (e) => {
        let input = e.target.value;
        input = input.slice(0,3);
        setCVV(input);
    };

    const handleRoutingInput = (e) => {
        let input = e.target.value;
        input = input.replace(/\D/g, '');
        input = input.slice(0, 9);
        input = input.match(/^(\d{0,4})(\d{0,4})(\d{0,1})$/);
        if (input) {
            input = [input[1], input[2], input[3]].filter(Boolean).join('-');
        } else {
            input = '';
        }
        setBankRoutingNum(input);
    };
    

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
            <div className="page-container">
                <div className="side-bar">
                    
                    {userType === "buyer" ? (
                        <>
                        {isNext ? (
                            // Second buyer form
                            <div className="input-form">
                                <button id="back-btn" onClick={() => setIsNext(false)}>&#8592;</button>
                                <form onSubmit={handleSignUp}>
                                    <p className="form-title">Buyer Financial Info</p>
                                    <fieldset>
                                        <div className="form-select">
                                            <p className="form-label">Select Card Type</p>
                                            <select>
                                                <option value="master">Master</option>
                                                <option value="visa">Visa</option>
                                                <option value="discover">Discover</option>
                                                <option value="amex">American Express</option>
                                            </select>
                                        </div>

                                        <p className="form-label">Credit Card Number</p>
                                        <input 
                                            type="text" 
                                            value={creditNum} 
                                            placeholder="Credit Card Number" 
                                            onChange={handleCardInput} 
                                            required 
                                        />

                                        <p className="form-label">Expiration Date</p>
                                        <input 
                                            type="month" 
                                            value={expDate} 
                                            onChange={(e) => setExpDate(e.target.value)} 
                                            required 
                                        />

                                        <p className="form-label">CVV</p>
                                        <input 
                                            type="number" 
                                            value={cvv} 
                                            placeholder="CVV" 
                                            onChange={handleCVV} 
                                            required 
                                        />

                                        <button type="submit" id="submit-btn">Submit</button>
                                    </fieldset>
                                </form>
                            </div>
                        ) : (
                            // First buyer form
                            <div className="input-form">
                            <button id="back-btn" onClick={() => setUserType("")}>&#8592;</button>
                            <p className="form-title">Buyer Sign Up</p>
                            <form onSubmit={handleNext}>
                                <fieldset>
                                    <p className="form-label">Email</p>
                                    <input 
                                        type="email" 
                                        value={email} 
                                        placeholder="example@nittybiz.com" 
                                        onChange={(e) => setEmail(e.target.value)} 
                                        required
                                    />

                                    <p className="form-label">Password</p>
                                    <input 
                                        type="password"
                                        value={password} 
                                        placeholder="Password" 
                                        onChange={(e) => setPassword(e.target.value)} 
                                        required
                                    />

                                    <p className="form-label">Business Name</p>
                                    <input 
                                        type="text" 
                                        value={businessName}
                                        placeholder="Business Name" 
                                        onChange={(e) => setBusinessName(e.target.value)} 
                                        required
                                    />

                                    <p className="form-label">Street Address</p>
                                    <input 
                                        type="text" 
                                        value={address} 
                                        placeholder="Street Address" 
                                        onChange={(e) => setAddress(e.target.value)} 
                                        required
                                    />

                                    <p className="form-label">City</p>
                                    <input 
                                        type="text" 
                                        value={city} 
                                        placeholder="City" 
                                        onChange={(e) => setCity(e.target.value)} 
                                        required
                                    />

                                    <p className="form-label">Zipcode</p>
                                    <input 
                                        type="number" 
                                        value={zipcode} 
                                        placeholder="Zipcode" onChange={(e) => setZipcode(e.target.value)} 
                                        required
                                    />

                                    <button type="submit" id="submit-btn">Next</button>
                                </fieldset>
                            </form>
                        </div>
                        )}
                        </>

                    ) : userType === "seller" ? (
                        <>
                        {isNext ? (
                            // Second seller form
                            <div className="input-form">
                                <button id="back-btn" onClick={() => setIsNext(false)}>&#8592;</button>
                                <p className="form-title">Seller Bank Info</p>
                                <form onSubmit={handleSignUp}>
                                    <fieldset>
                                        <p className="form-label">Bank Routing Number</p>
                                        <input
                                            type="text"
                                            value={bankRoutingNum}
                                            placeholder="xxxx-xxxx-x"
                                            onChange={handleRoutingInput}
                                            required
                                        />

                                        <p className="form-label">Bank Account Number</p>
                                        <input
                                            type="text"
                                            value={bankAccountNum}
                                            placeholder="8-digit account number"
                                            maxLength={8}
                                            onChange={(e) => {
                                            const input = e.target.value.replace(/\D/g, '').slice(0,8); // Only digits, max 8
                                            setBankAccountNum(input);
                                            }}
                                            required
                                        />

                                        <p className="form-label">Current Balance</p>
                                        <input
                                            type="number"
                                            value={balance}
                                            placeholder="Balance"
                                            step="0.01"
                                            onChange={(e) => setBalance(e.target.value)}
                                            required
                                        />

                                        <button type="submit" id="submit-btn">Submit</button>
                                    </fieldset>
                                </form>
                            </div>
                        ) : (
                            // First seller form
                            <div className="input-form">
                            <button id="back-btn" onClick={() => setUserType("")}>&#8592;</button>
                                <form onSubmit={handleNext}>
                                    <p className="form-title">Seller Sign Up</p>
                                    <fieldset>
                                        <p className="form-label">Email</p>
                                        <input 
                                            type="email" 
                                            value={email} 
                                            placeholder="example@nittybiz.com" 
                                            onChange={(e) => setEmail(e.target.value)} 
                                            required
                                        />

                                        <p className="form-label">Password</p>
                                        <input 
                                            type="password" 
                                            value={password} 
                                            placeholder="Password" 
                                            onChange={(e) => setPassword(e.target.value)} 
                                            required
                                        />

                                        <p className="form-label">Business Name</p>
                                        <input 
                                            type="text" 
                                            value={businessName} 
                                            placeholder="Business Name" 
                                            onChange={(e) => setBusinessName(e.target.value)} 
                                            required
                                        />

                                        <p className="form-label">Street Address</p>
                                        <input 
                                            type="text" 
                                            value={address} 
                                            placeholder="Street Address" 
                                            onChange={(e) => setAddress(e.target.value)} 
                                            required
                                        />

                                        <p className="form-label">City</p>
                                        <input 
                                            type="text" 
                                            value={city} 
                                            placeholder="City" 
                                            onChange={(e) => setCity(e.target.value)} 
                                            required
                                        />

                                        <p className="form-label">Zipcode</p>
                                        <input 
                                            type="number" 
                                            value={zipcode} 
                                            placeholder="Zipcode" 
                                            onChange={(e) => setZipcode(e.target.value)} 
                                            required
                                        />

                                        <button type="submit" id="submit-btn">Next</button> 
                                    </fieldset>
                                </form>
                            </div>
                        )}
                        </>

                    ) : (
                        // User type selection button
                        <div id="user-type-form">
                            <h1 id="title">Sign Up as ...</h1>
                            <button className="role-btn" onClick={() => setUserType("buyer")}>Buyer</button>
                            <button className="role-btn" onClick={() => setUserType("seller")}>Seller</button>
                            <a id="form-link" href="/login">Already a member?</a>
                        </div>
                    )}

                </div>
            </div>
    );
};

export default SignUp;