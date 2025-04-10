import React from "react";
//import { useNavigate } from "react-router-dom";
import "../components-styles/NavBar.css";

const NavBar = () => {
    //const navigate = useNavigate();
    
    return (
        <div className='nav-body'>
            <h1 className="nav-title">Nittany Business</h1>
            <div className="nav-content">
                <div className="links">
                    <a href="">Products</a>
                    <a href="">Profile</a>
                </div>
                <div className="search-div">
                    <h2> Find Product </h2>
                    <input
                        className="search"
                        type="text"
                        placeholder="Search..."
                    />
                </div>
            </div>
        </div>
    );
};

export default NavBar;