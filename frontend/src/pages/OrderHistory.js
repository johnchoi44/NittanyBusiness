import React from "react";
import NavBar from "../components/NavBar";
import OrderDisplay from "../components/OrderDisplay";
import { useUser } from "../components/UserContext";

const OrderHistory = () => {
    const { userType } = useUser();
    console.log("Type in Hist: ", userType);

    return (
        <div>
            <NavBar />
            <OrderDisplay userType={userType}/>
        </div>
    );
};

export default OrderHistory;