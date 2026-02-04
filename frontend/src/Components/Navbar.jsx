import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const isLogin = localStorage.getItem('accessToken') ? true : false;
  return (
    <nav className='navbar'>
      <div className='logo-section'>
        <div className='logo'>LI</div>
        <span className='brand-name'>LiveInterview</span>
      </div>
      
      <ul className='nav-links'>
        <li><NavLink to="/"  className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Home</NavLink></li>

      {!isLogin && (<li><NavLink to="/login" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Login</NavLink></li>)}

        <li><NavLink to="/dashboard" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Dashboard</NavLink></li>

        <li><NavLink to="/history" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>History</NavLink></li>
      </ul>
      {isLogin && (
        <div className="nav-actions">
          <button className="logout-button">Logout</button>
        </div>
      )}
    </nav>
  )
}

export default Navbar