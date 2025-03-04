import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState } from "react";
import Login from "./Login";
import Signup from "./Signup";
import Chats from "./Chats";

function App() {
  const [user, setUser] = useState(null);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<Login setUser={setUser} />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/chats" element={user ? <Chats user={user} /> : <Login setUser={setUser} />} />
        {/* <Route path="/chats" element={<Chats user={user} />} /> */}
      </Routes>
    </Router>
  );
}

export default App;
