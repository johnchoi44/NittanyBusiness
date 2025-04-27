import React from "react";

const renderStars = (count) => {
    const stars = [];
    for (let i = 0; i < 5; i++) {
        stars.push(
            <span key={i} style={{ color: i < count ? "gold" : "#ccc", fontSize: "24px" }}>
                ★
            </span>
        );
    }
    return stars;
};

const ReviewCard = ({
    showModal,
    setShowModal,
    selectedOrder,
    reviews,
    setReviews,
    handleReviewSubmit
}) => {
    if (!showModal || !selectedOrder) return null;

    const orderId = selectedOrder.order_id;

    return (
        <div style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.5)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000
        }}>
            <div style={{
                background: "white",
                padding: "30px",
                borderRadius: "12px",
                width: "400px",
                maxHeight: "80vh",
                overflowY: "auto"
            }}>
                <h2>{selectedOrder.reviewed ? "Your Review" : "Leave a Review"}</h2>

                <div style={{ marginBottom: "10px" }}>
                    <label>Rating (1-5): </label>
                    {selectedOrder.reviewed ? (
                        <div style={{ marginTop: "5px" }}>
                            {renderStars(reviews[orderId]?.rate)}
                        </div>
                    ) : (
                        <input
                            type="number"
                            min="1"
                            max="5"
                            value={reviews[orderId]?.rate || ""}
                            onChange={(e) => setReviews(prev => ({
                                ...prev,
                                [orderId]: {
                                    ...(prev[orderId] || {}),
                                    rate: e.target.value
                                }
                            }))}
                        />
                    )}
                </div>


                <div style={{ marginBottom: "10px" }}>
                    <label>Review:</label>
                    <textarea
                        rows="4"
                        cols="40"
                        value={reviews[orderId]?.review_desc || ""}
                        disabled={selectedOrder.reviewed}
                        onChange={(e) => setReviews(prev => ({
                            ...prev,
                            [orderId]: {
                                ...(prev[orderId] || {}),
                                review_desc: e.target.value
                            }
                        }))}
                    />
                </div>

                {!selectedOrder.reviewed && (
                    <button
                        style={{
                            padding: "10px 20px",
                            backgroundColor: "rgba(30,64,124)",
                            color: "white",
                            border: "none",
                            borderRadius: "8px",
                            cursor: "pointer",
                            marginRight: "10px"
                        }}
                        onClick={async () => {
                            await handleReviewSubmit(orderId);
                            setShowModal(false);
                        }}
                    >
                        Submit Review
                    </button>
                )}
                <button
                    style={{
                        padding: "10px 20px",
                        backgroundColor: "gray",
                        color: "white",
                        border: "none",
                        borderRadius: "8px",
                        cursor: "pointer"
                    }}
                    onClick={() => setShowModal(false)}
                >
                    Close
                </button>
            </div>
        </div>
    );
};

export default ReviewCard;
