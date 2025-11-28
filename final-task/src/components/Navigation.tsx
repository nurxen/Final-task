import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation: React.FC = () => {
  const location = useLocation();

  return (
    <nav className="navigation">
      <div className="nav-container">
        <h1 className="nav-title">Personal Trainer</h1>
        <ul className="nav-links">
          <li>
            <Link 
              to="/customers" 
              className={location.pathname === '/customers' ? 'active' : ''}
            >
              Customers
            </Link>
          </li>
          <li>
            <Link 
              to="/trainings" 
              className={location.pathname === '/trainings' ? 'active' : ''}
            >
              Trainings
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navigation;