import React, { useContext } from 'react'
import { Link } from 'react-router-dom';
import DispatchContext from '../DispatchContext';
import StateContext from '../StateContext';
import ReactTooltip from 'react-tooltip';

const HeaderLoggedIn = () => {

  const globalDispatch = useContext(DispatchContext);
  const globalState = useContext(StateContext);

  const handleLogout = () => {
    globalDispatch({ type: "logout" });  // no more setLoggedIn(false);  
  }

  const handleSearchIcon = e => {
    e.preventDefault(); // don't want to navigate to #
    globalDispatch({ type: "openSearch" })
  }

  return (
    <div className="flex-row my-3 my-md-0">
      <a data-for="search" data-tip="Search" onClick={handleSearchIcon} href="#" className="text-white mr-2 header-search-icon">
        <i className="fas fa-search"></i>
      </a>
      <ReactTooltip place="bottom" id="search" className="custom-tooltip" />

      {" "}<span data-for="chat" data-tip="Chat" className="mr-2 header-chat-icon text-white">
        <i className="fas fa-comment"></i>
        <span className="chat-count-badge text-white"> </span>
      </span>
      <ReactTooltip place="bottom" id="chat" className="custom-tooltip" />

      {" "}<Link data-for="profile" data-tip="My Profile" to={`/profile/${globalState.user.username}`} className="mr-2">
        <img className="small-header-avatar" src={globalState.user.avatar} />
      </Link>
      <ReactTooltip place="bottom" id="profile" className="custom-tooltip" />

      {" "}<Link className="btn btn-sm btn-success mr-2" to="/create-post">
        Create Post
      </Link>
      {" "}<button onClick={handleLogout} className="btn btn-sm btn-secondary">
        Sign Out
          </button>
    </div>
  )
}

export default HeaderLoggedIn
