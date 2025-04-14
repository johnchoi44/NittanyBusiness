import "../App.css";
import NavBar from "../components/NavBar";
import Search from "../components/Search";
import Products from "../components/Products";

const Home = () => {
    
    return (
        <div className="page-div">
            <NavBar />
            <Search />
            <Products />
        </div>
    );
};

export default Home;