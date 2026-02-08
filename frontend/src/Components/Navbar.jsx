import React, { use } from 'react'
import { Link, NavLink } from 'react-router-dom'
import './Navbar.css'
import { useAuth } from './AuthProvider'

const Navbar = () => {
  const { user, role, clearAuth } = useAuth();
  const isLoggedIn = !!user;
  const userRole = role;
  const handleLogout = () => {
    clearAuth();
  }
  return (
    <nav className='navbar'>
      <div className='logo-section'>
        <div className='logo' onClick={() => window.location.href = '/'}>LI</div>
        <span className='brand-name' onClick={() => window.location.href = '/'} >LiveInterview</span>
      </div>

      <ul className='nav-links'>
        <li><NavLink to="/" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Home</NavLink></li>

        {userRole !== "HR" && (<li><NavLink to="/questions" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Practice</NavLink></li>)
        }

        {!isLoggedIn && (<li><NavLink to="/login" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Login</NavLink></li>)}
        {isLoggedIn && userRole === "HR" && (
          <li><NavLink to="/interviewschedule" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>Schedule</NavLink></li>
        )}
        {isLoggedIn && userRole === "HR" && (
          <li><NavLink to="/history/HR" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>History</NavLink></li>
        )}
        {isLoggedIn && userRole === "HR" && (<li><NavLink to="/dashboard/HR" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Dashboard</NavLink></li>
        )}
        {isLoggedIn && userRole === "ADMIN" && (
          <li><NavLink to="/dashboard/Admin" className={({ isActive }) =>
            isActive ? "nav-link active" : "nav-link"
          }>Dashboard</NavLink></li>
        )}
         {isLoggedIn && userRole === "CANDIDATE" && (<li><NavLink to="/history/candidate" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>History</NavLink></li>)
        }
        {isLoggedIn && userRole === "CANDIDATE" && (<li><NavLink to="/dashboard/candidate" className={({ isActive }) =>
          isActive ? "nav-link active" : "nav-link"
        }>Dashboard</NavLink></li>)
        }
       
      

      </ul>
      {isLoggedIn && (
        <div className="nav-actions">
          <button className="logout-button" onClick={handleLogout}>Logout</button>
        </div>
      )}
    </nav>
  )
}

export default Navbar