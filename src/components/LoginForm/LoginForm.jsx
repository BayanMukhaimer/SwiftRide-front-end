import { useState } from 'react'
import { useNavigate } from 'react-router'
import axios from 'axios'


function LoginForm({ onLogin }) {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()

  const handleSubmit = async event => {
    event.preventDefault()
    try {
      const res = await axios.post('http://localhost:3000/api/users/login', {
        email,
        password
      })
      localStorage.setItem('token', res.data.token)
      onLogin(res.data.token)
      navigate('/')
    } catch (err) {
      alert(err.response?.data?.message || 'Login failed')
    }
  }

  return (
    <div className="auth-page">
    <form  className="auth-form" onSubmit={handleSubmit}>
      <h2>Login</h2>
      <input 
        placeholder="email"
        value={email}
        onChange={event => setEmail(event.target.value)}
      />
      <input 
        placeholder="Password"
        type="password"
        value={password}
        onChange={event => setPassword(event.target.value)}
      />
      <button type="submit">Login</button>
    </form>
    </div>
  )
}

export default LoginForm