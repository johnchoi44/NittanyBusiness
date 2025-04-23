import "../App.css";
import NavBar from "../components/NavBar";
import Search from "../components/Search";
import Products from "../components/Products";

const Product = () => {
    
    return (
        <div className="page-div">
            <NavBar />
            <Products />
        </div>
    );
};

export default Product;