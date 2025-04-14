import React from "react";
import "../components-styles/Search.css";

const Search = () => {
    
    return (
        <div className="search-div">
            <h2> Find a Product </h2>
            <input
                className="search"
                type="text"
                placeholder="Search..."
            />
        </div>
    );
};

export default Search;