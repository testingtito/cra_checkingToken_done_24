import React, { useState, useEffect, useContext } from 'react'
import Page from './Page';
import Axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import LoadingDotsIcon from './LoadingDotsIcon';
import { useImmerReducer } from 'use-immer';
import StateContext from "../StateContext";
import DispatchContext from '../DispatchContext'

const EditPost = () => {
  const globalState = useContext(StateContext);
  const globalDispatch = useContext(DispatchContext);

  const initialState = {
    title: {
      value: "",
      hasErrors: false,
      message: ""
    },
    body: {
      value: "",
      hasErrors: false,
      message: ""
    },
    isFetching: true,
    isSaving: false,
    id: useParams().id,
    sendCount: 0
  }

  const ourReducer = (draft, action) => {
    switch (action.type) {
      case "fetchComplete":
        draft.title.value = action.value.title;
        draft.body.value = action.value.body;
        draft.isFetching = false;
        return;
      case "titleChange":
        draft.title.value = action.value;
        return;
      case "bodyChange":
        draft.body.value = action.value;
        return;
      case "submitRequest":
        draft.sendCount++;
        return;
      case "saveRequestStarted":
        draft.isSaving = true;
        return;
      case "saveRequestFinished":
        draft.isSaving = false;
        return
      default:
        return draft;
    }
  }

  const [state, dispatch] = useImmerReducer(ourReducer, initialState);

  const submitHandler = e => {
    e.preventDefault();
    dispatch({ type: "submitRequest" })
  }

  // for Read-only request. Bring up the title and body from existing post to the current post
  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()
    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${state.id}`, { cancelToken: ourRequest.token });
        dispatch({ type: "fetchComplete", value: response.data })
      } catch (e) {
        console.log("There was a problem or the request was cancelled.");
      }
    }
    fetchPost();
    // We cancel Axios function.
    return () => {
      ourRequest.cancel();
    }
  }, []);


  // execute when sendCount changes and it's greater than 0
  useEffect(() => {
    if (state.sendCount) { // when greater than 0
      dispatch({ type: "saveRequestStarted" });
      const ourRequest = Axios.CancelToken.source()
      async function fetchPost() {
        try {
          const response = await Axios.post(
            `/post/${state.id}/edit`,
            { title: state.title.value, body: state.body.value, token: globalState.user.token },
            { cancelToken: ourRequest.token });
          dispatch({ type: "saveRequestFinished" })
          globalDispatch({ type: "flashMessage", value: "Post was updated." })
        } catch (e) {
          console.log(e.message);
          console.log("There was a problem or the request was cancelled.");
        }
      }
      fetchPost();
      // We cancel Axios function.
      return () => {
        ourRequest.cancel();
      }
    }
  }, [state.sendCount]);

  if (state.isFetching)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>
    )

  return (
    <Page title="EidtPost">
      <form onSubmit={submitHandler}>
        <div className="form-group">
          <label htmlFor="post-title" className="text-muted mb-1">
            <small>Title</small>
          </label>
          <input
            onChange={e => dispatch({ type: "titleChange", value: e.target.value })}
            value={state.title.value}
            autoFocus name="title"
            id="post-title"
            className="form-control form-control-lg form-control-title"
            type="text"
            placeholder=""
            autoComplete="off" />
        </div>

        <div className="form-group">
          <label htmlFor="post-body" className="text-muted mb-1 d-block">
            <small>Body Content</small>
          </label>
          <textarea
            onChange={e => dispatch({ type: "bodyChange", value: e.target.value })}
            name="body"
            id="post-body"
            className="body-content tall-textarea form-control"
            type="text"
            value={state.body.value}
          />
        </div>
        <button className="btn btn-primary" disabled={state.isSaving}>Save Updates</button>
      </form>
    </Page>
  )
}

export default EditPost
