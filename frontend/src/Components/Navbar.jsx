import React from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'

const Navbar = () => {
  const isLoggedIn = localStorage.getItem('accessToken') ? true : false;
  const userRole = localStorage.getItem('userRole');
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

      <li><NavLink to="/questions" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Practice</NavLink></li>
      {!isLoggedIn  && (<li><NavLink to="/login" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Login</NavLink></li>)}

       {isLoggedIn &&  userRole === "CANDIDATE" &&(<li><NavLink to="/dashboard/candidate" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Dashboard</NavLink></li>)
}
        {isLoggedIn && userRole === "CANDIDATE"&& (<li><NavLink to="/history/candidate" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>History</NavLink></li>)
}
      {isLoggedIn && userRole === "HR" && ( <li><NavLink to="/dashboard/HR" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Dashboard</NavLink></li>
      )}

      {isLoggedIn && userRole === "HR" && (
        <li><NavLink to="/history/HR" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>History</NavLink></li>
      )}

      {isLoggedIn && userRole === "ADMIN" && (
        <li><NavLink to="/history/Admin" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>History</NavLink></li>
      )}
      </ul>
      {isLoggedIn && (
        <div className="nav-actions">
          <button className="logout-button">Logout</button>
        </div>
      )}
    </nav>
  )
}

export default Navbar