import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

import "./Login.css"

const Login = ({ setUser }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleLogin = async () => {
    try {
      const res = await axios.post("http://localhost:5000/users/login", { email, password });
      localStorage.setItem("token", res.data.token);
      setUser(res.data.user);
      navigate("/chats");
    } catch (err) {
      alert("Invalid Credentials");
    }
  };

  return (
    <div className="contaner">
    <div className="login-container">
      <h2>Login</h2>
      <input type="email" placeholder="Email" onChange={(e) => setEmail(e.target.value)} />
      <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} />
      <button onClick={handleLogin}>Login</button>
    </div>
    </div>
  );
};

export default Login;
