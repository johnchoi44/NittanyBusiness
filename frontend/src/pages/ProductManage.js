import React from "react";
import NavBar from "../components/NavBar";
import ProductDisplay from "../components/ProductDisplay";
import "./pages-styles/ProductManage.css"

const ProductManage = () => {

    return (
        <div className="product-manage-container">
            <NavBar />
            <ProductDisplay />
        </div>
    );
};

export default ProductManage;