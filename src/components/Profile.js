import React, { useEffect, useContext } from 'react';
import Page from '../components/Page';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import StateContext from '../StateContext';
import ProfilePosts from './ProfilePosts';
import { useImmer } from 'use-immer';

const Profile = () => {
  // baseURL 뒤에 오는 모든 params를 destructuring하지만 그 중 username만을 원한다.
  const { username } = useParams();
  const globalState = useContext(StateContext);
  const [state, setState] = useImmer({
    followActionLoading: false,
    startFollowingRequestCount: 0,
    stopFollowingRequestCount: 0,
    profileData: {
      profileUsername: "...",
      profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
      isFollowing: false,
      counts: { postCount: "", followerCount: "", followingCount: "" }
    }
  })// 이 후 re-render 될 때 이 값을 overwrite

  // 이 곳에서 그냥 Axios를 사용할 수 있지만, state나 props가 변할때마다 execute 되기 
  // 때문에 useEffect를 사용한다. 현재로서는 useEffect에서 async를 사용할 수 없다. 
  // 다음은 workaround: anonymous function안에 async function을 만들어 주고, 바로 call한다. 
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: globalState.user.token })
        setState(draft => {
          draft.profileData = response.data;
        })
        //setProfileData(response.data);
      } catch (e) {
        console.log("There was a problem.");
      }
    }
    fetchData()
  }, [username]); // execute whenever username changes

  // For Start Following
  useEffect(() => {
    if (state.startFollowingRequestCount) { //if greater than 0
      // when first it happens the button should be grayed out
      setState(draft => {
        draft.followActionLoading = true;
      })
      async function fetchData() {
        try {
          const response = await Axios.post(
            `/addFollow/${state.profileData.profileUsername}`,
            { token: globalState.user.token })

          // once the requst has completed
          setState(draft => {
            draft.profileData.isFollowing = true;
            draft.profileData.counts.followerCount++;
            draft.followActionLoading = false;
          })
        } catch (e) {
          console.log("There was a problem.");
        }
      }
      fetchData()
    }
  }, [state.startFollowingRequestCount]);

  // For Stop Following
  useEffect(() => {
    if (state.stopFollowingRequestCount) { //if greater than 0
      // when first it happens the button should be grayed out
      setState(draft => {
        draft.followActionLoading = true;
      })
      async function fetchData() {
        try {
          const response = await Axios.post(
            `/removeFollow/${state.profileData.profileUsername}`,
            { token: globalState.user.token })

          // once the requst has completed
          setState(draft => {
            draft.profileData.isFollowing = false;
            draft.profileData.counts.followerCount--;
            draft.followActionLoading = false;
          })
        } catch (e) {
          console.log("There was a problem.");
        }
      }
      fetchData()
    }
  }, [state.stopFollowingRequestCount]);

  const startFollowing = () => {
    setState(draft => {
      draft.startFollowingRequestCount++;
    })
  }
  const stopFollowing = () => {
    setState(draft => {
      draft.stopFollowingRequestCount++;
    })
  }
  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={state.profileData.profileAvatar} /> {state.profileData.profileUsername}

        {/* 1. loggedIn 되어 있어야 함. 2. user를 이미 follow하고 있으면 안 됨. 3. 자신을 follow할 수 없슴
            4. Profile이 처음 loading될 때, ... 이 아닐 때만 button이 display 되어야 한다.  */}
        {
          globalState.loggedIn &&
          !state.profileData.isFollowing &&
          globalState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != '...' && (
            <button
              onClick={startFollowing}
              disabled={state.followActionLoading}
              className="btn btn-primary btn-sm ml-2">Follow <i className="fas fa-user-plus"></i></button>
          )
        }
        {
          globalState.loggedIn &&
          state.profileData.isFollowing &&
          globalState.user.username != state.profileData.profileUsername &&
          state.profileData.profileUsername != '...' && (
            <button
              onClick={stopFollowing}
              disabled={state.followActionLoading}
              className="btn btn-danger btn-sm ml-2">Stop Following <i className="fas fa-user-times"></i></button>
          )
        }

      </h2>
      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <a href="#" className="active nav-item nav-link">
          Posts: {state.profileData.counts.postCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Followers: {state.profileData.counts.followerCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Following:  {state.profileData.counts.followingCount}
        </a>
      </div>
      <ProfilePosts />
    </Page>
  )
}

export default Profile


