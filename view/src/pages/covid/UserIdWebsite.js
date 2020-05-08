import React from 'react';
import Website from './Website';

// This is a wrapper component for the PeerStatus. It is responsible for getting the userId from the state or param
export default function UserIdWebsite(props) {
    let search = props.location.search;
    let params = new URLSearchParams(search);
    let userId = params.get('userId');
    if(userId == null && props.location.state) {
      userId = props.location.state.data.userId;
    }
    console.log("userId = ", userId);
    let wait;
    if(userId) {
        wait = (
            <Website {...props} userId = {userId} />
        )
    } else {
        wait = (
            <div>
                Please provide userId in the query parameter or location state.
            </div>
        )    
    }
    return (
      <div className="App">
        {wait}
      </div>
    );
}
  