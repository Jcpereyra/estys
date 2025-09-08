'use client'

import React, { useState,useEffect,useContext } from 'react';
import { PayPalScriptProvider, PayPalButtons } from '@paypal/react-paypal-js';
import { PaymentElement, useStripe, useElements, Elements} from '@stripe/react-stripe-js';
import { CartContext } from './global/CartContext';
import { UserContext } from './global/UserContex';
import '../styles/checkout.css';
import { Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';

// Initialize Stripe with your public key
const Checkout =({items,onClose}) => {
  const [selectedMethod, setSelectedMethod] = useState('PayPal');
  const [clientSecret, setClientSecret] = useState('');
  const {getTotalPrice,paypalClientKeyStripe,paymentClientKeyStripe,clearCart} = useContext(CartContext);
  const {isAuthenticated,userCredentials,setNameUser,setAddress,setPhone,setEmailUser} = useContext(UserContext);
  const [note,setNote]=useState("");

  const paypalClient = process.env.REACT_APP_PAYPAL_CLIENT;
  // Stripe hooks
  const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC);
// Load Stripe outside the component so it is not recreated on each render
  // Editable user information
  const totalPrice=getTotalPrice();
   
  useEffect(() => {
    const fetchClientSecret = async () => {
      try {
        const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}create-payment-intent`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            amount: totalPrice * 100, // Stripe requires the amount in cents
            currency: "eur", // Replace "eur" with dynamic currency if needed
          }),
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setClientSecret(data.clientSecret); // Set clientSecret for Stripe Elements
        } else {
          alert("Could not initialize payment. Please try again.");
        }
      } catch (error) {
        alert("An error occurred while initializing the payment.");
      }
    };
  
    if (totalPrice) {
      fetchClientSecret(); // Call the function when totalPrice is defined
    }
  },[totalPrice]); // Rerun this effect if totalPrice changes
   const validateUserDetails = ({name,address,phone}) => {
    if (!name || !address || !phone) {
      alert('Please fill in all required fields: name, address, and phone.');
      return false;
    }
    return true;
  };
  
const handleOrderSuccess = async (paymentDetails) => {
  const productsJSON = JSON.stringify(items.map(item => ({
    id: item.id,
    name: item.name,
    price: item.price,
    quantity: item.quantity
  })));

  // Map payment provider status to your ENUM
  const mapPaymentStatus = (status) => {
    if (!status) return 'pending';
    const s = status.toLowerCase();
    if (s.includes('succeed') || s === 'paid' || s === 'completed') return 'paid';
    if (s === 'failed' || s === 'error') return 'failed';
    if (s === 'refunded') return 'refunded';
    return 'pending';
  };

  try {
    const params = new URLSearchParams({
      name: userCredentials.name,
      phone: userCredentials.phone,
      email: userCredentials.email || '',
      address: userCredentials.address,
      note: note || '',
      products: productsJSON,
      payment_status: mapPaymentStatus(paymentDetails.status), 
      transaction_id: paymentDetails.id || paymentDetails.orderID || '',
    });

    // Only send user_id if logged in
    if (userCredentials.id) {
      params.append('user_id', userCredentials.id);
    }

    const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}order`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: params.toString()
    });

    const result = await response.json();

    if(response.ok) {
      alert("Order successfully placed!");
      clearCart();
      onClose();
    } else {
      alert("Failed to place order: " + result.message);
    }
  } catch (err) {
    console.error(err);
    alert("An error occurred while sending the order.");
  }
};




  return (
    <div className="checkout-modal">
      <div className="checkout-content">
        <h2>Checkout</h2>

        <div className="items-list">
          <h3>Items you're purchasing:</h3>
          <ul>
            {items.map((item, index) => (
              <li key={index}>
                {item.name} - €{parseFloat(item.price.replace('€', '').replace(',', '.')).toFixed(2)} (x{item.quantity})
              </li>
            ))}
          </ul>
        </div>



        <p><strong>Total Price:</strong> €{totalPrice}</p>
        {isAuthenticated ? (
          <div className='informations-form'>
              <h3>User Information</h3>
          <label><input type="text" placeholder="Name" value={userCredentials.name} onChange={(e) => setNameUser(e.target.value)} /></label>
          <label> <input type="text" placeholder="Address" value={userCredentials.address} onChange={(e) => setAddress(e.target.value)} /></label>
          <label>
  <input
    type="email"
    placeholder="Email"
    value={userCredentials.email || ""}
    onChange={(e) => setEmailUser(e.target.value)}
  />
</label>
          <label><input type="text" placeholder='Phone' value={userCredentials.phone} onChange={(e) => setPhone(e.target.value)} /></label>
          <label>
            <textarea onChange={(e)=>setNote(e.target.value)} placeholder='Note'></textarea>
          </label>
          <p>Configure your information on <Link to={'/user'}>User</Link></p>

          </div>
        ):(
          <div className='informations-form'>
              <h3>User Information</h3>
          <label> <input type="text" placeholder='name' onChange={(e) => setNameUser(e.target.value)} /></label>
          <label> <input type="text" placeholder='Address'  onChange={(e) => setAddress(e.target.value)} /></label>
          <label>
  <input
    type="email"
    placeholder="Email"
    onChange={(e) => setEmailUser(e.target.value)}
  />
</label>
          <label> <input type="number"onChange={(e) => setPhone(e.target.value)}  placeholder='Number'/></label>
          <label>
            <textarea onChange={(e)=>setNote(e.target.value)} placeholder='Note'></textarea>
          </label>
          <p>Configure your information on <Link to={'/user'}>User</Link></p>

          </div>
        )}

        <div className="payment-methods">
        <h3>Select Payment Method:</h3>
  <select value={selectedMethod} onChange={(e) => setSelectedMethod(e.target.value)}>
    <option value="PayPal">PayPal</option>
    <option value="CreditCard">Credit Card</option>
  </select>
        </div>

        {selectedMethod === 'PayPal' && (
           <div className="paypal-container">
               <PayPalScriptProvider options={{ "client-id": paypalClient , currency: "EUR",intent: "capture",locale:"de_DE"}}>
               <PayPalButtons
  createOrder={async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}Paypal-Payment`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: totalPrice.toString(),
          currency: "EUR",  // Ensure the currency is passed as USD or EUR depending on your setup
          description: "Order Payment",
        }),
      });

      const data = await response.json();

      if (response.ok && data.orderID) {
        return data.orderID;  // Return the order ID for PayPal
      } else {
        throw new Error("Could not create PayPal order.");
      }
    } catch (error) {
      throw error;
    }
  }}
  onApprove={async (data, actions) => {
    try {
      // Capture the order using actions.order.capture() instead of data.order.capture()
      const details = await actions.order.capture();  // Correct way to capture payment
      await handleOrderSuccess(details);  // Handle order success
      alert("Payment successful!");
    } catch (error) {
      alert("An error occurred while processing the payment.");
    }
  }}
  onCancel={() => alert("Payment cancelled.")}
  onError={(err) => {
    alert("An error occurred during the payment process.");
  }}
/>
    </PayPalScriptProvider>
           </div>
        )}

        {selectedMethod === 'CreditCard' &&  (
            <div className="stripe-container">
                {clientSecret ? (
        <div className="stripe-container">
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <PaymentForm handleOrderSuccess={handleOrderSuccess}/>
          </Elements>
        </div>
      ) : (
        <p>Loading payment options...</p>
      )}
            </div>
        )}


        <button className='shut' onClick={(e)=>onClose()}>Cancel</button>
      </div>
    </div>
  );
};

// Payment Form Component
const PaymentForm = ({handleOrderSuccess}) => {
  const stripe = useStripe(); // Access Stripe instance
  const elements = useElements(); // Access Elements instance
  const [isProcessing, setIsProcessing] = useState(false);

  const handleConfirmPayment = async () => {
    if (!stripe || !elements) {
      return;
    }

    setIsProcessing(true);

    try {
      const { error, paymentIntent } = await stripe.confirmPayment({
        elements,
        redirect: 'if_required', // Automatically handle redirection if needed
      });

      if (error) {
        alert(`Payment failed: ${error.message}`);
      } else if (paymentIntent && paymentIntent.status === "succeeded") {
        alert("Payment successful!");
        handleOrderSuccess(paymentIntent);
      }
    } catch (error) {
      alert("An error occurred while confirming the payment.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="stripe-container">
      <PaymentElement />
      <button onClick={handleConfirmPayment} disabled={isProcessing}>
        {isProcessing ? "Processing..." : "Bezahlen"}
      </button>
    </div>
  );
};


export default Checkout;
