import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Fab,
} from "@material-ui/core";
import {
  Build as ManageIcon,
  NotificationsNone as NotificationsIcon,
} from "@material-ui/icons";
import { Badge } from "../Wrappers/Wrappers";
import Notification from "../Notification/Notification";
import { useUserState } from "../../context/UserContext";
import { useApiGet } from '../../hooks/useApiGet';
import CircularProgress from '@material-ui/core/CircularProgress';

export default function NotificationMenu(props) {
    var [notificationsMenu, setNotificationsMenu] = useState(null);
    var [isNotificationsUnread, setIsNotificationsUnread] = useState(true);
    var classes = props.classes;
    var { email } = useUserState();
    const cmd = {
      host: 'lightapi.net',
      service: 'user',
      action: 'getNotification',
      version: '0.1.0',
      data: { email }
    };

    const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
    const headers = {};
    const { isLoading, data, error } = useApiGet({url, headers});
    //console.log("data", data);
    //console.log("error", error);
    //console.log("isLoading", isLoading);

    const notificationDetail = () => {
      console.log("notificationDetail is called", data);
      props.history.push({pathname: '/app/notificationDetail', state: { data }});
    };

    let wait;
    if(isLoading) {
      wait = <div><CircularProgress/></div>;
    } else if(data) {
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
          <Fab
            variant="extended"
            color="primary"
            aria-label="Add"
            onClick={notificationDetail}
            className={classes.sendMessageButton}
          >
            Notification Detail
            <ManageIcon className={classes.sendButtonIcon} />
          </Fab>
          {data.map((notification, index) => (
            <MenuItem
              key={index}
              onClick={() => setNotificationsMenu(null)}
              className={classes.headerMenuItem}
            >
              <Notification {...notification} typographyVariant="inherit" />
            </MenuItem>
          ))}
        </Menu>
        </React.Fragment>
       
      )    
    } else {
      console.log(error);
    }  
    return (
      <div>
        {wait}  
      </div>
    )
}