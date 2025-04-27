import React, { useState, useEffect } from "react";
import axios from "axios";
import "../components-styles/NewProduct.css";
import "../components-styles/Products.css";
import "../components-styles/ProductDisplay.css";
import placeholder from "../components-styles/images/nittanyicon.png";
import back_img from "../components-styles/images/left-arrow.png";
import { useUser } from './UserContext';

const NewProduct = ({setNewProduct}) => {
    const [categories, setCategories] = useState([]);
    const [message, setMessage] = useState("");
    const [product_title, setProductTitle] = useState("");
    const [product_name, setProductName] = useState("");
    const [category, setCategory] = useState("Default");
    const [product_description, setProductDescription] = useState("");
    const [product_price, setProductPrice] = useState(0);  
    const { userEmail } = useUser();

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

    const handleSaveProduct = async () => {
        const status = 1;
        if (!product_title || !product_name || !category || !product_description || product_price <= 0) {
            setMessage("Please fill in all fields.");
            return;
        }
        if (category === "Default") {
            setMessage("Please select a valid category.");
            return;
        }
        if (product_price < 0) {
            setMessage("Price cannot be negative.");
            return;
        }
        if (product_price === 0) {
            setMessage("Price cannot be zero.");
            return;
        }
        setMessage(""); // Clear previous messages
        try {
            const res = await axios.post("http://localhost:8080/add-product", {
                userEmail,
                product_title,
                product_name,
                category,
                product_description,
                product_price,
                status
            });
            setMessage(res.data.message);
            setNewProduct(null); 
        } catch (err) {
            setMessage(err.response?.data?.message || "Error occurred.");
        }
    } 

    return (
        <div className="new-product-div">
            <div className="col">
                            <div className="row">
                                <img className="back" src={back_img} onClick={() => setNewProduct(null)} alt="Back"></img>
                                <div className="product-display">
                                    <img className="pimage" src={placeholder} alt="Product"></img>
                                </div>
                                <div className="product-display">
                                    <h3>Title:</h3>
                                    <input
                                        type="text"
                                        name="product_title"
                                        value={product_title}
                                        onChange={(e) => setProductTitle(e.target.value)}
                                        placeholder="Product Title"
                                        className="product_title"
                                    />
                                    <h3>Name:</h3>
                                    <input
                                        type="text"
                                        name="product_name"
                                        value={product_name}
                                        onChange={(e) => setProductName(e.target.value)}
                                        placeholder="Product Name"
                                        className="name"
                                    />
                                    <h3>Category:</h3>
                                    <select
                                        name="category"
                                        value={category}
                                        onChange={(e) => setCategory(e.target.value)}
                                        className="category-disp">
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
                                        value={product_description}
                                        onChange={(e) => setProductDescription(e.target.value)}
                                        placeholder="Product Description"
                                        className="product_description"
                                    />
                                    <h3>Price: </h3>
                                    <input
                                        type="number"
                                        name="product_price"
                                        value={product_price}
                                        onChange={(e) => setProductPrice(e.target.value)}
                                        placeholder="Price"
                                        className="product_price"
                                        step="1"
                                    />
                                    <div className="submit-div">
                                        <button className="submit-button" onClick={() => handleSaveProduct()}>
                                            SUBMIT CHANGES
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
        </div>
    );
}

export default NewProduct;