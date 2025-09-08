import React, { useContext, useState,useEffect} from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from "./global/CartContext";
import { loadStripe } from '@stripe/stripe-js';
import { Elements } from '@stripe/react-stripe-js';
import Checkout from './Checkout'; // Import the Checkout component
import Bucket from "../images/shop.svg";
import '../styles/basket.css';

const Cart = ({status}) =>{
    //Navigation to go to Menu
    const navigate=useNavigate();
    const { cart, getTotalPrice, removeFromCart,clearCart,totalPrice,paymentClientKeyStripe} = useContext(CartContext);
      const [stripePromise, setStripePromise] = useState(null);
    
       const [showCheckout, setShowCheckout] = useState(false); // State to show or hide the checkout modal
    const validCartItems = Object.values(cart).filter(
        item => item && item.quantity && item.price
    );
     const handleClose = () =>{
        setShowCheckout(false);
     }
    const handlePayClick = () => {
        setShowCheckout(true);
    };
       useEffect(() => {
    if (paymentClientKeyStripe) {
      setStripePromise(loadStripe(paymentClientKeyStripe));
    }
  }, [paymentClientKeyStripe]);



    return (
        <div className='cart'>
            <h2 className='ti'>Your Basket</h2>
            {validCartItems.length ? (
                <ul className='liste'>
                    {validCartItems.map(item => (
                        <li key={item.name} className='pro'>
                            {item.name} x {item.quantity} - €{(item.quantity * parseFloat(item.price.replace('€', '').replace(',', '.'))).toFixed(2)}
                            <button className='re' onClick={() => removeFromCart(item.id)}>-</button> {/* Add button */}
                        </li>
                    ))}
                </ul>
            ) : (
                <>
                    <p className="Emty">Your basket is empty</p>
                    <img alt='Empty' src={Bucket} className='bag'/>
                    <button className='pay' onClick={()=>navigate('/menu')}>Menu</button>
                </>
            )}
            {validCartItems.length > 0 && (
  <button className='clear' onClick={() => clearCart()}>
    Clear
  </button>
)}
            <h3 className='prices'>Total Price: €{getTotalPrice()}</h3>
            {validCartItems.length > 0 && (
                <button className='pay' onClick={handlePayClick}>Pay</button>
            )}
            {/* Show Checkout Popup */}
            {showCheckout && (
                <Elements stripe={stripePromise}>
                      <Checkout 
                         items = {validCartItems}
                         onClose = {handleClose}
                        />
                </Elements>
            )}
        </div>
    );



}


export default Cart;