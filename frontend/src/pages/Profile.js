import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "../components/UserContext";
import "./pages-styles/Profile.css";
import NavBar from "../components/NavBar";

const Profile = () => {
    const { userEmail, userType } = useUser();
    const [isEdit, setIsEdit] = useState(false);
    const [password, setPassword] = useState("");
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
    });

    useEffect(() => {
        if (!userEmail || !userType) return;
        fetchUserInfo();
    }, [userEmail, userType]);

    const fetchUserInfo = async () => {
        try {
            const res = await axios.get("http://localhost:8080/user-info", {
                params: { email: userEmail, type: userType },
            });
            console.log(res.data);
            setUserInfo(res.data);
        } catch (err) {
            console.error("Failed to load user info:", err);
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setUserInfo((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        // DB updating end point call here (; need to create one in server.js)
        console.log("Would send update:", { ...userInfo, password });
    };


    return (
        <div className="profile-container">
            <NavBar />
            <div className="profile-background" />

            <div className="profile-contents">
                <div className="profile-box">
                    <div>
                        <p id="profile-title">{userInfo.name}</p>
                        <p id="profile-sub-title">{userEmail}</p>
                    </div>
                    <p />
                    <button id="profile-btn" type="submit">Save Changes</button>
                </div>

                <form className="profile-form" onSubmit={handleSubmit}>

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
                                placeholder={userInfo.street_name}
                                onChange={handleChange}
                            />
                        </div>
                        <p />
                        <div>
                            <p className="profile-sub-label">City</p>
                            <input
                                className="profile-input"
                                type="text"
                                name="city"
                                placeholder={userInfo.city}
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
                                placeholder={userInfo.zipcode}
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
                                    name="credit_card"
                                    placeholder={userInfo.credit_card_num}
                                    onChange={handleChange}
                                />
                            </div>
                            <p />
                            <div>
                                <p className="profile-sub-label">CVV</p>
                                <input
                                    className="profile-input"
                                    name="credit_card"
                                    placeholder={userInfo.security_code}
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
                                    placeholder={userInfo.bank_routing_number}
                                    onChange={handleChange}
                                />
                            </div>
                            <p />
                            <div>
                                <p className="profile-sub-label">Account Number</p>

                                <input
                                    className="profile-input"
                                    name="bank_account_number"
                                    placeholder={userInfo.bank_account_number}
                                    onChange={handleChange}
                                />
                            </div>
                            <p />
                            <div>
                                <p className="profile-sub-label">Balance</p>
                                <input
                                    className="profile-input"
                                    name="balance"
                                    value={String(userInfo.balance)}
                                    disabled
                                />
                            </div>
                        </section>
                    )}
                </form>
            </div>

        </div >
    );
};

export default Profile;