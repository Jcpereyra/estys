import React, { useState, useContext } from "react";
import { UserContext } from "./global/UserContex";
import '../styles/user.css';
import Icon from '../images/account.svg';
import UserPanel from './UserPanel';

const User = () => {
  const { userCredentials, login,register, logout, isAuthenticated } =
    useContext(UserContext);

  const [logType, setLogType] = useState("login"); // "login" | "register"

  // Form state
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); // optional if you want password

  const handleLogin = (e) => {
    e.preventDefault();
    // Dummy login – you’d normally validate credentials against backend
    login({ email, password});
  };

  const handleRegister = (e) => {
    e.preventDefault();
    register({ name, address, phone, email,password });
  };

  return (
    <div className="user-container">
      {isAuthenticated ? (
        <div className="user-profile">
          <UserPanel userCredentials={userCredentials} logout={logout}/>
        </div>
      ) : (
        <div className="auth-container">
          <div className="tabs">
            <button
              onClick={() => setLogType("login")}
              className={logType === "login" ? "active" : ""}
            >
              Login
            </button>
            <button
              onClick={() => setLogType("register")}
              className={logType === "register" ? "active" : ""}
            >
              Register
            </button>
          </div>

          {logType === "login" ? (
            <form onSubmit={handleLogin} className="login-form">
              <h2>Login</h2>
              <img src={Icon} alt="Login"/>
              <label>
                <input
                  type="email"
                  placeholder="E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                <input
                  type="password"
                  placeholder="Passwd"
                  autoComplete="on"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Login</button>
            </form>
          ) : (
            <form onSubmit={handleRegister} className="register-form">
              <h2>Register</h2>
              <img src={Icon} alt="register"/>
              <label>
                <input
                  type="text"
                  placeholder="User Name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </label>
              <label>
                <input
                  type="text"
                  placeholder="Address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                />
              </label>
              <label>
                <input
                  type="phone"
                  placeholder="phone"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </label>
              <label>
                <input
                  type="email"
                  placeholder="E-Mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </label>
              <label>
                <input
                  type="password"
                  placeholder="passwd"
                  autoComplete="off"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </label>
              <button type="submit">Register</button>
            </form>
          )}
        </div>
      )}
    </div>
  );
};

export default User;
