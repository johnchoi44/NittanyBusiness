import React from "react";
import { useUser } from "../components/UserContext.js";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import "./pages-styles/OrderReview.css"
import NavBar from "../components/NavBar.js";

const OrderConfirmation = () => {
    const { state } = useLocation();
    const navigate = useNavigate();

    if (!state?.order) {
        console.log("Error: cannot retrieve order details.");
        navigate("/", { replace: true });
        return null;
    }

    const { order } = state; // getting order details

    const handleConfirm = () => {
        navigate("/order-checkout", { state: { order: order } });
    };

    return (
        <>
            <NavBar />
            <div className="order-confirmation-container">
                <div className="order-preview-container">

                    <button id="order-back-btn" onClick={() => navigate(-1)}>&#8592; Need more time?</button>

                    <h1 id="order-review-title">Review Your Order</h1>
                    
                    <div className="divider" />
                    
                    <div className="item-container">
                        <p className="item-label">Item</p>
                        <p className="item-label">Quantity</p>
                        <p className="item-label">Unit Price</p>


                        <p>{order.product_title}</p>
                        <p>{order.quantity}</p>
                        <p>${order.unit_price}</p>

                        <p /><p /><p />

                        <p />
                        <p className="item-label">Total</p>
                        <p>${order.total_price.toFixed(2)}</p>
                    </div>

                    <button id="check-out-btn" onClick={handleConfirm}>Secure Checkout</button>
                </div>
            </div>
        </>
    );
};

export default OrderConfirmation;