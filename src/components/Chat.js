import React, { useContext, useEffect, useRef } from 'react';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';
import { useImmer } from 'use-immer';
import io from 'socket.io-client';
import { Link } from 'react-router-dom';
// this will establish an ongoing connection between the browser and our backend server
const socket = io("http://localhost:9876");

const Chat = () => {
  const chatField = useRef(null);
  const chatLog = useRef(null);
  const globalState = useContext(StateContext);
  const globalDispatch = useContext(DispatchContext);
  const [state, setState] = useImmer({
    fieldValue: '',
    chatMessage: []
  })

  useEffect(() => {
    if (globalState.isChatOpen) {
      chatField.current.focus();
      // when the chat is opened, clear the UnreadChatCount
      globalDispatch({ type: "clearUnreadChatCount" });
    }
  }, [globalState.isChatOpen]);

  useEffect(() => {
    // the 1st arg: the name of the type of event that server just emitted to us.
    // the 2dn arg: the function that will run anytime this happens.
    socket.on("chatFromServer", message => {
      setState(draft => {
        draft.chatMessage.push(message);
      })
    })
  }, []);

  // for scrolling
  useEffect(() => {
    chatLog.current.scrollTop = chatLog.current.scrollHeight;
    // if chatMessage length is greater than 0 and Chat window is closed
    if (state.chatMessage.length && !globalState.isChatOpen) {
      globalDispatch({ type: "incrementUnreadChatCount" })
    }
  }, [state.chatMessage]); //anytime a new message is pushed

  const handleFieldChange = e => {
    const value = e.target.value;

    setState(draft => {
      // 여기서 바로 e.target.value를 사용할 수 있지만, e.target.value가 
      // 또 다른 function 안에서는 available하지 않다. 
      draft.fieldValue = value;
    })
  }

  const handleSubmit = e => {
    e.preventDefault();
    //Send message to chat server. 
    // We are sending this(chatFromBrowser) type of event
    // Backend에 chatFromBrowser라는 event type을 이미 만들어 놓았다. 
    socket.emit("chatFromBrowser", {
      message: state.fieldValue,
      token: globalState.user.token
    })
    // now when we send the msg to the server, the server is going to turn around
    // and broadcast that out to any and all other connected users on our web iste.
    // so just our server is listening for an event named chat from browser, we would 
    // now on our frontend to begin listening for an event named chatFromServer
    // we don't want to begin listening for that the very first time this component renders.
    // => useEffect

    setState(draft => {
      // Add message to state collection of messages
      draft.chatMessage.push({
        message: draft.fieldValue,
        username: globalState.user.username,
        avatar: globalState.user.avatar
      })
      draft.fieldValue = '';
    })
  }

  return (
    <div
      id="chat-wrapper"
      className={"chat-wrapper shadow border-top border-left border-right " +
        (globalState.isChatOpen ? "chat-wrapper--is-visible" : "")}>
      <div className="chat-title-bar bg-primary">
        Chat
        <span
          onClick={() => globalDispatch({ type: "closeChat" })}
          className="chat-title-bar-close">
          <i className="fas fa-times-circle"></i>
        </span>
      </div>
      <div id="chat" className="chat-log" ref={chatLog}>
        {state.chatMessage.map((message, index) => {
          if (message.username == globalState.user.username) {
            return (
              <div key={index} className="chat-self">
                <div className="chat-message">
                  <div className="chat-message-inner">{message.message}</div>
                </div>
                <img
                  className="chat-avatar avatar-tiny"
                  src={message.avatar} />
              </div>
            )
          }
          return (
            <div key={index} className="chat-other">
              <Link to={`/profile/${message.username}`}>
                <img className="avatar-tiny"
                  src={message.avatar} />
              </Link>
              <div className="chat-message">
                <div className="chat-message-inner">
                  <Link to={`/profile/${message.username}`}>
                    <strong>{message.username}:  </strong>
                  </Link>
                  {message.message}
                </div>
              </div>
            </div>
          )
        })}



      </div>
      <form onSubmit={handleSubmit} id="chatForm" className="chat-form border-top">
        <input
          value={state.fieldValue}
          onChange={handleFieldChange}
          ref={chatField}
          type="text"
          className="chat-field"
          id="chatField"
          placeholder="Type a message…"
          autoComplete="off" />
      </form>
    </div>
  )
}

export default Chat
