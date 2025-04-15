import React from "react";
import "../components-styles/ProductCard.css";

const ProductCard = ({ title, description, seller, image, price }) => {
    
    return (
        <div className="product-card-div">
            <img className="image" src={image}>
            </img>
            <div className="meta-data-div">
                <h1 className="title">
                    {title}
                </h1>
                <h2 className="description">
                    {description}
                </h2>
                <h2 className="seller">
                    Seller: {seller}
                </h2>
                <div className="rating-div">
                    <h2 className="star-logo">
                        ★
                    </h2>
                    <h2 className="rating">
                        4.5/5
                    </h2>
                    <h2 className="review-count">
                        (15)
                    </h2>
                </div>
                <h2 className="price">
                    ${price}
                </h2>
            </div>
        </div>
    );
};

export default ProductCard;