import React, { useState, useEffect } from "react";
import axios from "axios";
import { useUser } from "./UserContext";
import { useNavigate } from "react-router-dom";

const Helpdesk = () => {
    const { userEmail, setUserEmail } = useUser();
    const navigate = useNavigate();

    const [searchEmail, setSearchEmail] = useState("");
    const [searchedUser, setSearchedUser] = useState(null);
    const [pendingRequests, setPendingRequests] = useState([]);
    const [filteredRequests, setFilteredRequests] = useState([]);
    const [showOnlyMyRequests, setShowOnlyMyRequests] = useState(false);
    const [error, setError] = useState("");
    const [successMessage, setSuccessMessage] = useState("");

    useEffect(() => {
        fetchPendingRequests();
    }, []);

    const fetchPendingRequests = async () => {
        try {
            const res = await axios.get("http://localhost:8080/helpdesk/pending-requests");
            setPendingRequests(res.data.requests);
            setFilteredRequests(res.data.requests); // Initially show all
        } catch (err) {
            setError("Failed to load pending requests");
        }
    };

    const handleSearch = async () => {
        try {
            const res = await axios.get(`http://localhost:8080/helpdesk/user?email=${searchEmail}`);
            setSearchedUser(res.data.user);
            setError("");
            setSuccessMessage("");
        } catch (err) {
            setSearchedUser(null);
            setError(err.response?.data?.message || "Error occurred.");
        }
    };

    const handleUserTypeChange = async (newType) => {
        try {
            await axios.post("http://localhost:8080/helpdesk/update-user", {
                email: searchedUser.email,
                new_user_type: newType
            });
            setSuccessMessage("User updated successfully");
            setError("");
            setSearchedUser({ ...searchedUser, user_type: newType });
        } catch (err) {
            setError("Failed to update user");
            setSuccessMessage("");
        }
    };

    const handleRequestStatusChange = async (request_id, newStatus) => {
        try {
            await axios.post("http://localhost:8080/helpdesk/update-request-status", {
                request_id,
                new_status: newStatus
            });
            setSuccessMessage("Request status updated successfully");
            fetchPendingRequests(); // Refresh list
        } catch (err) {
            setError("Failed to update request status");
        }
    };

    const handleShowMyRequests = () => {
        setFilteredRequests(pendingRequests.filter(req => req.helpdesk_staff_email === userEmail));
        setShowOnlyMyRequests(true);
    };

    const handleShowAllRequests = () => {
        setFilteredRequests(pendingRequests);
        setShowOnlyMyRequests(false);
    };

    const handleLogout = () => {
        setUserEmail(null);
        localStorage.removeItem('userEmail');
        navigate("/");
    };

    return (
    <div style={{ padding: "20px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h1>Helpdesk Admin Dashboard</h1>
            <div>
                <p>Logged in as: <strong>{userEmail}</strong></p>
                <button onClick={handleLogout}>Logout</button>
            </div>
        </div>

        {error && <p style={{ color: "red" }}>{error}</p>}
        {successMessage && <p style={{ color: "green" }}>{successMessage}</p>}

            {/* --- User Management Section --- */}
            <section style={{ marginBottom: "40px" }}>
                <h2>User Management</h2>
                <input
                    type="text"
                    placeholder="Enter user email"
                    value={searchEmail}
                    onChange={(e) => setSearchEmail(e.target.value)}
                    style={{ marginRight: "10px" }}
                />
                <button onClick={handleSearch}>Search</button>

                {searchedUser && (
                    <div style={{ marginTop: "20px", padding: "10px", border: "1px solid gray", borderRadius: "8px" }}>
                        <h3>User Found:</h3>
                        <p>Email: {searchedUser.email}</p>
                        <p>Current Type: {searchedUser.user_type}</p>

                        <label>Change User Type: </label>
                        <select
                            value={searchedUser.user_type}
                            onChange={(e) => handleUserTypeChange(e.target.value)}
                        >
                            <option value="buyer">Buyer</option>
                            <option value="seller">Seller</option>
                            <option value="helpdesk">Helpdesk</option>
                            <option value="admin">Admin</option>
                        </select>
                    </div>
                )}
            </section>

            {/* --- Pending Requests Section --- */}
            <section>
                <h2>Pending Requests</h2>
                <div style={{ marginBottom: "10px" }}>
                    {!showOnlyMyRequests ? (
                        <button onClick={handleShowMyRequests}>Show My Requests</button>
                    ) : (
                        <button onClick={handleShowAllRequests}>Show All Requests</button>
                    )}
                </div>

                {filteredRequests.length > 0 ? (
                    <ul>
                        {filteredRequests.map((req) => (
                            <li key={req.request_id} style={{ marginBottom: "15px" }}>
                                <strong>Request ID:</strong> {req.request_id} <br />
                                <strong>Email:</strong> {req.sender_email} <br />
                                <strong>Assigned Staff:</strong> {req.helpdesk_staff_email || "Unassigned"} <br />
                                <strong>Description:</strong> {req.request_desc} <br />
                                <strong>Status:</strong> {req.request_status} <br />
                                <label>Update Status: </label>
                                <select onChange={(e) => handleRequestStatusChange(req.request_id, e.target.value)} defaultValue={req.request_status}>
                                    <option value="Pending">Pending</option>
                                    <option value="Resolved">Resolved</option>
                                    <option value="Closed">Closed</option>
                                </select>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>No pending requests.</p>
                )}
            </section>
        </div>
    );
};

export default Helpdesk;
