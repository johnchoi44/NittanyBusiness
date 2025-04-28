import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../components/UserContext";
import "./pages-styles/Profile.css";
import NavBar from "../components/NavBar";

const Profile = () => {
    const { userEmail, userType } = useUser();
    const [isSaved, setIsSaved] = useState(false);
    const [message, setMessage] = useState("");
    const [password, setPassword] = useState("");
    const [rawStreet, setRawStreet] = useState("");
    const [userInfo, setUserInfo] = useState({
        name: "",
        street_num: "",
        street_name: "",
        city: "",
        zipcode: "",
        state: "",
        // Buyer-only
        credit_card_num: "",
        card_type: "",
        expire_month: "",
        expire_year: "",
        security_code: "",
        // Seller-only
        bank_routing_number: "",
        bank_account_number: "",
        balance: ""
    });

    useEffect(() => {
        if (!userEmail || !userType) return;
        fetchUserInfo();
        setIsSaved(false);
    }, [userEmail, userType, isSaved]);

    const fetchUserInfo = async () => {
        try {
            const res = await axios.get("http://localhost:8080/user-info", {
                params: { email: userEmail, type: userType },
            });
            console.log(res.data);
            setUserInfo(res.data);
            setRawStreet(res.data.street_num + " " + res.data.street_name);
        } catch (err) {
            console.error("Failed to load user info:", err);
        }
    };

    const handleStreetBlur = () => {
        const trimmed = rawStreet.trim();
        const firstSpace = trimmed.indexOf(' ');
        const streetNum = firstSpace > 0 ? trimmed.slice(0, firstSpace) : trimmed;
        const streetName = firstSpace > 0 ? trimmed.slice(firstSpace + 1) : '';
        setUserInfo(prev => ({
            ...prev,
            street_num: streetNum,
            street_name: streetName,
        }));
        setRawStreet(trimmed); // normalize rawStreet
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        let formatted = value;

        if (name === "credit_card_num") {
            formatted = value
                .replace(/\D/g, "")
                .slice(0, 16)
                .match(/.{1,4}/g)
                ?.join("-") || "";
        }
        else if (name === "bank_routing_number") {
            const digits = value.replace(/\D/g, "").slice(0, 9);
            const parts = digits.match(/^(\d{1,4})(\d{1,4})?(\d{1})?$/);
            formatted = parts
                ? [parts[1], parts[2], parts[3]].filter(Boolean).join("-")
                : digits;
        }
        else if (name === "security_code") {
            formatted = value.replace(/\D/g, "").slice(0, 3);
        }

        console.log("CHANGE IN PROFILE: ", name, value);
        setUserInfo(prev => ({ ...prev, [name]: formatted }));
        console.log("AFTER CHANGE USER INFO: ", userInfo);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (userType === "buyer") {
            try {
                const res = await axios.put("http://localhost:8080/update-buyer", {
                    email: userEmail,
                    ...userInfo,
                    password,
                });
                setMessage(res.data.message);
            } catch (err) {
                setMessage(err.response?.data?.message || "Error occurred.");
            }
        }
        else {
            try {
                const res = await axios.put("http://localhost:8080/update-seller", {
                    email: userEmail,
                    ...userInfo,
                    password,
                });
                setMessage(res.data.message);
            } catch (err) {
                setMessage(err.response?.data?.message || "Error occurred.");
            }
        }

        setPassword(""); // Reset password
        setIsSaved(true);
    };

    return (
        <div className="profile-container">
            <NavBar />
            <div className="profile-overflow">
                <div className="profile-background" />

                <div className="profile-contents">
                    <div className="profile-box">
                        <div>
                            <p id="profile-title">{userInfo.name}</p>
                            <p id="profile-sub-title">{userEmail}</p>
                        </div>
                        <p />
                        <button id="profile-btn" type="submit" onClick={handleSubmit}>Save Changes</button>
                    </div>
                    <form className="profile-form">
                        <section className="profile-section">
                            <p className="profile-label">Password Information</p>
                            <p />
                            <p />

                            <div>
                                <p className="profile-sub-label">Password</p>
                                <input
                                    className="profile-input"
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Enter new password"
                                />
                            </div>
                        </section>

                        <section className="profile-section">
                            <p className="profile-label">Address Information</p>
                            <p />
                            <p />

                            <div>
                                <p className="profile-sub-label">Street</p>
                                <input
                                    className="profile-input"
                                    type="text"
                                    name="street"
                                    value={rawStreet}
                                    onChange={e => setRawStreet(e.target.value)}
                                    onBlur={handleStreetBlur}
                                />
                            </div>
                            <p />
                            <div>
                                <p className="profile-sub-label">City</p>
                                <input
                                    className="profile-input"
                                    type="text"
                                    name="city"
                                    value={userInfo.city}
                                    onChange={handleChange}
                                />
                            </div>

                            <div>
                                <p className="profile-sub-label">State</p>
                                <input
                                    className="profile-input"
                                    type="text"
                                    name="state"
                                    value={userInfo.state}
                                    onChange={handleChange}
                                />
                            </div>
                            <p />
                            <div>
                                <p className="profile-sub-label">Zipcode</p>
                                <input
                                    className="profile-input"
                                    type="number"
                                    name="zipcode"
                                    value={userInfo.zipcode}
                                    onChange={handleChange}
                                />
                            </div>
                        </section>

                        {userType === "buyer" && (
                            <section className="profile-section-card">
                                <p className="profile-label">Financial Information</p>
                                <p />
                                <p />
                                <p />
                                <p />

                                <div>
                                    <p className="profile-sub-label">Card Type</p>
                                    <select
                                        name="card_type"
                                        onChange={handleChange}
                                        required
                                    >
                                        <option value="" disabled> -- Select -- </option>
                                        <option value="master">Master</option>
                                        <option value="visa">Visa</option>
                                        <option value="discover">Discover</option>
                                        <option value="amex">American Express</option>
                                    </select>
                                </div>
                                <p />
                                <div>
                                    <p className="profile-sub-label">Credit Card Number</p>
                                    <input
                                        className="profile-input"
                                        name="credit_card_num"
                                        type="text"
                                        inputMode="numeric"
                                        value={userInfo.credit_card_num}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p />
                                <div>
                                    <p className="profile-sub-label">CVV</p>
                                    <input
                                        className="profile-input"
                                        name="security_code"
                                        value={userInfo.security_code}
                                        onChange={handleChange}
                                    />
                                </div>
                            </section>
                        )}

                        {userType === "seller" && (
                            <section className="profile-section-card">
                                <p className="profile-label">Financial Information</p>
                                <p />
                                <p />
                                <p />
                                <p />

                                <div>
                                    <p className="profile-sub-label">Routing Number</p>
                                    <input
                                        className="profile-input"
                                        name="bank_routing_number"
                                        value={userInfo.bank_routing_number}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p />
                                <div>
                                    <p className="profile-sub-label">Account Number</p>

                                    <input
                                        className="profile-input"
                                        name="bank_account_number"
                                        value={userInfo.bank_account_number}
                                        onChange={handleChange}
                                    />
                                </div>
                                <p />
                                <div>
                                    <p className="profile-sub-label">Balance</p>
                                    <input
                                        className="profile-input"
                                        name="balance"
                                        value={"$ " + String(userInfo.balance)}
                                        disabled
                                    />
                                </div>
                            </section>
                        )}
                        <div className="profile-spacer" />
                    </form>
                </div>
            </div>
        </div >
    );
};

export default Profile;