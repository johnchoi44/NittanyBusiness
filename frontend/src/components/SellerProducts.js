import React, { useState, useEffect, useMemo } from "react";
import axios from "axios";
import "../components-styles/Products.css";
import ProductCard from "./ProductCard";
import placeholder from "../components-styles/images/nittanyicon.png";
import { useUser } from "./UserContext";

const SellerProducts = () => {
    const [data, setData] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sortOption, setSortOption] = useState("default");
    const [message, setMessage] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("default");
    const [reviews, setReviews] = useState({});
    const { userEmail } = useUser();

    useEffect(() => {
        const handleProductFetch = async () => {
            try {
                const res = await axios.get("http://localhost:8080/active-listings");
                setData(res.data.listings);
            } catch (err) {
                setMessage(err.response?.data?.message || "Error occurred.");
            }
        };

        handleProductFetch();
    }, []);

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
            case "product-reviews-high-low":
                if (reviews) {
                    sorted.sort((a, b) => reviews[b.listing_id]?.total_reviews - reviews[a.listing_id]?.total_reviews);
                }
                break;
            case "seller-reviews-high-low":
                if (reviews) {
                    sorted.sort((a, b) => reviews[b.listing_id]?.average_rating - reviews[a.listing_id]?.average_rating);
                }
                break;
            default:
                break;
        }
        setSortedData(sorted);
    }, [sortOption, data, reviews]);

    const uniqueParentCategories = useMemo(() => {
            const seen = new Set();
            return (categories || []).filter(cat => {
                if (seen.has(cat.parent_category)) return false;
                seen.add(cat.parent_category);
                return true;
            });
        }, [categories]);

    const getReviewCountForProduct = async (listing_id) => {
        try {
            const res = await axios.get("http://localhost:8080/reviewData", {
                params: { listing_id }
            });
            const reviewData = res.data.reviews?.[0] || { average_rating: null, total_reviews: 0 };
            return reviewData;
        } catch (err) {
            setMessage(err.response?.data?.message || "Error occurred.");
            return null;
        }
    };

    const displayData = useMemo(() => {
        let filtered = sortedData;

        if (selectedCategory !== "default") {
            filtered = filtered.filter(
                (product) => product.category.toLowerCase() === selectedCategory.toLowerCase()
            );
        }

        if (userEmail) {
            filtered = filtered.filter(
                (product) => product.seller_email.toLowerCase() === userEmail.toLowerCase()
            );
        }

        return filtered;
    }, [sortedData, selectedCategory]);

    useEffect(() => {
        async function fetchReviews() {
            const newReviews = {};
            for (const product of displayData) {
                const review = await getReviewCountForProduct(product.listing_id);
                newReviews[product.listing_id] = review;
            }
            setReviews(newReviews);
        }

        if (displayData.length > 0) {
            fetchReviews();
        }
    }, [displayData]);

    return (
        <div>
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
                                status={0}
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

export default SellerProducts;
