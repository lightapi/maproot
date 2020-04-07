import React from "react";
import { useCookies } from 'react-cookie';

var UserStateContext = React.createContext();
var UserDispatchContext = React.createContext();

function userReducer(state, action) {
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: true };
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false };
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function UserProvider({ children }) {
  console.log("UserProvider is called...................................");
  const [cookie, setCookie] = useCookies(['userId']);
  var [state, dispatch] = React.useReducer(userReducer, {
    isAuthenticated: !!cookie.userId,
    userId: cookie.userId,
    roles: cookie.roles || "user orgadm admin",   // TODO remove the default value
  });

  return (
    <UserStateContext.Provider value={state}>
      <UserDispatchContext.Provider value={dispatch}>
        {children}
      </UserDispatchContext.Provider>
    </UserStateContext.Provider>
  );
}

function useUserState() {
  var context = React.useContext(UserStateContext);
  if (context === undefined) {
    throw new Error("useUserState must be used within a UserProvider");
  }
  return context;
}

function useUserDispatch() {
  var context = React.useContext(UserDispatchContext);
  if (context === undefined) {
    throw new Error("useUserDispatch must be used within a UserProvider");
  }
  return context;
}

export { UserProvider, useUserState, useUserDispatch, loginUser, signOut, signUp, changePassword, getProfile };

// ###########################################################

function loginUser(dispatch, login, password, history, setIsLoading, setError) {
  setError(false);
  setIsLoading(true);

  if (!!login && !!password) {
    setTimeout(() => {
      localStorage.setItem('id_token', 1)
      setError(null)
      setIsLoading(false)
      dispatch({ type: 'LOGIN_SUCCESS' })
      history.push('/app/dashboard')
    }, 2000);
  } else {
    dispatch({ type: "LOGIN_FAILURE" });
    setError(true);
    setIsLoading(false);
  }
}

function signOut(dispatch, history) {
    dispatch({ type: "SIGN_OUT_SUCCESS" });
    fetch("/logout", { credentials: 'include'})
    .then(response => {
      if(response.ok) {
        history.push("/app/dashboard");
      } else {
        throw Error(response.statusText);
      }
    })
    .catch(error => {
        console.log("error=", error);
    });
}

function changePassword(dispatch, history) {
  console.log("changePassword is called");
  history.push("/app/form/changePasswordForm");
}

function signUp(dispatch, history) {
  console.log("signUp is called");
  history.push("/app/form/signupForm");
}

function getProfile(dispatch, history) {
  console.log("getProfile is called");
  history.push("/app/profile");
}

