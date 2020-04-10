import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
} from "@material-ui/core";
import {
  NotificationsNone as NotificationsIcon,
} from "@material-ui/icons";
import { Badge } from "../Wrappers/Wrappers";
import Notification from "../Notification/Notification";
import { useUserState } from "../../context/UserContext";
import { useApiGet } from '../../hooks/useApiGet';
import CircularProgress from '@material-ui/core/CircularProgress';

/*
const notifications = [
  { 
    nonce: 0, 
    app: "user",
    name: "UserCreatedEvent",
    success: true,
    timestamp: 1586491620047
  },  
  {
    nonce: 1,
    app: "user",
    name: "UserUpdatedEvent",
    success: false,
    timestamp: 1586491620047
  },
  {
    nonce: 2,
    app: "covid",
    name: "CovidEntityUpdatedEvent",
    success: true,
    timestamp: 1586491620047
  },
  {
    nonce: 3,
    app: "covid",
    name: "CovidEntityUpdatedEvent",
    success: false,
    timestamp: 1586491620047
  },
];
*/

export default function NotificationMenu(props) {
    var [notificationsMenu, setNotificationsMenu] = useState(null);
    var [isNotificationsUnread, setIsNotificationsUnread] = useState(true);
    var classes = props.classes;
    var { userId } = useUserState();
    const cmd = {
      host: 'lightapi.net',
      service: 'user',
      action: 'getNotification',
      version: '0.1.0',
      data: { email: userId }
    };

    const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
    const headers = {};
    const { isLoading, data, error } = useApiGet({url, headers});
    console.log("data", data);
    console.log("error", error);
    console.log("isLoading", isLoading);
    let wait;
    if(isLoading) {
      wait = <div><CircularProgress/></div>;
    } else {
      wait = (
        <React.Fragment>
        <IconButton
          color="inherit"
          aria-haspopup="true"
          aria-controls="mail-menu"
          onClick={e => {
            setNotificationsMenu(e.currentTarget);
            setIsNotificationsUnread(false);
          }}
          className={classes.headerMenuButton}
        >
          <Badge
            badgeContent={isNotificationsUnread ? data.length : null}
            color="warning"
          >
            <NotificationsIcon classes={{ root: classes.headerIcon }} />
          </Badge>
        </IconButton>
        <Menu
          id="notifications-menu"
          open={Boolean(notificationsMenu)}
          anchorEl={notificationsMenu}
          onClose={() => setNotificationsMenu(null)}
          className={classes.headerMenu}
          disableAutoFocusItem
        >
          {data.map(notification => (
            <MenuItem
              key={notification.nonce}
              onClick={() => setNotificationsMenu(null)}
              className={classes.headerMenuItem}
            >
              <Notification {...notification} typographyVariant="inherit" />
            </MenuItem>
          ))}
        </Menu>
        </React.Fragment>
       
      )    
    }  
    return (
      <div>
        {wait}  
      </div>
    )
}