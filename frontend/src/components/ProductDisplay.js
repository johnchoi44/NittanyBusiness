import React, { useState, useEffect } from "react";
import axios from "axios";
import "../components-styles/Products.css";
import "../components-styles/ProductDisplay.css";
import ProductCard from "./ProductCard";
import placeholder from "../components-styles/images/nittanyicon.png";
import back_img from "../components-styles/images/left-arrow.png";
import NewProduct from "./NewProduct";
import { useMemo } from "react";
import { useUser } from './UserContext';


// component specifically for sellers to manage their products
const ProductDisplay = () => {
    const [data, setData] = useState([]);
    const [categories, setCategories] = useState([]);
    const [sortedData, setSortedData] = useState([]);
    const [sortOption, setSortOption] = useState("default");
    const [message, setMessage] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedCategory, setSelectedCategory] = useState("default");
    const [categoryHierarchy, setCategoryHierarchy] = useState([]);
    const [reviews, setReviews] = useState({});
    const [activeProduct, setActiveProduct] = useState(null);
    const [activeReviews, setActiveReviews] = useState([]);
    const { userEmail } = useUser();
    const [newProduct, setNewProduct] = useState(null)
    // for tracking product changes
    const [productData, setProductData] = useState(null);

    // Fetch products only when the component mounts
    useEffect(() => {
        const handleProductFetch = async () => {
            try {
                const res = await axios.get("http://localhost:8080/listings-for-seller", {
                    params: { userEmail }
                });
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

            try {
                const res = await axios.get("http://localhost:8080/category-hierarchy");
                setCategoryHierarchy(res.data);  // Assuming response contains categories array
                console.log(res.data);
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
            const res = await axios.get("http://localhost:8080/review-data", {
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

    // function for calling api to retrieve review data
    const getReviews = async (listing_id) => {
        try {
            const res = await axios.get("http://localhost:8080/reviews", {
                params: { listing_id }
            });
            // Grab results
            const reviews = res.data.reviews;

            return reviews;
        } catch (err) {
            setMessage(err.response?.data?.message || "Error occurred.");
            return null;
        }
    };

    // handle product value edits
    const handleChange = (e) => {
        const { name, value } = e.target;
        setProductData((prevData) => {
            const newData = {
                ...prevData,
                [name]: value,
            };
            console.log("New Product Data:");
            console.log(newData); // Log the updated data immediately
            return newData;
        });
    };

    // handle save button click
    const handleSaveChanges = async () => {
        const listing_id = activeProduct.listing_id;
        try {
            await axios.put(`http://localhost:8080/update-product/`, {
                listing_id: activeProduct.listing_id,
                ...productData
            });
            alert("Product updated successfully!");
        } catch (error) {
            console.error("Error updating product:", error);
            alert("Failed to update product.");
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
              (product) => categoryHierarchy[selectedCategory].includes(product.category)
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
            }
            setReviews(newReviews);
        }
    
        if (displayData.length > 0) {
            fetchReviews();
        }
    }, [displayData]);

    // card click handler
    async function handleCardClick(product) {
        setActiveProduct(product);
        setNewProduct(null);
        setProductData({
            product_title: product.product_title || "",
            product_name: product.product_name || "",
            category: product.category || "",
            product_description: product.product_description || "",
            seller_email: product.seller_email || "",
            product_price: product.product_price || "",
            status: product.status || "",
        });
        // fetch reviews for active product
        const reviews = await getReviews(product.listing_id);
        setActiveReviews(reviews);
    };

    // new product click handler
    const handleNewProductClick = () => {
        setNewProduct(true)
    }

    // back click handler
    const handleBackClick = () => {
        // clear active product and active reviews
        setNewProduct(null)
        setActiveProduct(null);
        setActiveReviews([]);
    }
    
    return (
        <div className="product-display-container">
            <div className="title-div">
                <h1 className="manage-products">Manage Your Products</h1>
                <button className="product-button" onClick={() => handleNewProductClick()}>Add an item</button>
            </div>
            {newProduct !== null && <NewProduct setNewProduct={setNewProduct}/>}
            {activeProduct === null ? 
            ( 
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
                                <option key={index} value={category.parent_category}>{category.parent_category}</option>
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
                                    category={product.category}
                                    description={product.product_description}
                                    seller={product.seller_email}
                                    image={placeholder}
                                    price={product.product_price}
                                    reviewData={reviews[product.listing_id]}
                                    onClick={() => handleCardClick(product)}
                                />
                            ))
                        ) : (
                            <p className="loading">Loading...</p>
                        )}
                    </div>
                </div>
            </div>
            ) : (
            // Other Render Option: Specific Product Page
            <div className="col">
                <div className="row">
                    <img className="back" src={back_img} onClick={() => handleBackClick()} alt="Back"></img>
                    <div className="product-display">
                        <img className="pimage" src={placeholder} alt="Product"></img>
                    </div>
                    <div className="product-display">
                        <h3>Title:</h3>
                        <input
                            type="text"
                            name="product_title"
                            value={productData.product_title}
                            onChange={handleChange}
                            placeholder="Product Title"
                            className="ptitle"
                        />
                        <h3>Name:</h3>
                        <input
                            type="text"
                            name="product_name"
                            value={productData.product_name}
                            onChange={handleChange}
                            placeholder="Product Name"
                            className="name"
                        />
                        <h3>Category:</h3>
                        <select
                            name="category"
                            value={productData.category}
                            onChange={handleChange}
                            className="category-disp"
                        >
                            <option value="">Select a Category</option>
                            {categories.map((category, index) => (
                                <option key={index} value={category.parent_category}>
                                    {category.parent_category}
                                </option>
                            ))}
                        </select>
                        <h3>Description:</h3>
                        <textarea
                            name="product_description"
                            value={productData.product_description}
                            onChange={handleChange}
                            placeholder="Product Description"
                            className="pdescription"
                        />
                        <h2 className="pseller">
                            Seller: {activeProduct.seller_email}
                        </h2>
                        <div className="prating-div">
                            <h2 className="pstar-logo">
                                ★
                            </h2>
                            <h2 className="prating">
                                {reviews[activeProduct.listing_id]?.average_rating ?? "-"}/5
                            </h2>
                            <h2 className="preview-count">
                                ({reviews[activeProduct.listing_id]?.total_reviews ?? "?"})
                            </h2>
                        </div>
                        <h3>Price: </h3>
                        <input
                            type="number"
                            name="product_price"
                            value={productData.product_price}
                            onChange={handleChange}
                            placeholder="Price"
                            className="pprice"
                            step="1"
                        />
                        <h3>Active: </h3>
                        <select
                            name="status"
                            value={productData.status}
                            onChange={handleChange}
                            className="active"
                        >
                            <option value="0">0</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                        </select>
                        <div className="submit-change-div">
                            <button className="submit-changes-button" onClick={() => handleSaveChanges()}>
                                SUBMIT CHANGES
                            </button>
                        </div>
                        
                    </div>
                </div>
                <div className="reviews-div">
                    <h1>Buyer Feedback:</h1>
                    <hr />
                    {activeReviews && activeReviews.length > 0 ? 
                        (
                        activeReviews.map((review, index) => (
                            <div className="review-data-div" key={index}>
                                <h2 className="review-star">{"★".repeat(review.rate)}</h2>
                                <p className="review-desc">{review.review_desc}</p>
                            </div>
                            ))
                        ) : (
                        <h2>No Reviews Yet</h2>
                    )}
                </div>
            </div>
            )}
        </div>
    );
};

export default ProductDisplay;