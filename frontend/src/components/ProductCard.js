import React from "react";
import "../components-styles/ProductCard.css";
import { useUser } from "./UserContext";

const ProductCard = ({ reviewData, title, description, seller, image, price, onClick, status }) => {
    const { userEmail } = useUser();

    function ProductStatus(props) {
        if (seller.toLowerCase() !== userEmail.toLowerCase()) {
            return null
        }
        
        return (
            <h2 className="status">
                {props.pStatus ? "Active" : "Inactive"}     
            </h2>);
    }
    
    return (
        <div className="product-card-div" onClick={onClick}>
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
                        {reviewData?.average_rating ?? "-"}/5
                    </h2>
                    <h2 className="review-count">
                        ({reviewData?.total_reviews ?? "?"})
                    </h2>
                </div>
                <h2 className="price">
                    ${price}
                </h2>
                <ProductStatus pStatus={status}/>
            </div>
        </div>
    );
};

export default ProductCard;