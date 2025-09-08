import React, { useState } from "react";
import "../styles/reser.css";
import Logo from '../images/logo.png';

const Reservations = () => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    reservation_date: "",
    reservation_time: "",
    party_size: 1,
    special_requests: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e) => {
  e.preventDefault();

  try {
    const formBody = new URLSearchParams({
      name: formData.name,
      phone: formData.phone,
      email: formData.email,
      date: formData.reservation_date,
      time: formData.reservation_time,
      partySize: formData.party_size,
      note: formData.special_requests,
    });

    const response = await fetch(`${process.env.REACT_APP_PUBLIC_URL}estys/down/reservation`, {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: formBody.toString(),
    });

    const result = await response.json();

    if (response.ok) {
      alert(result.message); // Comes from Database.applyReservation return
      setFormData({
        name: "",
        phone: "",
        email: "",
        reservation_date: "",
        reservation_time: "",
        party_size: 1,
        special_requests: "",
      });
    } else {
      alert("Failed to submit reservation.");
    }
  } catch (error) {
    console.error("Error submitting reservation:", error);
    alert("Something went wrong. Try again later.");
  }
};

  return (
    <div className="reservationen">
      <h1>Reservations</h1>
      <p>Book your table now!</p>

      <form onSubmit={handleSubmit} className="reservation-form">
        <img src={Logo} alt=""/>
        <label>
          <input
            type="text"
            name="name"
            placeholder="Name"
            value={formData.name}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            value={formData.phone}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          <input
            type="email"
            name="email"
            placeholder="E-Mail"
            value={formData.email}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Date:
          <input
            type="date"
            name="reservation_date"
            value={formData.reservation_date}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Time:
          <input
            type="time"
            name="reservation_time"
            value={formData.reservation_time}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Number of Guests:
          <input
            type="number"
            name="party_size"
            min="1"
            value={formData.party_size}
            onChange={handleChange}
            required
          />
        </label>

        <label>
          Special Requests:
          <textarea
            name="special_requests"
            value={formData.special_requests}
            onChange={handleChange}
            placeholder="Optional..."
          />
        </label>

        <button type="submit">Reservieren</button>
      </form>
    </div>
  );
};

export default Reservations;
