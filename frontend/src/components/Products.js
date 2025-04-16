import React, { useState, useEffect } from "react";
import axios from "axios";
import "../components-styles/Products.css";
import ProductCard from "./ProductCard";
import placeholder from "../components-styles/images/nittanyicon.png"
import Search from "./Search";
import { useMemo } from "react";

const Products = () => {
    const [data, setData] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [sortOption, setSortOption] = useState("default");
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredData, setFilteredData] = useState([]);

    // Fetch products only when the component mounts
    useEffect(() => {
        const handleProductFetch = async () => {
            try {
                const res = await axios.get("http://localhost:8080/active-listings");
                setData(res.data.listings);  // Assuming response contains the listings array
            } catch (err) {
                setMessage(err.response?.data?.message || "Error occurred.");
            }
        };

        // perform fetch
        handleProductFetch();
    }, []);  // Empty dependency array means this will run once when the component mounts

    // Update sorted data whenever the sort option or original data changes
    useEffect(() => {
        const sorted = [...data];
        switch (sortOption) {
            case "price-low-high":
                sorted.sort((a, b) => parseFloat(a.product_price.replace(/[^0-9.-]+/g,"")) - parseFloat(b.product_price.replace(/[^0-9.-]+/g,"")));
                break;
            case "price-high-low":
                sorted.sort((a, b) => parseFloat(b.product_price.replace(/[^0-9.-]+/g,"")) - parseFloat(a.product_price.replace(/[^0-9.-]+/g,"")));
                break;
            case "alphabetical-a-z":
                sorted.sort((a, b) => a.product_title.localeCompare(b.product_title));
                break;
            case "alphabetical-z-a":
                sorted.sort((a, b) => b.product_title.localeCompare(a.product_title));
                break;
            // Placeholder for review-based sorting
            case "product-reviews-high-low":
                break;
            case "seller-reviews-high-low":
                // Add logic here if you have review data
                break;
            default:
                break;
        }
        setSortedData(sorted);

    }, [sortOption, data]);

    const displayData = useMemo(() => {
        if (searchTerm.trim() === "") return sortedData;
    
        return sortedData.filter(product =>
            product.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_name.toLowerCase().includes(searchTerm.toLowerCase())
        );
    }, [searchTerm, sortedData]);
    
    return (
        <div>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            <div className="products-div">
                <div className="sorting-div">
                    <h3 className="sort-prompt">Category</h3>
                    <select
                        className="sort-options"
                        id="category-options"
                        name="category">
                        {/* Add category options here */}
                        <option value="default">Default</option>
                    </select>
                    <h3 className="sort-prompt">Sort By</h3>
                    <select 
                        className="sort-options" 
                        id="sorting-options" 
                        name="sort"
                        value={sortOption}
                        onChange={(e) => setSortOption(e.target.value)}>
                        <option value="default">Default</option>
                        <option value="price-low-high">Price: Low to High</option>
                        <option value="price-high-low">Price: High to Low</option>
                        <option value="alphabetical-a-z">Alphabetical: A-Z</option>
                        <option value="alphabetical-z-a">Alphabetical: Z-A</option>
                        <option value="product-reviews-high-low">Avg. Product Reviews</option>
                        <option value="seller-reviews-high-low">Avg. Seller Reviews</option>
                    </select>
                </div>
                <div className="product-cards-div">
                {displayData.length > 0 ? (
                        displayData.map((product, index) => (
                            <ProductCard
                                key={index}
                                title={product.product_title}
                                description={product.product_description}
                                seller={product.seller_email}
                                image={placeholder}
                                price={product.product_price}
                            />
                        ))
                    ) : (
                        <p className="loading">Loading...</p>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Products;