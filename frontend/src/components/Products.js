import React from "react";
import "../components-styles/Products.css";
import ProductCard from "./ProductCard";

const Products = () => {
    
    return (
        <div className="products-div">
            <div className="sorting-div">
                <h3 className="sort-prompt">Sort By</h3>
                <select className="sort-options" id="sorting-options" name="sort">
                    <option value="price-low-high">Price: Low to High</option>
                    <option value="price-high-low">Price: High to Low</option>
                    <option value="alphabetical-a-z">Alphabetical: A-Z</option>
                    <option value="alphabetical-z-a">Alphabetical: Z-A</option>
                    <option value="product-reviews-high-low">Avg. Product Reviews</option>
                    <option value="seller-reviews-high-low">Avg. Seller Reviews</option>
                </select>
            </div>
            <div className="product-cards-div">
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
                <ProductCard />
            </div>
        </div>
    );
};

export default Products;