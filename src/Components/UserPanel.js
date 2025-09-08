import React,{useState,useEffect,useContext} from "react";
import { useNavigate } from "react-router-dom";
import '../styles/user.css';
import Account from '../images/account.svg';
import { UserContext } from "./global/UserContex";
import { CartContext } from "./global/CartContext";
import Logo from '../images/logo.png';


const UserPanel = ({userCredentials,logout}) =>{
  //General Navigation For SetUPs
  const navigation = useNavigate();
  const [editing, setEditing] = useState(null);
    //Needed Variables to Navigate into Changing Data asWell
    const [open,setOpen] = useState(false);
    const {userReservation,userFeedBack,setUserFeedBack} = useContext(UserContext);
      const {order,lastorder} = useContext(CartContext);
    const handleOpen = () => {
  setTimeout(() => {
    setOpen(prev => !prev);
  }, 500);
}; 
     function handleNavigation(to){
      if(to===null||typeof to == Number)return;
      navigation(to);
     }
      
     const updateReservation = async ({ id, date, time, party_size, note }) => {
  try {
    // URLSearchParams für x-www-form-urlencoded Format
    const formBody = new URLSearchParams({
      id,
      date,
      time,
      partySize: party_size,  // Achtung: backend erwartet "partySize"
      note: note || "",
    });

    const response = await fetch(
      `${process.env.REACT_APP_PUBLIC_URL}estys/up/reservation`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formBody.toString(),
      }
    );

    const result = await response.json();

    if (response.ok) {
      alert(result.message); // Nachricht vom Backend
      // Optional: aktualisiere die Reservations im Frontend
      // z.B. fetchReservation(userData) erneut aufrufen
    } else {
      alert("Failed to update reservation.");
    }
  } catch (error) {
    console.error("Error updating reservation:", error);
    alert("Something went wrong while updating the reservation.");
  }
};
    return(
        <div className="user-panel">
            <h2 className="head"><img src={Account} alt="Wellcome," onClick={handleOpen}/> <span>edit</span>{userCredentials.name} <p>DashBoard</p></h2>
            {open ? (<UserDetails opener={handleOpen} user={userCredentials}/>):(<></>)}
            <div className="reservations">
                <h2>Reservations</h2>
               
       {userReservation && userReservation.reservations && userReservation.reservations.length > 0 ? (
  userReservation.reservations.map((res) => (
    <div key={res.id} className="reservation-card">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          updateReservation({
            id: res.id,
            date: e.target.date.value,
            time: e.target.time.value,
            party_size: parseInt(e.target.party_size.value),
            note: e.target.note.value,
          });
        }}
        className="edit-form"
      >
        <label>
          Date:
          <input type="date" name="date" defaultValue={res.date} required />
        </label>

        <label>
          Time:
          <input type="time" name="time" defaultValue={res.time} required />
        </label>

        <label>
          Party Size:
          <input
            type="number"
            name="party_size"
            defaultValue={res.party_size}
            min="1"
            required
          />
        </label>

        <label>
          Note:
          <textarea name="note" defaultValue={res.note}></textarea>
        </label>

        <label>
          Status:
          <input type="text" name="status" defaultValue={res.status} readOnly />
        </label>

        <button type="submit">Save</button>
      </form>
    </div>
  ))
  ) : (
    <div className="default">
       <p>{userReservation?.message || "Loading reservations..."}
        Hey sie Haben noch nicht Reserviert 
       </p>
       <button onClick={() => handleNavigation("/reservation")}>Jetz Reservieren!</button>
    </div>
  )}

            </div>
            


             <div className="pending-Orders">
  <h2>Bestellungen</h2>
  {order && order.length > 0 ? (
    order.map((ord) => (
      <div key={ord.id} className="order-card">
        <h5> {ord.name}</h5>
        <p>
   <ul>
    {JSON.parse(ord.products).map((item, index) => (
      <li key={index}>{item.name} (x{item.quantity}) - {item.price}</li>
    ))}
  </ul>
</p>
<div className="status">
  <p><strong>Status:</strong> {ord.status}</p>
        <p><strong>Zahlung:</strong> {ord.payment_status}</p>
</div>
        {ord.note && <p> {ord.note}</p>}
        <p className="time">{ord.created_at}</p>
      </div>
    ))
  ) : (
    <div className="default">
      <p>
        {order?.message || "Keine Bestellungen gefunden."}  
        Sie haben noch keine Bestellung aufgegeben.
      </p>
      <button onClick={() => handleNavigation("/menu")}>
        Jetzt bestellen!
      </button>
    </div>
  )}
</div>

<div className="last-Order">
  <h2>Letzte Bestellung</h2>
  {lastorder && Object.keys(lastorder).length > 0 ? (
    <div className="order-card">
      <p><strong>Name:</strong> {lastorder.name}</p>
      <p><strong>E-Mail:</strong> {lastorder.email}</p>
      <p><strong>Produkte:</strong> {lastorder.products}</p>
      <p><strong>Status:</strong> {lastorder.status}</p>
      <p><strong>Zahlung:</strong> {lastorder.payment_status}</p>
      {lastorder.note && <p><strong>Notiz:</strong> {lastorder.note}</p>}
      <p><strong>Datum:</strong> {lastorder.created_at}</p>
    </div>
  ) : (
    <div className="default">
      <p>
        {lastorder?.message || "Keine letzte Bestellung gefunden."}  
        Sie haben noch nichts bestellt.
      </p>
      <button onClick={() => handleNavigation("/menu")}>
        Jetzt bestellen!
      </button>
    </div>
  )}
</div>


            <div className="feedBack">
                  {userFeedBack.length === 0 && (
                    <>
                     <Rate image={Logo} setUserFeedBack={setUserFeedBack}/>
                    </>
                  )}
            </div>
            <button className="logOut" onClick={()=>{
              logout();
            }}>Logout</button>
        </div>
    );
}

const UserOders = () => {
    return (
        <div className="user-deals">
            <h2>Exclusive Deals</h2>
            <p>Check out the latest deals available for you.</p>
            {/* Additional deals and offers can be displayed here */}
        </div>
    );
}
const LastUserOrder =()=>{

}
export const Rate = ({image,setUserFeedBack}) => {
  const [rating, setRating] = useState(0);
  const handleSubmit = async (e) => {
  e.preventDefault(); // Prevent page reload

  const formData = new FormData(e.target);
  const name = formData.get("name");
  const email = formData.get("email") || "UNKNOWN"; // Optional
  const stars = formData.get("stars");
  const note = formData.get("note") || "";

  try {
    const res = await fetch(`${process.env.REACT_APP_PUBLIC_URL}FeedBack`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ name, email, stars, note }),
    });

    const data = await res.json();
    console.log("Feedback response:", data);
     if(data.message){
          localStorage.setItem("estys_rate", JSON.stringify({ submitted: true, name, stars }));
          setUserFeedBack(localStorage.getItem("estys_rate"));
     }
  } catch (err) {
    console.error("Failed to submit feedback:", err);
  }
};
  

  return (
    <>
    <form className="feedback-form" onSubmit={handleSubmit}>
      <h2>Give us your feedback!</h2>
      <img src={image} alt=""/>
       <div className="stars">
  {[1, 2, 3, 4, 5].map((star) => (
    <span
      key={star}
      onClick={() => setRating(star)}
      style={{ cursor: "pointer", fontSize: "2rem", color: star <= rating ? "var(--secondary)" : "var(--primary)" }}
    >
      ★
    </span>
  ))}
</div>
<input type="hidden" name="stars" value={rating} />
<label>
        <input type="text" name="name" required placeholder="name"/>
      </label>
      <label>
        <input type="email" name="email" placeholder="you@example.com (Optional)"  />
      </label>
      <label>
        <textarea name="note" placeholder="Nachricht"/>
      </label>
      <button type="submit">Senden</button>
    </form>
    </>
  );
}


const UserDetails = ({opener,user}) =>{
      const {updateUser,coupon} = useContext(UserContext);

      
  const [name, setName] = useState(user.name || "");
  const [address, setAddress] = useState(user.address || "");
  const [phone, setPhone] = useState(user.phone || "");

    const handleSave = () =>{
        updateUser({name,address,phone,email : user.email});
    }
     
     return (
    <div className="user-modal">
      <h1>User Details</h1>
      <button onClick={opener} className="close">X</button>
      <div className="changer">
        <p className="mail">{user.email}</p>
        <label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />🖉
        </label>
        <label>
          <input
            type="text"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
          />🖉
        </label>
        <label>
          <input
            type="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
          />🖉
        </label>
        <button onClick={handleSave}>Save</button>
        <div className="coupons">
        {coupon.coupons && coupon.coupons.length > 0 ? (
    coupon.coupons.map((c, index) => (
      <div key={index} className="coupon-card">
        <h1>{c.code}</h1>
        <p>{c.discount}% Rabatt</p>
        <p>Gültig bis: {c.expiry_date}</p>
      </div>
    ))
  ) : (
    <p>Keine Coupons verfügbar.</p>
  )}
      </div>
      </div>
    </div>
  );
}


export default UserPanel;