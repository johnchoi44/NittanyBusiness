import React from "react";
import "../components-styles/ProductCard.css";
import placeholder from "../components-styles/images/nittanyicon.png"

const Products = () => {
    
    return (
        <div className="product-card-div">
            <img className="image" src={placeholder}>
            </img>
            <div className="meta-data-div">
                <h1 className="title">
                    Place Holder Title
                </h1>
                <h2 className="description">
                    Place Holder Description of the product being displayed. Could contain any info about the product.
                </h2>
                <h2 className="seller">
                    Seller: Placeholder
                </h2>
                <div className="rating-div">
                    <h2 className="star-logo">
                        ★
                    </h2>
                    <h2 className="rating">
                        4.5/5
                    </h2>
                </div>
                <h2 className="price">
                    $23.99
                </h2>
            </div>
        </div>
    );
};

export default Products;