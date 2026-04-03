import { useState, useEffect } from "react";
import axios from "axios";
import { Routes, Route, Navigate } from "react-router-dom";

import Login from "./pages/Login";
import Register from "./pages/Register";
import ChatPage from "./pages/ChatPage";

function App() {
  // ✅ LOAD USER FROM LOCAL STORAGE (SAFE WAY)
  const [userInfo, setUserInfo] = useState(() => {
    try {
      const user = localStorage.getItem("userInfo");
      return user ? JSON.parse(user) : null;
    } catch (err) {
      console.log("Error parsing userInfo:", err);
      return null;
    }
  });

  const [users, setUsers] = useState([]);

  // ✅ FETCH USERS (ONLY IF TOKEN EXISTS)
  useEffect(() => {
    if (!userInfo?.token) return;

    const fetchUsers = async () => {
      try {
        const { data } = await axios.get(
          "http://localhost:5000/api/users",
          {
            headers: {
              Authorization: `Bearer ${userInfo.token}`,
            },
          }
        );

        setUsers(data);
      } catch (error) {
        console.log("User fetch error:", error.response?.data);

        // 🔥 AUTO LOGOUT IF TOKEN INVALID (fixes 401 loop)
        if (error.response?.status === 401) {
          handleLogout();
        }
      }
    };

    fetchUsers();
  }, [userInfo]);

  // ✅ LOGOUT FUNCTION
  const handleLogout = () => {
    localStorage.removeItem("userInfo");
    setUserInfo(null);
  };

  return (
    <Routes>
      {/* LOGIN */}
      <Route
        path="/login"
        element={
          !userInfo ? (
            <Login setUserInfo={setUserInfo} />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* REGISTER */}
      <Route
        path="/register"
        element={
          !userInfo ? (
            <Register setUserInfo={setUserInfo} />
          ) : (
            <Navigate to="/" />
          )
        }
      />

      {/* CHAT PAGE */}
      <Route
        path="/"
        element={
          userInfo ? (
            <ChatPage
              userInfo={userInfo}
              users={users}
              handleLogout={handleLogout}
            />
          ) : (
            <Navigate to="/login" />
          )
        }
      />
    </Routes>
  );
}

export default App;