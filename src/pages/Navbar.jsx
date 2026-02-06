import React from 'react';
import { 
  Bell, 
  ChevronDown, 
} from 'lucide-react';
import CognizantLogo from '../assets/cognizant-logo.svg'; // Make sure this path is correct relative to Navbar.js
import ProfilePic from '../assets/Profile-Icon.png'

const Navbar = () => {
  return (
    <nav className="sar-navbar">
      <div className="nav-left">
        <div className="logo-wrap">
          <img src={CognizantLogo} alt='Cognizant Logo' className='logo-img'/>
        </div>
        <ul className="nav-links">
          <li className="nav-item active">Dashboard</li>
          {/* <li className="nav-item">SAR Narrative</li> */}
        </ul>
      </div>
      <div className="nav-right">
        <Bell className="nav-icon" size={20} />
        <div className="user-profile">
          <img src=
            {ProfilePic}
            alt="User" 
            className="avatar"
          />
          <ChevronDown size={16} color="#ccc" />
        </div>
      </div>
    </nav>
  );
};

export default Navbar;