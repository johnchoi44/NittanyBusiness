import React from "react";
import "../components-styles/Search.css";

const Search = ({ searchTerm, setSearchTerm }) => {
    
    return (
        <div className="search-div">
            <h2> Find a Product </h2>
            <input
                className="search"
                type="text"
                placeholder="Search by name"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
    );
};

export default Search;