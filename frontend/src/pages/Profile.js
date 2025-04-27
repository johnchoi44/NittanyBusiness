import "../App.css";
import NavBar from "../components/NavBar";
import OrderDisplay from "../components/OrderDisplay"
import React, { useState, useEffect } from "react";
import axios from "axios";
import "../components-styles/Products.css";
import { useUser } from '../components/UserContext';
import ProductDisplay from "../components/ProductDisplay";

const Profile = () => {
    const [userType, setUserType] = useState([]);
    const [message, setMessage] = useState("");
    const { userEmail } = useUser();

    // fetch user type when component mounts
    useEffect(() => {
        const handleUserTypeFetch = async () => {
            console.log("USER EMAIL: ", userEmail);
            try {
                const res = await axios.get("http://localhost:8080/get-user-type", {
                    params: { userEmail }
                });
                setUserType(res.data.roles[0]); 
                console.log("User Roles: ", res.data.roles);
            } catch (err) {
                setMessage(err.response?.data?.message || "Error occurred.");
            }
        };

        // perform fetch
        handleUserTypeFetch();
    }, []);  // Empty dependency array means this will run once when the component mounts
    
    return (
        <div className="page-div">
            <NavBar />
            {/* {userType.length > 0 && ( */}
            <OrderDisplay userType={userType} />
            {/* )} */}
            {userType === 'seller' ?
            <ProductDisplay /> :
            <div></div>
            }
        </div>
    );
};

export default Profile;