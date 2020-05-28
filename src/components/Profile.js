import React, { useEffect, useContext, useState } from 'react';
import Page from '../components/Page';
import { useParams } from 'react-router-dom';
import Axios from 'axios';
import StateContext from '../StateContext';
import ProfilePosts from './ProfilePosts';

const Profile = () => {
  // baseURL 뒤에 오는 모든 params를 destructuring하지만 그 중 username만을 원한다.
  const { username } = useParams();
  const globalState = useContext(StateContext);
  const [profileData, setProfileData] = useState({
    profileUsername: "...",
    profileAvatar: 'https://gravatar.com/avatar/placeholder?s=128',
    isFollowing: false,
    counts: { postCount: "", followerCount: "", followingCount: "" }
  }) // 이 후 re-render 될 때 이 값을 overwrite

  // 이 곳에서 그냥 Axios를 사용할 수 있지만, state나 props가 변할때마다 execute 되기 
  // 때문에 useEffect를 사용한다. 현재로서는 useEffect에서 async를 사용할 수 없다. 
  // 다음은 workaround: anonymous function안에 async function을 만들어 주고, 바로 call한다. 
  useEffect(() => {
    async function fetchData() {
      try {
        const response = await Axios.post(`/profile/${username}`, { token: globalState.user.token })
        setProfileData(response.data);
      } catch (e) {
        console.log("There was a problem.");
      }
    }
    fetchData()
  }, []); // runs only once
  return (
    <Page title="Profile Screen">
      <h2>
        <img className="avatar-small" src={profileData.profileAvatar} /> {profileData.profileUsername}
        <button className="btn btn-primary btn-sm ml-2">Follow <i className="fas fa-user-plus"></i></button>
      </h2>
      <div className="profile-nav nav nav-tabs pt-2 mb-4">
        <a href="#" className="active nav-item nav-link">
          Posts: {profileData.counts.postCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Followers: {profileData.counts.followerCount}
        </a>
        <a href="#" className="nav-item nav-link">
          Following:  {profileData.counts.followingCount}
        </a>
      </div>
      <ProfilePosts />
    </Page>
  )
}

export default Profile


