import "../App.css";
import NavBar from "../components/NavBar";
import NewProduct from "../components/NewProduct";
import SellerProducts from "../components/SellerProducts";

const Product = () => {
    
    return (
        <div className="page-div">
            <NavBar />
            <SellerProducts />
        </div>
    );
};

export default Product;