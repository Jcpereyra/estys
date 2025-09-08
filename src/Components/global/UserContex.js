import React,{useEffect} from "react";
import { createContext, useState } from "react";

export const UserContext = createContext();

export const UserProvider = ({ children }) => {
    const STORAGE_CREDENTIALS = "estys_user";
    const [userCredentials, setUserCredentials] = useState(()=>{
        try {
    const savedUser = localStorage.getItem(STORAGE_CREDENTIALS);
    return savedUser ? JSON.parse(savedUser) : {};
  } catch (e) {
    console.error("Failed to parse user credentials from localStorage:", e);
    return {};
  }
    });
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [coupon,setCoupon] = useState({});
         const [userFeedBack,setUserFeedBack] = useState({});
    
      //Update Local Storage UserCredentials for Estys Taste 
     useEffect(() => {
  // Persist to localStorage
  localStorage.setItem(STORAGE_CREDENTIALS, JSON.stringify(userCredentials));

  // Check if userCredentials has meaningful data
  const hasData =
    userCredentials &&
    typeof userCredentials === "object" &&
    userCredentials.name && userCredentials.name.trim() !== "";

  setIsAuthenticated(hasData);
   // Only fetch if email exists
  if (userCredentials?.email) {
    fetchCoupons(userCredentials.email);
  }

  // Only fetch reservation if userCredentials has data
  if (userCredentials && Object.keys(userCredentials).length > 0) {
    fetchReservation(userCredentials);
  }


   if (userCredentials && userCredentials?.email) {
        fetch(`${process.env.REACT_APP_PUBLIC_URL}user/feedBack?email=${userCredentials.email}`)
          .then(res => res.json())
          .then(data => setUserFeedBack(data||{}))
          .catch(console.error);
      } else {
        setUserFeedBack([]);
      }

}, [userCredentials]);
   //Reservation Pending 
   const [userReservation,setUserReservation] = useState ({});
    
    
   const fetchReservation = async (userData) =>{
          try {
    const response = await fetch(
      `${process.env.REACT_APP_PUBLIC_URL}reser?email=${encodeURIComponent(userData.email)}`
    );

    if (!response.ok) {
      throw new Error("Failed to fetch reservations");
    }

    const data = await response.json();
    setUserReservation(data);  // store reservations JSON in state
  } catch (error) {
    console.error("Error fetching reservation:", error);
  }
   }
   const login = async (userData) => {
  if (userData && typeof userData === "object") {
    try {
      const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}login`, {
        method: "POST",
        headers: { "Content-Type": "application/x-www-form-urlencoded" },
        body: new URLSearchParams({
          email: userData.email,
          passwd: userData.password,
        }),
      });

      const data = await response.json();

      if (response.ok) {

        if (data.user && data.user.name) {
          // ✅ Successful login
          setUserCredentials(data.user)
          setIsAuthenticated(true);
        } else {
          // ❌ Wrong password or not registered
          alert(data.message);
        }
      } else {
        alert("Serverfehler beim Login");
      }
    } catch (error) {
      console.error("Login error:", error);
      alert("Netzwerkfehler beim Login");
    }
  } else {
    console.error("Invalid userData object:", userData);
  }
};

   const register = async (userData) => {
  if (!userData || typeof userData !== "object") {
    console.error("Invalid user data");
    return;
  }

  try {
    const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}register`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        name: userData.name,
        address: userData.address,
        phone: userData.phone,
        email: userData.email,
        passwd: userData.password
      })
    });

    const data = await response.json();

    if (data.user && data.user.name) {
      // Registration successful
      alert(`Willkommen ${data.user.name}! Ihre Registrierung war erfolgreich.`);
      // Optionally, save credentials in state
      setUserCredentials(data.user);
      setIsAuthenticated(true);
    } else {
      // Registration failed
      alert(data.message);
    }

  } catch (error) {
    console.error("Error during registration:", error);
    alert("Netzwerkfehler beim Registrieren.");
  }
};
    
    const logout = () => {
        setUserCredentials(null);
        setIsAuthenticated(false);
    };

    const setNameUser = (name)=>{
        userCredentials.name=name;
    }
    const setAddress = (address) =>{
        userCredentials.address=address
    }
    const setPhone = (phone) => {
        userCredentials.phone=phone;
    }
    const setEmailUser = (email) =>{
      userCredentials.email=email;
    }
    
    const updateUser = async (userData) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}change`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        name: userData.name,
        address: userData.address,
        phone: userData.phone,
        email: userData.email,
      }),
    });

    const data = await response.json();
    alert(data.message);
    setUserCredentials(userData);
  } catch (error) {
    console.error("Update error:", error);
    alert("Fehler beim Aktualisieren der Daten.");
  }
};

const fetchCoupons = async (email) => {
  try {
    const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}coupons?email=${encodeURIComponent(email)}`);
    const data = await response.json();
    setCoupon(data);
  } catch (error) {
    console.error("Error fetching coupons:", error);
  }
};
    
    return (
        <UserContext.Provider value={{ userCredentials,setNameUser,setAddress,setPhone, isAuthenticated, login,register, logout,updateUser,coupon,userReservation,userFeedBack,setEmailUser}}>
        {children}
        </UserContext.Provider>
    );
}