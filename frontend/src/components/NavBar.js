import { React, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";  // Import the useLocation hook
import "../components-styles/NavBar.css";

const NavBar = () => {
    const location = useLocation();  // Get the current location (URL)

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
                </div>
            </div>
        </div>
    );
};

export default NavBar;