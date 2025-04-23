import "../App.css";
import NavBar from "../components/NavBar";
import Products from "../components/Products";

const Home = () => {
    
    return (
        <div className="page-div">
            <NavBar />
            <Products />
        </div>
    );
};

export default Home;