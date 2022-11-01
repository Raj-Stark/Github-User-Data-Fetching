import React, { useState, useEffect } from "react";
import mockUser from "./mockData.js/mockUser";
import mockRepos from "./mockData.js/mockRepos";
import mockFollowers from "./mockData.js/mockFollowers";
import axios from "axios";

const rootUrl = "https://api.github.com";

const GitHubContext = React.createContext();

const GithubProvider = ({ children }) => {
  const [githubUser, setGithubUser] = useState(mockUser);
  const [repos, setRepos] = useState(mockRepos);
  const [followers, setFollowers] = useState(mockFollowers);

  // ! Request Loading

  const [requests, setRequests] = useState(0);
  const [isLoading, setLoading] = useState(false);

  //  ! Error

  const [error, setError] = useState({ show: false, msg: "" });

  const searchGithubUser = async (user) => {
    setLoading(true);
    try {
      const response = await axios(`${rootUrl}/users/${user}`);

      console.log(response);

      if (response) {
        setGithubUser(response.data);

        const { login, followers_url } = response.data;

        const results = await Promise.allSettled([
          axios(`${rootUrl}/users/${login}/repos?per_page=100`),
          axios(`${followers_url}?per_page=100`),
        ]);

        const [repos, followers] = results;

        const status = "fulfilled";

        if (repos.status === status) {
          setRepos(repos.value.data);
        }

        if (followers.status === status) {
          setFollowers(followers.value.data);
        }

        console.log(results);

        // setRepos(repoData.data);

        // setFollowers(followerData.data);
      } else {
        toggleError(true, "There is no user with that Username");
      }

      setLoading(false);
    } catch (error) {
      console.log(error);
      toggleError(true, "There is no user with that Username");
      setLoading(false);
    }

    checkRequest();
  };

  const checkRequest = async () => {
    try {
      const res = await axios(`${rootUrl}/rate_limit`);

      let {
        rate: { remaining },
      } = res.data;

      if (remaining === 0) {
        toggleError(true, "You have exceeded hourly limit !");
      } else {
        setRequests(remaining);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const toggleError = (show = false, msg = "") => {
    console.log("Raj");
    setError({ show, msg });
  };

  useEffect(() => {
    checkRequest();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <GitHubContext.Provider
      value={{
        githubUser,
        repos,
        followers,
        requests,
        error,
        searchGithubUser,
        isLoading,
      }}
    >
      {children}
    </GitHubContext.Provider>
  );
};

const useGlobalContext = () => {
  return React.useContext(GitHubContext);
};

export { GithubProvider, GitHubContext, useGlobalContext };
