import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { useState, useEffect } from "react";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";
import RoomList from "./pages/RoomList";
import CreateRoom from "./pages/CreateRoom";
import Chat from "./pages/Chat";

function App() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    const storedUser = localStorage.getItem("chatUser");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  const handleLogin = (userData) => {
    setUser(userData);
    localStorage.setItem("chatUser", JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem("chatUser");
  };

  return (
    <Router>
      <div className="app">
        <Navbar user={user} onLogout={handleLogout} />
        <div className="page">
          <Routes>
            <Route path="/" element={<Home user={user} />} />
            <Route path="/login" element={<Login onLogin={handleLogin} />} />
            <Route path="/register" element={<Register onLogin={handleLogin} />} />
            <Route path="/rooms" element={<RoomList user={user} />} />
            <Route path="/create-room" element={<CreateRoom user={user} />} />
            <Route path="/chat/:roomId" element={<Chat user={user} />} />
          </Routes>
        </div>
        <Footer />
      </div>
    </Router>
  );
}

export default App;
