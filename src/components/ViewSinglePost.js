import React, { useState, useEffect, useContext } from 'react'
import Page from './Page';
import Axios from 'axios';
import { useParams, Link, withRouter } from 'react-router-dom';
import LoadingDotsIcon from './LoadingDotsIcon';
import ReactMarkdown from 'react-markdown';
import ReactTooltip from 'react-tooltip';
import NotFound from './NotFound';
import StateContext from '../StateContext';
import DispatchContext from '../DispatchContext';

const ViewSinglePost = (props) => {
  const globalState = useContext(StateContext);
  const globalDispatch = useContext(DispatchContext);

  const { id } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [post, setPost] = useState();

  useEffect(() => {
    const ourRequest = Axios.CancelToken.source()

    async function fetchPost() {
      try {
        const response = await Axios.get(`/post/${id}`, { cancelToken: ourRequest.token });
        setPost(response.data);
        setIsLoading(false);
      } catch (e) {
        console.log("There was a problem or the request was cancelled.");
      }
    }
    fetchPost();
    // We cancel Axios function.
    return () => {
      ourRequest.cancel();
    }
  }, [id]);

  // loading has completed and post is still undefined, 
  // if the server didn't enter anything into it like an object to a post, 
  // this would mean that the server couldn't find anything
  if (!isLoading && !post) {
    return <NotFound />
  }

  if (isLoading)
    return (
      <Page title="...">
        <LoadingDotsIcon />
      </Page>

    )

  const date = new Date(post.createdDate)
  const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getYear()}`

  const isOwner = () => {
    if (globalState.loggedIn) {
      return globalState.user.username == post.author.username;
    }
    return false;
  }
  const deleteHandler = async () => {
    const areYouSure = window.confirm("Do you really want to delete this post?");
    if (areYouSure) {
      try {
        const response = await Axios.delete(`/post/${id}`, { data: { token: globalState.user.token } })
        if (response.data == "Success") {
          // 1. display a flash message
          globalDispatch({ type: "flashMessage", value: "Post was successfully deleted." })

          // 2. redirect back to the current user's profile
          props.history.push(`/profile/${globalState.user.username}`)
        }
      } catch (e) {
        console.log("There was a problem.")
      }
    }
  }
  return (
    <Page title={post.title}>
      <div className="d-flex justify-content-between">
        <h2>{post.title}</h2>
        {
          isOwner() && (
            <span className="pt-2">
              <Link to={`/post/${post._id}/edit`} data-tip="Edit" data-for="edit" className="text-primary mr-2">
                <i className="fas fa-edit"></i>
              </Link>
              <ReactTooltip id="edit" className="custom-tooltip" />{" "}
              <a onClick={deleteHandler} data-tip="Delete" data-for="delete" className="delete-post-button text-danger">
                <i className="fas fa-trash"></i>
              </a>
              <ReactTooltip id="delete" className="custom-tooltip" />
            </span>
          )
        }
      </div>

      <p className="text-muted small mb-4">
        <Link to={`/profile/${post.author.username}`}>
          <img className="avatar-tiny" src={post.author.avatar} />
        </Link>
        Posted by <Link to={`/profile/${post.author.username}`}>
          {post.author.username}</Link> on {dateFormatted}
      </p>

      <div className="body-content">
        <ReactMarkdown
          source={post.body}
          allowedTypes={["paragraph", "strong", "emphasis", "text", "heading", "list", "listItem"]}
        />
      </div>
    </Page>
  )
}

export default withRouter(ViewSinglePost)
