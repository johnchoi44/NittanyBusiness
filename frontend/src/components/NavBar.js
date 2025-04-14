import { React, useEffect, useState } from "react";
//import { useNavigate } from "react-router-dom";
import "../components-styles/NavBar.css";

const NavBar = () => {
    //const navigate = useNavigate();

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
    
    return (
        <div className={`nav-body ${show ? "visible" : "hidden"}`}>
            <h1 className="nav-title">Nittany Business</h1>
            <div className="nav-content">
                <div className="links">
                    <a href="/home">Products</a>
                    <a href="/profile">Profile</a>
                </div>
            </div>
        </div>
    );
};

export default NavBar;