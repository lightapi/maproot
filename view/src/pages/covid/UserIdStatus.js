import React from 'react';
import PeerStatus from './PeerStatus';

// This is a wrapper component for the PeerStatus. It is responsible for getting the userId from the state or param
export default function UserIdStatus(props) {
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
            <PeerStatus {...props} userId = {userId} isReadonly={true}/>
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
  