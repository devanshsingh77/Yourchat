import { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Login({ setUserInfo }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const submitHandler = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      alert("Please fill all fields");
      return;
    }

    try {
      const { data } = await axios.post(
        "http://localhost:5000/api/users/login",
        { email, password }
      );

      // Save to localStorage
      localStorage.setItem("userInfo", JSON.stringify(data));
      

      // Update App state
      setUserInfo(data);

      // Redirect to chat page
      navigate("/");
    } catch (error) {
      alert(error.response?.data?.message || "Invalid email or password");
    }
  };

  return (
    <div style={{ maxWidth: 400, margin: "100px auto" }}>
      <h2>Login</h2>

      <form onSubmit={submitHandler}>
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 10, padding: 8 }}
        />

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            cursor: "pointer",
          }}
        >
          Login
        </button>
      </form>

      <p style={{ marginTop: 15 }}>
        Don't have an account?{" "}
        <span
          onClick={() => navigate("/register")}
          style={{ color: "orange", cursor: "pointer" }}
        >
          Register
        </span>
      </p>
    </div>
  );
}

export default Login;
