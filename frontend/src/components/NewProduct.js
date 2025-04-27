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
    const [pTitle, setPtitle] = useState("");
    const [pName, setPname] = useState("");
    const [pCategory, setPcategory] = useState("Default");
    const [pDescription, setPdescription] = useState("");
    const [pPrice, setPprice] = useState(0);  
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
        if (!pTitle || !pName || !pCategory || !pDescription || pPrice <= 0) {
            setMessage("Please fill in all fields.");
            return;
        }
        if (pCategory === "Default") {
            setMessage("Please select a valid category.");
            return;
        }
        if (pPrice < 0) {
            setMessage("Price cannot be negative.");
            return;
        }
        if (pPrice === 0) {
            setMessage("Price cannot be zero.");
            return;
        }
        setMessage(""); // Clear previous messages
        try {
            const res = await axios.post("http://localhost:8080/add-product", {
                userEmail,
                pTitle,
                pName,
                pCategory,
                pDescription,
                pPrice
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
                                        value={pTitle}
                                        onChange={(e) => setPtitle(e.target.value)}
                                        placeholder="Product Title"
                                        className="ptitle"
                                    />
                                    <h3>Name:</h3>
                                    <input
                                        type="text"
                                        name="product_name"
                                        value={pName}
                                        onChange={(e) => setPname(e.target.value)}
                                        placeholder="Product Name"
                                        className="name"
                                    />
                                    <h3>Category:</h3>
                                    <select
                                        name="category"
                                        value={pCategory}
                                        onChange={(e) => setPcategory(e.target.value)}
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
                                        value={pDescription}
                                        onChange={(e) => setPdescription(e.target.value)}
                                        placeholder="Product Description"
                                        className="pdescription"
                                    />
                                    <h3>Price: </h3>
                                    <input
                                        type="number"
                                        name="product_price"
                                        value={pPrice}
                                        onChange={(e) => setPprice(e.target.value)}
                                        placeholder="Price"
                                        className="pprice"
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