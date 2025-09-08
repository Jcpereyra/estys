import React, { useState,useContext,useEffect } from 'react';
import './App.css';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import Logo from './images/logo.png';
import { CartContext } from './Components/global/CartContext';
import { MenuContentProvider } from './Components/global/MenuContent';

import Shop from './images/shop.svg';
import Account from './images/account.svg';

import About from './Components/About';
import Menu from './Components/Menu';
import Cart from './Components/Cart';
import Reservations from './Components/Reservations';
import Contact from './Components/Contact';
import User from './Components/User';

function App() {
  const [burgerOpen, setBurgerOpen] = useState(false);
  const {totalItemCount} = useContext(CartContext);
  const [serverStatus, setServerStatus] = useState({ status: "unknown" });
  const toggleBurger = () => {
    setBurgerOpen((prev) => !prev);
  };
 

  useEffect(()=>{
      const fetchStatus = async () => {
    try {
      const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}status`);
      if (!response.ok) throw new Error("Failed to fetch server status");
      const data = await response.json();
      setServerStatus(data); // should be {status:"ok"}
    } catch (error) {
      console.error("Error fetching server status:", error);
      setServerStatus({ status: "offline" }); // same shape
    }
  };

  fetchStatus();
  },[]);

  return (
    <Router>
      <div className="App">
        <header className="App-header">
          {serverStatus.status === "offline" && (
  <div className="server-status"> 🔐 Wir Haben im Moment Geschlossen.</div>
)}

          <img src={Logo} className="App-logo" alt="Estys Taste Ghanaian Cuisine" />
          <span className="burger" onClick={toggleBurger}>{burgerOpen ? "X":"☰"}</span>
          <nav id="navigation" className={burgerOpen ? "navie" : "navflat"}>
            <ul>
              <li><Link to="/" onClick={()=>setBurgerOpen(false)}>About</Link></li>
              <li><Link to="/menu" onClick={()=>setBurgerOpen(false)}>Menu</Link></li>
              <li><Link to="/reservation" onClick={()=>setBurgerOpen(false)}>Reservations</Link></li>
              <li><Link to="/contact" onClick={()=>setBurgerOpen(false)}>Contact</Link></li>
            </ul>
          </nav>
          <span className='userArea' >
            <ul>
              <li><Link to="/cart" onClick={()=>setBurgerOpen(false)}><img src={Shop} alt='Cart'/><p>{totalItemCount}</p></Link></li>
              <li><Link to="/user" onClick={()=>setBurgerOpen(false)}> <img src={Account} alt='Cart'/></Link></li>
            </ul>
          </span>
        </header>

        <main className="main-content">
          <Routes>
            <Route path="/" element={<About />} />
            <Route path="/menu" element={
              <MenuContentProvider> <Menu/> </MenuContentProvider>
             } />
            <Route path="/reservation" element={<Reservations status={serverStatus}/>} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/cart" element={<Cart status={serverStatus}/>} />
            <Route path="/user" element={<User />} />
            <Route path="*" element={<About/>} />
          </Routes>
        </main>
      </div>
    </Router>
  );
}

export default App;
