import React, { useState, useEffect } from "react";
import axios from "axios";
import "../components-styles/OrderDisplay.css";
import ReviewCard from "./ReviewCard";
import { useUser } from './UserContext';


const OrderDisplay = ({ userType }) => {
    const [orders, setOrders] = useState([]);
    const [productNames, setProductNames] = useState({});
    const [message, setMessage] = useState("");
    const { userEmail } = useUser();
    const [loading, setLoading] = useState(true);
    const [reviews, setReviews] = useState({});
    const [showModal, setShowModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState(null);
    const handleReviewClick = async (order) => {
        if (order.reviewed) {
            try {
                const res = await axios.get("http://localhost:8080/get-review-by-order", {
                    params: { order_id: order.order_id }
                });
                if (res.data.review) {
                    setReviews(prev => ({
                        ...prev,
                        [order.order_id]: res.data.review
                    }));
                }
            } catch (err) {
                console.error("Failed to fetch existing review:", err);
            }
        }

        setSelectedOrder(order);
        setShowModal(true); // 👈 Only show modal AFTER review is loaded
    };



    const handleReviewSubmit = async (orderId) => {
        const { rate, review_desc } = reviews[orderId] || {};

        if (!rate || !review_desc) {
            alert("Please provide both a rating and a review description.");
            return;
        }

        try {
            await axios.post("http://localhost:8080/submit-review", {
                order_id: orderId,
                rate,
                review_desc
            });
            alert("Review submitted successfully!");

            // Mark the order as "reviewed" after success
            setOrders(prevOrders =>
                prevOrders.map(order =>
                    order.order_id === orderId ? { ...order, reviewed: true } : order
                )
            );

            setSelectedOrder(prev => prev ? { ...prev, reviewed: true } : null); // 🔥 Add this

            setReviews(prev => {
                const updated = { ...prev };
                delete updated[orderId];
                return updated;
            });

        } catch (err) {
            if (err.response?.status === 409) {
                alert("You have already submitted a review for this order.");
            } else {
                alert("Failed to submit review.");
                console.log(err)
            }
        }
    };

    useEffect(() => {
        const handleOrderFetch = async () => {
            setLoading(true);
            try {
                const res = await axios.get("http://localhost:8080/get-orders-by-type", {
                    params: { userEmail, userType }
                });
                const fetchedOrders = res.data.orders || [];

                // Fetch reviewed orders
                const reviewedRes = await axios.get("http://localhost:8080/get-reviewed-orders", {
                    params: { userEmail, userType }
                });
                const reviewedOrderIds = reviewedRes.data.reviewedOrderIds || [];

                // Merge: Mark reviewed:true for orders
                const ordersWithReviewStatus = fetchedOrders.map(order => ({
                    ...order,
                    reviewed: reviewedOrderIds.includes(order.order_id)
                }));

                setOrders(ordersWithReviewStatus);

                // Fetch product names
                const names = {};
                for (const order of ordersWithReviewStatus) {
                    try {
                        const productRes = await axios.get("http://localhost:8080/get-product-name", {
                            params: { listing_id: order.listing_id }
                        });
                        names[order.listing_id] = productRes.data.product.product_title + " " + productRes.data.product.product_name;
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
                    {userType !== "seller" && (
                        <p><strong>Seller:</strong> {order.seller_email}</p>
                    )}
                    {userType !== "buyer" && (
                        <p><strong>Buyer:</strong> {order.buyer_email}</p>
                    )}
                    <p><strong>Product:</strong> {productNames[order.listing_id] || "Loading..."}</p>
                    <p><strong>Quantity:</strong> {order.quantity}</p>
                    <p><strong>Total:</strong> ${order.payment}</p>
                    <p><strong>Date:</strong> {order.date}</p>
                    {userType !== "seller" && (
                        <button
                            style={{
                                marginTop: "15px",
                                marginBottom: "15px",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                backgroundColor: order.reviewed ? "gray" : "rgba(30,64,124)",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                            onClick={() => handleReviewClick(order)}
                        >
                            {order.reviewed ? "View Review" : "Leave Review"}
                        </button>
                    )}
                    {userType === "seller" && order.reviewed && (
                        <button
                            style={{
                                marginTop: "15px",
                                marginBottom: "15px",
                                padding: "8px 16px",
                                borderRadius: "8px",
                                backgroundColor: "gray",
                                color: "white",
                                border: "none",
                                cursor: "pointer",
                                fontWeight: "bold"
                            }}
                            onClick={() => handleReviewClick(order)}
                        >
                            View Review
                        </button>
                    )}

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
            <ReviewCard
                showModal={showModal}
                setShowModal={setShowModal}
                selectedOrder={selectedOrder}
                reviews={reviews}
                setReviews={setReviews}
                handleReviewSubmit={handleReviewSubmit}
            />
        </div>


    );
};

export default OrderDisplay;
