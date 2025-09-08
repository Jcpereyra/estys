import React, { useEffect,useState,useContext,useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/about.css';
import Service from '../images/service.svg';
import Reserve from '../images/table.svg';
import Order from '../images/online.svg';
import US from '../images/bgfirst.png';
import FUFU from '../images/fufu.png';
import FishSoup from '../images/fish-soup.png';
import Bankua from '../images/bankua.png';
import Yallof from '../images/yallof.jpg';
import Waakye from '../images/Waakye.jpg';
import Logo from '../images/logo.png';
import Account from '../images/account.svg';

import {db } from '../FirebaseConfig';
import { doc, getDoc,getDocs,collection } from 'firebase/firestore';
import { Rate } from './UserPanel';
import { UserContext } from './global/UserContex';

const About = () => {

  const navigate = useNavigate();
    const scrollRef = useRef();

    // Put all images in an array
  const images = [US, FUFU, FishSoup, Bankua, Yallof, Waakye];
  const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];
     const [openingTimes, setOpeningTimes] = useState({});
     const [rating,setRating] = useState([]);
    const [hasRated, setHasRated] = useState(() => {
  try {
    const localRate = localStorage.getItem("estys_rate");
    return localRate !== null; // ✅ true if exists, false if not
  } catch (e) {
    console.error("Failed to read localStorage:", e);
    return false;
  }
});
  const {setUserFeedBack} = useContext(UserContext);

  // Track which image is active
  const [currentIndex, setCurrentIndex] = useState(0);

    const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false); // start fade out
      setTimeout(() => {
        setCurrentIndex((prev) =>
          prev === images.length - 1 ? 0 : prev + 1
        );
        setFade(true); // fade back in
      }, 500); // match CSS fade-out time
    }, 6000);

    return () => clearInterval(interval);
  }, [images.length]);
    // Fetch Öffnungszeiten from Firestore
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
    const fetchRate = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, "feed_back")); // get all docs
    const allRatings = querySnapshot.docs.map(doc => doc.data());   // extract data

    // Example: filter by current user's email if needed
    // const userRatings = allRatings.filter(r => r.email === currentUserEmail);

    setRating(allRatings); // store array of ratings
  } catch (error) {
    console.error("Error fetching ratings:", error);
  }
};
    fetchRate();
    fetchOpeningTimes();
  }, []);
 useEffect(() => {
  if (!scrollRef.current) return;
  const container = scrollRef.current;
  let index = 0;

  const interval = setInterval(() => {
    const cards = container.querySelectorAll(".opinion");
    if (cards.length === 0) return;

    index = (index + 1) % cards.length; // cycle through all
    const card = cards[index];

    container.scrollTo({
      left: card.offsetLeft,
      behavior: "smooth"
    });
  }, 3000);

  return () => clearInterval(interval);
}, [rating]);
  
   const handleNavigate = (path) =>{
      navigate(path);
   }


    return(
        <div className="about-container">
          <div className='page-title'>
            <h1>Esty's Taste</h1>
            <b>We make sure Quality & Healthy Food</b>
            <p>
              Our restaurant embraces handcrafted décor, blending stylish elements with the vibrant colors and rich patterns of traditional Ghanaian and African design.
            </p>

          </div>

          <div className='why-choose-us'>
            	<div className='intro'><span className="intro-title">Why Choose Us</span>
               <img  className={`choseImage ${fade ? 'fade-in' : 'fade-out'}`} src={images[currentIndex]} alt="" />
              <h2 className="intro-title-second">At Esty’s, we are committed to</h2><p className="description"> providing a seamless and enjoyable dining experience, whether you choose to dine in, take out, or place an order online. Our services are designed to be fast, efficient, and dependable—making mealtime stress-free and satisfying. We prioritize customer convenience by ensuring quick service, consistent food quality, and a reliable ordering process you can count on every time.</p>
               
               <iframe
  src="https://www.youtube.com/embed/ab5QZISmuHg"
  title="Esty's Taste (A new African Restaurant in Hannover)"
  frameBorder="3"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
  referrerPolicy="strict-origin-when-cross-origin"
  allowFullScreen
></iframe>
              </div>	
              <div className='features'>
                <div className='feature-item'>
                  <img src={Service} alt="Quality Food" />
                  <h3>Quality Food</h3>
                  <p>At Esty’s, we take pride in serving exceptional food made with the finest ingredients. We encourage advance reservations, especially on weekends and special occasions.</p>
                  <button className='feature-button' onClick={()=>handleNavigate("menu")}>to Menu</button>
                </div>
                <div className='feature-item'>
                  <img src={Reserve} alt="Table Reservation" />
                  <h3>Table reservation</h3>
                  <p>We recommend booking in advance, especially for weekends and special occasions, to ensure the best service. We look forward to welcoming you to Esty’s!</p>
                  <button className='feature-button' onClick={()=>handleNavigate("reservation")}>to Reservation</button>
                </div>
                <div className='feature-item'>
                  <img src={Order} alt="Online Order" />
                  <h3>Online Order</h3>
                  <p>njoy Esty’s quality food made with the finest ingredients. Order online or reserve your table in advance—especially on weekends—for the best experience.</p>
                  <button className='feature-button' onClick={()=>handleNavigate("menu")}>Order Now</button>
                </div>
              </div>
          </div>
             <div className='open-Times'>
                  <h2>Opening Time</h2>
              <ul>
    {weekDays.map((day) => (
      <li key={day}>
        <strong>{day}:</strong> {openingTimes[day]}
      </li>
    ))}
  </ul>
             </div>
             <div className='rating'>
  {rating.length > 0 && (
    <div ref={scrollRef} className='opinions'>
      {rating.map((item, index) => (
        <div key={index} className="opinion">
          <img src={Account} alt=''/>
          <p className='name'>{item.name}</p>
           <p>
    {Array.from({ length: 5 }, (_, i) => (
      <span key={i} style={{ color: i < item.stars ? '#FFD700' : '#ccc', fontSize: '1.2rem' }}>★</span>
    ))}
  </p>
          <p className='note'>{item.note}</p>
          <p className='time'> {new Date(item.created_at).toLocaleDateString()}</p>
        </div>
      ))}
    </div>
  )}

  {hasRated ? (
    <></>
  ) : (
    <Rate image={Logo} setUserFeedBack={setUserFeedBack} />
  )}
</div>

            <MapLocation />
        </div>
    )
}





export const MapLocation = () =>{
  useEffect(()=>{
     document.title = "EstsyTaste - African Cuisine";
     document.querySelector('meta[name="description"]').setAttribute("content", "Discover the rich flavors of Ghanaian cuisine with EstsyTaste. Explore our menu and enjoy authentic dishes delivered to your doorstep.");
      document.querySelector('meta[name="keywords"]').setAttribute("content", "Ghanaian cuisine, EstsyTaste, authentic dishes, food delivery, Ghanaian recipes");
      document.querySelector('meta[name="author"]').setAttribute("content", "Juan Carlos Pereyra de León");
},[]);


  return (
    <div className="map-container">
      <iframe
        title="Map"
        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2431.123456789012!2d9.741415684681!3d52.392929279759!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x47b0a0c8b8b8b8b8%3A0x8b8b8b8b8b8b8b8b!2sDragonerstra%C3%9Fe%2021%2C%2030163%20Hannover%2C%20Germany!5e0!3m2!1sen!2sus!4v1692626262626"
        width="100%"
        height="100%"
        style={{ border: 0 }}
        allowFullScreen=""
        loading="lazy"
      ></iframe>
    </div>
  );
}


export default About;