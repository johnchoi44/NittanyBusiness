import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { useUser } from "../components/UserContext";
import "./pages-styles/Checkout.css";
import NavBar from "../components/NavBar";

const CheckOut = () => {
    const navigate = useNavigate();
    const { state } = useLocation();
    const { userEmail } = useUser();

    const [cards, setCards] = useState([]);
    const [useNew, setUseNew] = useState(false);
    const [selectedCard, setSelectedCard] = useState("");
    const [cardType, setCardType] = useState("");
    const [creditNum, setCreditNum] = useState("");
    const [expDate, setExpDate] = useState("");
    const [cvv, setCVV] = useState("");
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (!state?.order) {
            navigate("/home", { replace: true });
            return null;
        }
        fetchCreditCardInfo();
    }, [navigate, state, userEmail]);

    if (!state?.order) return null;

    const { date, listing_id, seller_email, buyer_email, product_title, unit_price, quantity, total_price } = state.order;

    const fetchCreditCardInfo = async () => {
        try {
            const res = await axios.get("http://localhost:8080/credit-cards", {
                params: { owner_email: userEmail }
            });
            
            setCards(res.data.cards || []);
            if (res.data.cards.length > 0) {
                setSelectedCard(res.data.cards[0].credit_card_num);
                console.log("Credit card info fetched successfully")
            } else {
                setUseNew(true);
            } 
        } catch (err) {
            setMessage("Error: failed to load credit card information.");
        }
    };

    const handleClick = () => {
        setUseNew(prev => !prev);
    }

    const handleCardInput = (e) => {
        let input = e.target.value;
        input = input.replace(/\D/g, '');
        input = input.slice(0, 16);
        input = input.match(/.{1,4}/g)?.join('-') || '';
        setCreditNum(input);
    };

    const handleCVV = (e) => {
        let input = e.target.value;
        input = input.slice(0,3);
        setCVV(input);
    };
    
    const handleConfirm = async (e) => {
        e?.preventDefault();
        // build credit_card object either from saved or from form
        const credit_card = useNew
            ? {
                credit_card_num: creditNum.replace(/-/g, ""),
                card_type: cardType,
                expire_month: expDate.split("-")[1],
                expire_year: expDate.split("-")[0],
                security_code: cvv,
            }
            : { credit_card_num: selectedCard };

        try {
            await axios.post("http://localhost:8080/checkout", {
            seller_email,
            listing_id,
            buyer_email: userEmail,
            date: new Date().toISOString().slice(0, 10),
            quantity,
            payment: total_price,
            credit_card,
            });
            navigate("/order-management");
        } catch (err) {
            setMessage(err.response?.data?.error || "Checkout failed");
        }
    };

    return (
        <>
        <NavBar />
        <div className="checkout-container">
            <div className="order-preview-container"> 
                <button id="order-back-btn" onClick={() => navigate(-1)}>&#8592;</button>

                <h1 id="order-review-title">Select Your Payment Method</h1>

                <div className="divider" />

                <div className="payment-list-container">
                    {cards.length > 0 && !useNew && (
                        <div className="card-radio-container">
                            <p>Saved Credit Card</p>

                            {cards.map((c) => (
                                <label key={c.credit_card_num} className="card-radio-option">
                                    <input
                                    type="radio"
                                    name="card"
                                    value={c.credit_card_num}
                                    checked={selectedCard === c.credit_card_num}
                                    onChange={(e) => setSelectedCard(e.target.value)}
                                    />
                                    {c.card_type} ••••{c.credit_card_num.slice(-4)}
                                </label>
                            ))}
                        </div>
                    )}
                    
                    <button id="new-btn" onClick={handleClick}>Use New Credit Card</button>
                    {useNew && (
                        <div>
                            <form onSubmit={handleConfirm}>
                                <fieldset>
                                    <div className="form-select">
                                        <p className="form-label">Select Card Type</p>
                                        <select
                                            value={cardType}
                                            onChange={e => setCardType(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled> -- Select -- </option>
                                            <option value="master">Master</option>
                                            <option value="visa">Visa</option>
                                            <option value="discover">Discover</option>
                                            <option value="amex">American Express</option>
                                        </select>
                                    </div>

                                    <p className="form-label">Credit Card Number</p>
                                    <input 
                                        type="text" 
                                        value={creditNum} 
                                        placeholder="Credit Card Number" 
                                        onChange={handleCardInput} 
                                        required 
                                    />

                                    <p className="form-label">Expiration Date</p>
                                    <input 
                                        type="month" 
                                        value={expDate} 
                                        onChange={(e) => setExpDate(e.target.value)} 
                                        required 
                                    />

                                    <p className="form-label">CVV</p>
                                    <input 
                                        type="number" 
                                        value={cvv} 
                                        placeholder="CVV" 
                                        onChange={handleCVV} 
                                        required 
                                    />

                                    <button type="submit" id="submit-btn">Save</button>
                                </fieldset>
                            </form>
                        </div>
                    )}
                </div>


                    
                <div className="divider" />
                <div className="item-container">
                    <p className="item-label">Total Due</p>
                    <p />
                    <p>${total_price}</p>
                </div>

                {!useNew && cards.length > 0 && (
                    <button className="confirm-btn" onClick={handleConfirm}>Confirm and Pay</button>
                )}
            </div>
        </div>
        </>
    );
};

export default CheckOut;