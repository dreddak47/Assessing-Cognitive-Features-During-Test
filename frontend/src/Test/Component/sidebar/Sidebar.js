import React, { useState } from 'react';
import './sidebar.css';
import { useNavigate } from 'react-router-dom';

const Sidebar=({Totaltime,name,handleEndTestClick}) => {
  const [isOpen, setIsOpen] = useState(false);
  const navigate = useNavigate();

  // Toggle the sidebar collapse
  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  

  return (
    <div className={isOpen ? 'sidebar open' : 'sidebar collapsed'}>
        <h3 className="testdetails">{isOpen ? 'Test Details' : ''}</h3>
      <button className="toggle-btn" onClick={toggleSidebar}>
        {isOpen ? '←' : '='}
      </button>
    
      <nav className="nav-menu">
        <ul>
        {isOpen ? <li><a>Name: {name}</a></li> : ``}
          <li>
            <a>{isOpen ? 'Time Left :  ' : ''}{Math.floor(Totaltime / 60) }m {Totaltime % 60 }s</a>
          </li>
            <li>
                <a className="endtest"  onClick={handleEndTestClick}>End Test</a>
            </li>
          
        </ul>
      </nav>
    </div>
    
  );
}

export default Sidebar;
