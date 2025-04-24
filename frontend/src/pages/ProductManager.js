import "../App.css";
import NavBar from "../components/NavBar";
import NewProduct from "../components/NewProduct";
import SellerProducts from "../components/SellerProducts";

const Product = () => {
    
    return (
        <div className="page-div">
            <NavBar />
            {/* added to account for navbar margin*/}
            <div style={{marginTop: "60px"}}> 
                <SellerProducts />
            </div>
        </div>
    );
};

export default Product;