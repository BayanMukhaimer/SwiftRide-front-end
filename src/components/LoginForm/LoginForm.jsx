import { useState , useEffect} from "react";
import { useNavigate } from "react-router";
import axios from "axios";
import { jwtDecode } from "jwt-decode";

function LoginForm({ onLogin, currentUser, setCurrentUser}) {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();


  useEffect(() => {
      if (token) {
        try {
          const decoded = jwtDecode(token);
          console.log("this is decoded inside form", decoded);
          setCurrentUser(decoded);
        } catch (err) {
          console.error("Invalid token:", err);
          // setCurrentUser(null);
        }
      }
    }, [token]);
    
  // console.log(currentUser)

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      const res = await axios.post("http://localhost:3000/api/users/login", {
        email,
        password,
      });
      localStorage.setItem("token", res.data.token);
      onLogin(res.data.token);


      {currentUser.role == "driver"
      ?
        navigate("/driver")
      :
        navigate("/rides/request")
      }
    } catch (err) {
      console.log(err.response?.data?.message || "Login failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Login</h2>
        <input
          placeholder="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <button type="submit">Login</button>
      </form>
    </div>
  );
}

export default LoginForm;
