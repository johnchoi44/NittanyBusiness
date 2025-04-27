import React, { useState, useEffect } from "react";
import axios from "axios";
import "../components-styles/OrderDisplay.css";
import { useUser } from './UserContext';

const OrderDisplay = ({ userType }) => {
    const [orders, setOrders] = useState([]);
    const [productNames, setProductNames] = useState({});
    const [message, setMessage] = useState("");
    const { userEmail } = useUser();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const handleOrderFetch = async () => {
            setLoading(true);
            try {
                const res = await axios.get("http://localhost:8080/get-orders-by-type", {
                    params: { userEmail, userType }
                });
                const fetchedOrders = res.data.orders || [];
                setOrders(fetchedOrders);

                // Fetch product names for each listing_id
                const names = {};
                for (const order of fetchedOrders) {
                    try {
                        const productRes = await axios.get("http://localhost:8080/get-product-name", {
                            params: { listing_id: order.listing_id }
                        });
                        names[order.listing_id] = productRes.data.product.product_name;
                    } catch (productErr) {
                        console.error("Error fetching product name:", productErr);
                        names[order.listing_id] = "Unknown Product";
                    }
                }
                setProductNames(names);

            } catch (err) {
                setMessage(err.response?.data?.message || "Error occurred.");
            }
            setLoading(false);
        };

        if (userEmail && userType) {
            handleOrderFetch();
        }
    }, [userEmail, userType]);

    let orderCards = [];

    if (!loading && orders.length > 0) {
        for (let i = 0; i < orders.length; i++) {
            const order = orders[i];
            orderCards.push(
                <div key={i} className="order-card">
                    <p><strong>Order ID:</strong> {order.order_id}</p>
                    <p><strong>Seller:</strong> {order.seller_email}</p>
                    <p><strong>Buyer:</strong> {order.buyer_email}</p>
                    <p><strong>Product:</strong> {productNames[order.listing_id] || "Loading..."}</p>
                    <p><strong>Quantity:</strong> {order.quantity}</p>
                    <p><strong>Total:</strong> ${order.payment}</p>
                    <p><strong>Date:</strong> {order.date}</p>
                </div>
            );
        }
    }

    return (
        <div className="orders-div">
            {userType === "seller" ? 
            <h1>Recent Purchases of Your Products:</h1> :
            <h1>Your Recent Purchases</h1>}
            <hr />
            <div className="orders">
                {loading ? <p>Loading orders...</p> : (orderCards.length > 0 ? orderCards : <p>No orders found.</p>)}
            </div>
        </div>
    );
};

export default OrderDisplay;
