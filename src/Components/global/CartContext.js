import React, { createContext, useState, useEffect,useContext } from 'react';
import { UserContext } from './UserContex';

// Create the Cart Context
export const CartContext = createContext();

// Provide the Cart Context
export const CartProvider = ({ children }) => {
    const STORAGE_KEY = "estys_cart";
        const STORAGE_CREDENTIALS = "estys_user";
    const [cart, setCart] = useState(() => {
        const savedCart = localStorage.getItem(STORAGE_KEY);
        return savedCart ? JSON.parse(savedCart) : {};
    });

    const [totalItemCount, setTotalItemCount] = useState(0);
    const [totalPrice, setTotalPrice] = useState("");

       //ALl IMPORtANT ORDER Variables For the 
        const [order, setOrder] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [placeOrder, setPlaceOrder] = useState(null);
     useEffect(()=>{
          const localUser = localStorage.getItem(STORAGE_CREDENTIALS);
  if (localUser) {
    try {
      const parsed = JSON.parse(localUser);

      if (parsed && typeof parsed==="object" && parsed.email) {
        // Fetch user orders
        fetch(`${process.env.REACT_APP_PUBLIC_URL}user/orders?user_id=${parsed.email}`)
          .then((res) => res.json())
          .then((data) => setOrder(data.orders || {}))
          .catch(console.error);

        // Fetch last order
        fetch(`${process.env.REACT_APP_PUBLIC_URL}user/lastorder?email=${parsed.email}`)
          .then((res) => res.json())
          .then((data) => setLastOrder(data.last_order || {}))
          .catch(console.error);
      }
    } catch (e) {
      
    }
  }
}, []);
    
const handlePlaceOrder = (cart,name,phone,email, address, note, paymentStatus,transaction_id) => {

  const params = new URLSearchParams({
    name: name,
    phone: phone,
    email: email,
    address: address,
    note: note,
    products: JSON.stringify(cart),
    payment_status: paymentStatus,
    transaction_id: transaction_id,
    date: Date.now().toString()
  });

  fetch(`/order?${params.toString()}`, { method: "POST" })
    .then((res) => res.json())
    .then((data) => setPlaceOrder(data))
    .catch(console.error);
};
    // Update localStorage and total item count whenever the cart changes
    useEffect(() => {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(cart)); // Persist the cart in localStorage
        setTotalItemCount(getTotalItemCount()); // Calculate and set the total item count
        setTotalPrice(getTotalPrice()); // Calculate and set the total price
    }, [cart]);


   const addToCart = (item) => {
    if (!item || !item.id || !item.price) return;
    setCart((prevCart) => {
        const newCart = { ...prevCart };

        if (newCart[item.id]) {
            newCart[item.id].quantity += 1;

        } else {
            newCart[item.id] = { ...item, quantity: 1 };
        }

        return newCart;
    });
};

const removeFromCart = (itemId) => {
    setCart((prevCart) => {
        const newCart = { ...prevCart };

        if (newCart[itemId]) {
            if (newCart[itemId].quantity > 1) {
                newCart[itemId].quantity -= 1;
            } else {
                delete newCart[itemId];
            }
        }

        return newCart;
    });
};
    //Clear Cart After Sucessfull Order Placement
    const clearCart = () => {
        setCart({});
        localStorage.removeItem('estys_cart'); // Remove the cart from localStorage
        setTotalItemCount(0); // Reset the total item count
      };

    const getTotalPrice = () => {
        // Filter and reduce over valid cart items
        return Object.values(cart)
            .filter(item => item && item.quantity && item.price) // Filter out invalid items
            .reduce((total, item) => {
                const itemPrice = parseFloat(item.price.replace('€', '').replace(',', '.'));
                return total + item.quantity * itemPrice;
            }, 0)
            .toFixed(2);
    };

    const getTotalItemCount = () => {
        return Object.values(cart)
            .filter(item => item && item.quantity) // Filter out any null or undefined items
            .reduce((total, item) => total + item.quantity, 0); // Safely access the quantity
    };

    return (
        <CartContext.Provider value={{ cart, addToCart, removeFromCart, getTotalPrice, getTotalItemCount, totalItemCount,clearCart,totalPrice,order,lastOrder,handlePlaceOrder }}>
            {children}
        </CartContext.Provider>
    );
};
