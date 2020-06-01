import React, { useContext, useEffect } from 'react'
import DispatchContext from '../DispatchContext';
import { useImmer } from 'use-immer';
import Axios from 'axios';
import { Link } from 'react-router-dom';

const Search = () => {
  const globalDispatch = useContext(DispatchContext);

  const [state, setState] = useImmer({
    searchTerm: '',
    results: [],
    show: 'neithter',
    requestCount: 0
  })

  useEffect(() => {
    // telling the web browser's overall document object to listen for keypresses.
    // keyup event가 일어날 때마다, searchKeyPressHandler를 execute한다. 
    document.addEventListener("keyup", searchKeyPressHandler);

    // When this component is first rendered, we're adding a keyboard listener event to 
    // the browser. However, what happens when this component is unmounted or removed from 
    // the screen? if someone opens the search and then closes it, we wouldn't want to
    // keep listening for that keyboard press.
    return () => {
      document.removeEventListener("keyup", searchKeyPressHandler);
    };
  }, []);

  // for delay
  useEffect(() => {
    if (state.searchTerm.trim()) {//white space도 해결
      setState(draft => {
        draft.show = 'loading'
      })
      // We want to clean up all the key storks before 750ms, so use cleanup function
      // 즉 750ms동안 type하지 않고 delay를 해야만 requestCount가 increment 된다. 
      const delay = setTimeout(() => {
        setState(draft => {
          draft.requestCount++;
        })
      }, 750)

      // run the cleanup 
      return () => clearTimeout(delay);
    } else {
      setState(draft => {
        draft.show = 'neither'
      })
    }
  }, [state.searchTerm]);

  // For axios request
  useEffect(() => {
    if (state.requestCount) {
      // create a variable that will store cancel token, so we can cancel the Axios requst
      // if this component unmounts in the middle of the request
      const ourRequest = Axios.CancelToken.source();
      async function fetchResults() {
        try {
          // 1st argument: path 2nd argument: the data we want to send along 3rd argument: cancel toekn
          const response = await Axios.post('/search', { searchTerm: state.searchTerm }, { cancelToken: ourRequest.token });
          setState(draft => {
            draft.results = response.data;
            draft.show = 'results';
          })
        } catch (e) {
          console.log("There was a problem or the request was cancelled.");
        }
      }
      fetchResults();
      return () => ourRequest.cancel();
    }
  }, [state.requestCount]);

  const searchKeyPressHandler = e => {
    if (e.keyCode == 27) { // when Esc key is pressed
      globalDispatch({ type: "closeSearch" })
    }
  }

  const handleInput = e => {
    const value = e.target.value;
    setState(draft => {
      draft.searchTerm = value;
    })
  }

  return (
    <div className="search-overlay">
      <div className="search-overlay-top shadow-sm">
        <div className="container container--narrow">
          <label htmlFor="live-search-field" className="search-overlay-icon">
            <i className="fas fa-search"></i>
          </label>

          <input onChange={handleInput} autoFocus type="text" autoComplete="off" id="live-search-field" className="live-search-field" placeholder="What are you interested in?" />
          <span onClick={() => globalDispatch({ type: "closeSearch" })} className="close-live-search">
            <i className="fas fa-times-circle"></i>
          </span>
        </div>
      </div>

      <div className="search-overlay-bottom">
        <div className="container container--narrow py-3">
          <div className={"circle-loader " + (state.show == "loading" ? 'circle-loader--visible' : '')}></div>
          <div className={"live-search-results " + (state.show == 'results' ? 'live-search-results--visible' : '')} >
            {Boolean(state.results.length) && (
              <div className="list-group shadow-sm">
                <div className="list-group-item active">
                  <strong>Search Results</strong>
            ({state.results.length} {state.results.length > 1 ? 'items' : 'item'} found)
            </div>
                {
                  state.results.map(post => {
                    const date = new Date(post.createdDate)
                    const dateFormatted = `${date.getMonth() + 1}/${date.getDate()}/${date.getYear()}`
                    return (
                      <Link onClick={() => globalDispatch({ type: "closeSearch" })} key={post._id} to={`/post/${post._id}`} className="list-group-item list-group-item-action">
                        <img className="avatar-tiny" src={post.author.avatar} /> <strong>{post.title}</strong>{" "}
                        <span className="text-muted small">by {post.author.username} on {dateFormatted} </span>
                      </Link>
                    )
                  })
                }
              </div>
            )}
            {
              !Boolean(state.results.length) &&
              <p className="alert alert-danger text-center shadow-sm">Sorry, we could not find any results for that search.</p>
            }
          </div>
        </div>
      </div>
    </div>
  )
}

export default Search
