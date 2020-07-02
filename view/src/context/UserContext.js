import React from "react";
import Cookies from 'universal-cookie'

var UserStateContext = React.createContext();
var UserDispatchContext = React.createContext();

function userReducer(state, action) {
  console.log("state = ", state);
  console.log("action = ", action);
  switch (action.type) {
    case "LOGIN_SUCCESS":
      return { ...state, isAuthenticated: action.isAuthenticated, email: action.email, roles: action.roles};
    case "SIGN_OUT_SUCCESS":
      return { ...state, isAuthenticated: false, email: null, userId: null, roles: null };
    case "UPDATE_PROFILE":
      return { ...state, userId: action.userId }
    default: {
      throw new Error(`Unhandled action type: ${action.type}`);
    }
  }
}

function UserProvider({ children }) {
  console.log("UserProvider is called...");
  const cookies = new Cookies();
  const email = cookies.get('userId');
  var [state, dispatch] = React.useReducer(userReducer, {
    isAuthenticated: !!email,
    email: email,
    userId: null,
    roles: cookies.get('roles')
  });

  if(email == null) {
    // send a fake request to server to renew the access token from refreshToken 
    // in case you have set the remember me to true during login. 
    console.log("email is null, renew the token...");
    const cmd = {
      host: 'lightapi.net',
      service: 'user',
      action: 'getNonceByEmail',
      version: '0.1.0',
      data: { email: 'fake' }
    };

    const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
    const headers = {};
    const fetchData = async () => {
      try {
        const response = await fetch(url, { headers, credentials: 'include' });
        const data = await response.json();
        //console.log("data = ", data);
        //console.log("userId = " + cookies.get('userId'));
        if(data.statusCode === 404) {
          // if other errors, then there would be no cookies. Only 404 is the right response in this case.
          // if we don't check the status code and blindly dispatch, we will go into a dead loop as there is userId available.
          dispatch({ type: "LOGIN_SUCCESS", isAuthenticated: !!cookies.get('userId'), email: cookies.get('userId'), roles: cookies.get('roles') });
        }        
      } catch (e) {
        console.log(e);
      }
    };
    fetchData();
  } 

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

export { UserProvider, useUserState, useUserDispatch, loginUser, signOut, signUp, changePassword, getProfile, getPayment, updateRoles, getOrders, hostForm };

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

function getPayment(dispatch, history) {
  history.push("/app/payment");
}

function updateRoles(dispatch, history) {
  history.push("/app/updateRoles");
}

function getOrders(dispatch, history) {
  history.push("/app/userOrders");
}

function hostForm(dispatch, history) {
  history.push("/app/form/hostForm");
}
