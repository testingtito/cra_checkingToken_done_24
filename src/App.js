import React, { useState, useReducer, useEffect } from 'react'
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import Header from './components/Header';
import HomeGuest from './components/HomeGuest';
import Home from './components/Home';
import Footer from './components/Footer';
import About from './components/About';
import Terms from './components/Terms';
import CreatePost from './components/CreatePost';
import ViewSinglePost from './components/ViewSinglePost';
import FlashMessages from './components/FlashMessages';
import Profile from './components/Profile';
import StateContext from './StateContext';
import DispatchContext from './DispatchContext';
import { useImmerReducer } from 'use-immer'
import './App.css';
import Axios from 'axios';
import EditPost from './components/EditPost';
import NotFound from './components/NotFound';
import Search from './components/Search';
import Chat from './components/Chat';
import { CSSTransition } from 'react-transition-group';

Axios.defaults.baseURL = "http://localhost:9876";

const App = () => {
  const initialState = {
    loggedIn: Boolean(localStorage.getItem("complexappToken")),
    flashMessages: [],
    // the idea here is that we now have this user object that will be available in 
    // our global state. So now any other component that needs to access this data
    // will no longer need to talk to the browser's local storage.
    // it can just find these values in state.
    user: {
      token: localStorage.getItem("complexappToken"),
      username: localStorage.getItem("complexappUsername"),
      avatar: localStorage.getItem("complexappAvatar"),
    },
    isSearchOpen: false,
    isChatOpen: false,
    unreadChatCount: 0
  };

  // Reducer function: this is where you would actually say how these things happen or
  // how the state data of our application should change for these particular actions.
  // We ultimately want this function to return the new state value.
  // draft (from useImmerReducer) is a clone copy of state that we can modify freely.
  const ourReducer = (draft, action) => {
    switch (action.type) {
      case "login":
        draft.loggedIn = true;
        draft.user = action.data
        return;
      case "logout":
        draft.loggedIn = false
        return;
      case "flashMessage":
        draft.flashMessages.push(action.value)
        return;
      case "openSearch":
        draft.isSearchOpen = true;
        return;
      case "toggleChat":
        draft.isChatOpen = !draft.isChatOpen;
        return;
      case "closeChat":
        draft.isChatOpen = false;
        return;
      case "incrementUnreadChatCount":
        draft.unreadChatCount++;
        return;
      case "clearUnreadChatCount":
        draft.unreadChatCount = 0;
        return;
      default:
        return draft;
    };
  }

  // Dispatch is something that you can use to call an update state
  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  useEffect(() => {
    if (state.loggedIn) {
      localStorage.setItem("complexappToken", state.user.token);
      localStorage.setItem("complexappUsername", state.user.username);
      localStorage.setItem("complexappAvatar", state.user.avatar);
    } else {
      localStorage.removeItem("complexappToken");
      localStorage.removeItem("complexappUsername");
      localStorage.removeItem("complexappAvatar");
    }
  }, [state.loggedIn]);

  // Check if token has expired or not on first render
  useEffect(() => {
    if (state.loggedIn) {
      // create a variable that will store cancel token, so we can cancel the Axios requst
      // if this component unmounts in the middle of the request
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          // 1st argument: path 2nd argument: the data we want to send along 3rd argument: cancel toekn
          // true is a valid token, the second is not.
          const response = await Axios.post(
            '/checkToken',
            { token: state.user.token },
            { cancelToken: ourRequest.token });

          if (!response.data) { // if the token is not valid
            // make a use log out and show the flash message
            dispatch({ type: "logout" });
            dispatch({ type: "flashMessage", value: "Your session has expired. Please log in again." });
          }
        } catch (e) {
          console.log("There was a problem or the request was cancelled.");
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, []);


  return (
    <StateContext.Provider value={state}>
      <DispatchContext.Provider value={dispatch}>
        <BrowserRouter>
          <FlashMessages flashMessages={state.flashMessages} />
          <Header />
          <Switch>
            <Route path='/profile/:username'>
              <Profile />
            </Route>
            <Route path='/' exact>
              {state.loggedIn ? <Home /> : <HomeGuest />}
            </Route>
            <Route path='/post/:id' exact>
              <ViewSinglePost />
            </Route>
            <Route path='/post/:id/edit' exact>
              <EditPost />
            </Route>
            <Route path='/create-post'>
              <CreatePost />
            </Route>
            <Route path='/about-us'>
              <About />
            </Route>
            <Route path='/terms'>
              <Terms />
            </Route>
            <Route>
              <NotFound />
            </Route>
          </Switch>
          <CSSTransition
            timeout={330}
            in={state.isSearchOpen}
            classNames="search-overlay"
            unmountOnExit>
            <Search />
          </CSSTransition>
          <Chat />
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export default App
