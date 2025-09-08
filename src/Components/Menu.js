

import React,{useContext,useState,useEffect} from "react";
import {MenuContentContext} from './global/MenuContent';
import { CartContext } from "./global/CartContext";
import {db } from '../FirebaseConfig';
import { doc, getDoc } from 'firebase/firestore';
import { useNavigate } from "react-router-dom";

import '../styles/menu.css';
import MenuCard from '../images/menucard.png';
import Vegie from '../images/vegies.png';
import Special from '../images/special.png';
import Rice from '../images/rice.png';
import Meat from '../images/meat.png';
import Extras from '../images/extras.png';
import Liefer from '../images/lieferando.svg';
import Loading from '../images/loading.webp';


const Menu = () =>{
     const {menuCategories,status,menuContent,images,setCurrentCategory,searchValue,setSearchValue,currentCategory} = useContext(MenuContentContext);
     const {addToCart,removeFromCart,cart,clearCart} = useContext(CartContext);
     const [pickUp,setPickup] = useState(false);
        



       const handlePickup = () => {
    setPickup(prevPickup => !prevPickup); // ✅ correctly toggles
  };
       const handleLieferando = () => {
    window.open("https://www.lieferando.de/speisekarte/estys-taste","_blank"); // ✅ external redirect
  };

    return(

        <div className="menu">
            {status.status === "online" ? (
  <div className="online-menu">
        {!pickUp ? (
            <div className="pickup-choice">
                <h1>Lieber Kunde!</h1>
              <p className="liefer-explination">Aufgrund von Personalmangel sind Lieferungen nur über unseren Partner Lieferando möglich.
Bitte besuchen Sie Lieferando für Lieferungen oder klicken Sie auf Abholen, wenn Sie Ihre Bestellung selbst abholen möchten.</p>
              <button className="pickup" onClick={handlePickup}>Abholen</button>
              <button className="lieferando" onClick={handleLieferando}><img src={Liefer} alt="Lieferando"/></button>
            </div>
          ) : (
            <div className="pickup-menu">
                  {/* Top controls */}
  <div className="pickup-controls">
    {/* Category selector */}
    <select
      value={currentCategory}
      onChange={(e) => setCurrentCategory(e.target.value)}
    >
      {menuCategories.map((cat) => (
        <option key={cat} value={cat}>
          {cat}
        </option>
      ))}
    </select>

    {/* Search bar */}
    <input
      type="text"
      placeholder="Search menu..."
      value={searchValue}
      onChange={(e) => setSearchValue(e.target.value)}
    />
  </div>

  {/* Filtered menu content */}
      {menuContent && (
    <div className="menu-item">
      {Object.entries(menuContent)
        .filter(([_, item]) =>
          item.name.toLowerCase().includes(searchValue.toLowerCase())||
            item.description.toLowerCase().includes(searchValue.toLowerCase())
        )
        .map(([key, item]) => (
          <div key={item.id} className="menu-items">
              <h3>{item.name}</h3>
                    {images && (
  <img src={images[item.id]} alt={item.name} />
)}
              <div className="product-infos">
                <h4>Origin: {item.origin}</h4>
                <p>{item.description}</p>
                <span className="taker">
                    <strong>{item.price}</strong>
                    <div className="adders">
                     <button className="delete" onClick={() => removeFromCart(item.id)}>-</button>
<p>{cart[item.id]?.quantity || 0}</p>
<button className="add" onClick={() => addToCart(item)}>+</button>
                    </div>
                </span>
              </div>
          </div>
        ))}
    </div>
  )}
            </div>
          )}
  </div>
) : (
  <div className="offline-card">
    <DefaultDisplayer/>
  </div>
)}
        </div>
    );
}

const DefaultDisplayer = () =>{
    const closedMessage = "Online-Bestellungen momentan nicht möglich. Danke für Ihr Verständnis.";
  const menu = [MenuCard, Vegie, Special, Rice, Meat, Extras];
  const [index, setIndex] = useState(0);
  const [animate, setAnimate] = useState(false);
   // Put all images in an array
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
     const [openingTimes, setOpeningTimes] = useState({});


     const navigate=useNavigate();

  const handleChange = () => {
    // Trigger temporary animation
    setAnimate(true);
    setTimeout(() => setAnimate(false), 500); // duration matches CSS animation

    // Update index
    setIndex(prevIndex => (prevIndex < menu.length - 1 ? prevIndex + 1 : 0));
  };

  //We Be Back
   useEffect(() => {
    const fetchOpeningTimes = async () => {
      try {
        const docRef = doc(db, "Öffnungszeiten", "öffnungszeiten"); 
        // 👆 collection = "Öffnungszeiten", document = "öffnungszeiten"
        const docSnap = await getDoc(docRef);

        if (docSnap.exists()) {
          setOpeningTimes(docSnap.data());
        } else {
          console.log("No such document!");
        }
      } catch (error) {
        console.error("Error fetching opening times:", error);
      }
    };

    fetchOpeningTimes();
  }, []);

  // Conditional classes
  const cardClass = `${index > 0 ? "menu-pak" : "card"} ${animate ? "spin" : ""}`;
  const bookClass = index === 0 ? "book" : "booker";

  return (
    <div className="default-menu">
      <h1>{closedMessage}</h1>
      <div className={bookClass}>
        <span className={cardClass}>
          <img src={menu[index]} alt={`Menu ${index}`} />
          <button className="next" onClick={handleChange}>Next</button>
        </span>
      </div>
      <div className="nextTime">
                  <h2>We’ll be back soon!</h2>
              <ul>
    {weekDays.map((day) => (
      <li key={day}>
        <strong>{day}:</strong> {openingTimes[day]}
      </li>
    ))}
  </ul>
      </div>
      <button onClick={()=>navigate("/reservation")} className="reservation">Reservieren</button>
    </div>
  );
}


export default Menu;