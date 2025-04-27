import React from "react";
import { useNavigate } from "react-router-dom";
import './pages-styles/Landing.css'
import landingImage from './pages-styles/images/landing-image.svg'

const Landing = () => {
    const navigate = useNavigate();

    return (
        <div className="landing-container">
            <div className="content-container">
                <div className="text-container">
                    <h4 id="sub-title">Smarter way to connect, procure, and grow</h4>
                    <h1 id="title">Nittany Businesses</h1>
                    <p id="body">NittanyBusiness is a modern online marketplace designed to simplify bulk ordering and streamline business transactions. Our platform bridges the gap between small and medium-sized enterprises (SMEs) and trusted suppliers, offering a reliable, user-friendly ecosystem built for efficiency, transparency, and growth. Whether you're sourcing materials or expanding your supply chain, NittanyBusiness empowers you to do business better.</p>

                    <div className="button-container">
                        <button id="login-button" onClick={() => navigate("/login")}>Sign In</button>
                        <button id="signup-button" onClick={() => navigate("/signup")}>Sign Up</button>
                    </div>
                </div>

                <div 
                    className="img-container"
                    style={{backgroundImage: `url(${landingImage})`}}
                />
            </div>
        </div>
    );
};

export default Landing;