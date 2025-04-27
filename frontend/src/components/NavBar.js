import { React, useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";  // Import the useLocation hook
import "../components-styles/NavBar.css";
import { useUser } from "./UserContext";

const NavBar = () => {
    const location = useLocation();  // Get the current location (URL)
    const navigate = useNavigate();
    const { userEmail, setUserEmail } = useUser();

    const [show, setShow] = useState(true);
    const [lastScrollY, setLastScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => {
            const currentScrollY = window.scrollY;

            if (currentScrollY > lastScrollY && currentScrollY > 50) {
                setShow(false); // scrolling down
            } else {
                setShow(true); // scrolling up
            }

            setLastScrollY(currentScrollY);
        };

        window.addEventListener("scroll", handleScroll);

        return () => window.removeEventListener("scroll", handleScroll);
    }, [lastScrollY]);

    // Helper function to determine if the current tab is active
    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        setUserEmail(null);
        localStorage.removeItem('userEmail');
        navigate("/login");
    };

    return (
        <div className={`nav-body ${show ? "visible" : "hidden"}`}>
            <h1 className="nav-title">Nittany Business</h1>
            <div className="nav-content">
                <div className="links">
                    <a
                        href="/home"
                        className={isActive("/home") ? "active" : ""}
                    >
                        Products
                    </a>
                    <a
                        href="/profile"
                        className={isActive("/profile") ? "active" : ""}
                    >
                        Profile
                    </a>
                    {userEmail ? (
                        <>
                            <span style={{ paddingLeft: "10px", paddingRight: "10px", color: "white" }}>
                                Logged in as: <strong>{userEmail}</strong>
                            </span>
                            <button
                                onClick={handleLogout}
                                style={{
                                    backgroundColor: "transparent",
                                    color: "white",
                                    border: "1px solid white",
                                    borderRadius: "8px",
                                    padding: "5px 10px",
                                    fontWeight: "bold",
                                    cursor: "pointer",
                                    marginLeft: "10px"
                                }}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <button
                            onClick={() => navigate("/login")}
                            style={{
                                backgroundColor: "transparent",
                                color: "white",
                                border: "1px solid white",
                                borderRadius: "8px",
                                padding: "5px 10px",
                                fontWeight: "bold",
                                cursor: "pointer",
                                marginLeft: "10px"
                            }}
                        >
                            Login
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

export default NavBar;