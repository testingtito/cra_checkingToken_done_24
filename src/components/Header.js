import React, { useContext } from 'react';
import StateContext from '../StateContext';
import { Link } from 'react-router-dom';
import HeaderLoggedOut from './HeaderLoggedOut';
import HeaderLoggedIn from './HeaderLoggedIn';

const Header = () => {

  const globalState = useContext(StateContext);
  return (
    <div>
      <header className="header-bar bg-primary mb-3">
        <div className="container d-flex flex-column flex-md-row align-items-center p-3">
          <h4 className="my-0 mr-md-auto font-weight-normal">
            <Link to="/" className="text-white">
              ComplexApp
            </Link>
          </h4>
          {globalState.loggedIn ?
            <HeaderLoggedIn /> :
            <HeaderLoggedOut />}
        </div>
      </header>
    </div>
  )
}

export default Header
