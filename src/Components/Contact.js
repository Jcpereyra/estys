import React,{useState,useContext,useEffect} from "react";
import '../styles/contact.css';
import {db} from '../FirebaseConfig';
import { MapLocation } from "./About";
import {doc,getDoc} from 'firebase/firestore';
import Phone from '../images/phone.svg';
import Mail from '../images/mail.svg';


const Contact = () =>{
    const [data,setData] = useState([]);
    
    useEffect(()=>{
         const fetchStoreInfos = async () => {
              try {
                const docRef = doc(db, "store", "infos"); 
                // 👆 collection = "Öffnungszeiten", document = "öffnungszeiten"
                const docSnap = await getDoc(docRef);
        
                if (docSnap.exists()) {
                  setData(docSnap.data());
                } else {
                  console.log("No such document!");
                }
              } catch (error) {
                console.error("Error fetching opening times:", error);
              }
            };

            fetchStoreInfos();
    },[]);
    return(
        <div className="contact">
            <h1>Contact Us</h1>
             <div className="contact-card">
                <h2>{data.Name}</h2>
               <MapLocation/>
               <span className="address">{data.Address}</span>
               <div className="connect">
                  <a href={`mailto:${data.email}`} className="flex items-center gap-2 hover:underline">
    <img src={Mail} alt="Mail icon" className="w-5 h-5" />
    {data.email}
  </a>

  <a href={`tel:${data.Phone}`} className="flex items-center gap-2 hover:underline">
    <img src={Phone} alt="Phone icon" className="w-5 h-5" />
    {data.Phone}
  </a>
               </div>
             </div>

        </div>
    );
}
export default Contact; 