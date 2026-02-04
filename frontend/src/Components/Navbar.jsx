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
        <li><Link to="/" className='nav-link'>Home</Link></li>
      {!isLogin && (<li><Link to="/login" className='nav-link'>Login</Link></li>)}
        <li><Link to="/dashboard" className='nav-link'>Dashboard</Link></li>
        <li><NavLink to="/history" className='nav-link'>History</NavLink></li>
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