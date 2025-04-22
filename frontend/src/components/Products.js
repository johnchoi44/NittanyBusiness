import React, { useState, useEffect } from "react";
import axios from "axios";
import "../components-styles/Products.css";
import ProductCard from "./ProductCard";
import placeholder from "../components-styles/images/nittanyicon.png"
import Search from "./Search";
import { useMemo } from "react";

const Products = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [sortOption, setSortOption] = useState("default");
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("default");
    const [reviews, setReviews] = useState({});

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


    // Fetch categories only when the component mounts
    useEffect(() => {
        const handleCategoryFetch = async () => {
            try {
                const res = await axios.get("http://localhost:8080/categories");
                setCategories(res.data.categories);  // Assuming response contains categories array
            } catch (err) {
                setMessage(err.response?.data?.message || "Error occurred.");
            }
        };

        // perform fetch
        handleCategoryFetch();
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
                if (reviews) {
                    sorted.sort((a, b) => reviews[b.listing_id].total_reviews - reviews[a.listing_id].total_reviews);
                }
            case "seller-reviews-high-low":
                if (reviews) {
                    sorted.sort((a, b) => reviews[b.listing_id].average_rating - reviews[a.listing_id].average_rating);
                }
            default:
                break;
        }
        setSortedData(sorted);

    }, [sortOption, data]);

    // function for calling api to retrieve review data
    const getReviewCountForProduct = async (listing_id) => {
        try {
            const res = await axios.get("http://localhost:8080/reviewData", {
                params: { listing_id }
            });
            // Grab the first review from the array
            const reviewData = res.data.reviews?.[0] || { average_rating: null, total_reviews: 0 };

            return reviewData;
        } catch (err) {
            setMessage(err.response?.data?.message || "Error occurred.");
            return null;
        }
    };
    

    // filter out duplicate categories for display
    const uniqueParentCategories = useMemo(() => {
        const seen = new Set();
        return (categories || []).filter(cat => {
            if (seen.has(cat.parent_category)) return false;
            seen.add(cat.parent_category);
            return true;
        });
    }, [categories]);

    // apply all filtering to finalize display data
    const displayData = useMemo(() => {
        let filtered = sortedData;
      
        // apply category filter
        if (selectedCategory !== "default") {
          filtered = filtered.filter(
            (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
          );
        }
      
        // apply search filter
        if (searchTerm.trim() !== "") {
          filtered = filtered.filter((product) =>
            product.product_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.product_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            product.seller_email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }
      
        return filtered;
      }, [searchTerm, sortedData, selectedCategory]);

    // fetch reviews for products
    useEffect(() => {
        async function fetchReviews() {
            const newReviews = {};
            for (const product of displayData) {
                const review = await getReviewCountForProduct(product.listing_id);
                newReviews[product.listing_id] = review;
                console.log(newReviews[product.listing_id])
            }
            setReviews(newReviews);
        }
    
        if (displayData.length > 0) {
            fetchReviews();
        }
    }, [displayData]);
    
    return (
        <div>
            <Search searchTerm={searchTerm} setSearchTerm={setSearchTerm}/>
            <div className="products-div">
                <div className="sorting-div">
                    <h3 className="sort-prompt">Category</h3>
                    <select
                        className="sort-options"
                        id="category-options"
                        name="category"
                        value={selectedCategory}
                        onChange={(e) => setSelectedCategory(e.target.value)}>
                        {/* Add category options here */}
                        <option value="default">Default</option>
                        {(uniqueParentCategories || []).map((category, index) => (
                            <option value={category.parent_category}>{category.parent_category}</option>
                        ))}
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
                        <option value="product-reviews-high-low"># Reviews</option>
                        <option value="seller-reviews-high-low">Avg. Rating</option>
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
                                reviewData={reviews[product.listing_id]}
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