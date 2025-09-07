import { useState } from "react";
import { useNavigate } from "react-router";
import axios from "axios";

function SignUp() {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [role, setRole] = useState("");
  const [vehicle, setVehicle] = useState("");

  const navigate = useNavigate();

  const handleSubmit = async (event) => {
    event.preventDefault();
    try {
      await axios.post("http://localhost:3000/api/users/register", {
        name,
        email,
        password,
        phone,
        role,
        vehicle,
      });
      alert("User registered, please login");
      navigate("/login");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    }
  };

  return (
    <div className="auth-page">
      <form className="auth-form" onSubmit={handleSubmit}>
        <h2>Sign Up</h2>
        <input
          placeholder="name"
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
        <input
          placeholder="email"
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <input
          placeholder="phone"
          value={phone}
          onChange={(event) => setPhone(event.target.value)}
        />
        <select
          value={role}
          onChange={(event) => setRole(event.target.value)}
          required
        >
          <option value="">Select role</option>
          <option value="rider">Rider</option>
          <option value="driver">Driver</option>
        </select>
        {role === "driver" ? (
          <select
            placeholder="vehicle"
            value={vehicle}
            onChange={(event) => setVehicle(event.target.value)}
            required
          >
            <option value="">Select a vehicle</option>
            <option value="rider">4 seats</option>
            <option value="driver">6 seats</option>
          </select>
        ) : null}

        <button type="submit">Sign Up</button>
      </form>
    </div>
  );
}
export default SignUp;
