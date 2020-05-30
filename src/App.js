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
    }
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
          </Switch>
          <Footer />
        </BrowserRouter>
      </DispatchContext.Provider>
    </StateContext.Provider>
  )
}

export default App
