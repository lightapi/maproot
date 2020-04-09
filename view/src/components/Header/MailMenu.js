import React, { useState } from "react";
import {
  IconButton,
  Menu,
  MenuItem,
  Fab,
} from "@material-ui/core";
import {
  MailOutline as MailIcon,
  Send as SendIcon,
} from "@material-ui/icons";
import { Badge, Typography } from "../Wrappers/Wrappers";
import UserAvatar from "../UserAvatar/UserAvatar";
import classNames from "classnames";
import { useUserState } from "../../context/UserContext";
import { useApiGet } from '../../hooks/useApiGet';
import CircularProgress from '@material-ui/core/CircularProgress';

const messages = [
  {
    id: 0,
    variant: "warning",
    name: "Jane Hew",
    message: "Hey! How is it going? I am at home and everything looks normal. Call me if you have time. Thanks.",
    time: "9:32",
  },
  {
    id: 1,
    variant: "success",
    name: "Lloyd Brown",
    message: "Check out my new Dashboard",
    time: "9:18",
  },
  {
    id: 2,
    variant: "primary",
    name: "Mark Winstein",
    message: "I want rearrange the appointment",
    time: "9:15",
  },
  {
    id: 3,
    variant: "secondary",
    name: "Liana Dutti",
    message: "Good news from sale department",
    time: "9:09",
  },
];

function timeConversion(millisec) {

  var seconds = (millisec / 1000).toFixed(1);

  var minutes = (millisec / (1000 * 60)).toFixed(1);

  var hours = (millisec / (1000 * 60 * 60)).toFixed(1);

  var days = (millisec / (1000 * 60 * 60 * 24)).toFixed(1);

  if (seconds < 60) {
      return seconds + " S";
  } else if (minutes < 60) {
      return minutes + " M";
  } else if (hours < 24) {
      return hours + " H";
  } else {
      return days + " D"
  }
}

export default function MailMenu(props) {
    var [mailMenu, setMailMenu] = useState(null);
    var [isMailsUnread, setIsMailsUnread] = useState(true);
    var classes = props.classes;
    var { userId } = useUserState();
    const cmd = {
      host: 'lightapi.net',
      service: 'user',
      action: 'getPrivateMessage',
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
            setMailMenu(e.currentTarget);
            setIsMailsUnread(false);
          }}
          className={classes.headerMenuButton}
        >
          <Badge
            badgeContent={isMailsUnread ? data.length : null}
            color="secondary"
          >
            <MailIcon classes={{ root: classes.headerIcon }} />
          </Badge>
        </IconButton>
        <Menu
          id="mail-menu"
          open={Boolean(mailMenu)}
          anchorEl={mailMenu}
          onClose={() => setMailMenu(null)}
          MenuListProps={{ className: classes.headerMenuList }}
          className={classes.headerMenu}
          classes={{ paper: classes.profileMenu }}
          disableAutoFocusItem
        >
          <div className={classes.profileMenuUser}>
            <Typography variant="h4" weight="medium">
              New Messages
            </Typography>
            <Typography
              className={classes.profileMenuLink}
              component="a"
              color="secondary"
            >
              {data.length} New Messages
            </Typography>
          </div>
          {data.map((message, index) => (
            <MenuItem key={index} className={classes.messageNotification}>
              <div className={classes.messageNotificationSide}>
                <UserAvatar color="primary" name={message.fromId} />
                <Typography size="sm" color="text" colorBrightness="secondary">
                  {timeConversion((new Date()).getTime() - message.timestamp)}
                </Typography>
              </div>
              <div
                className={classNames(
                  classes.messageNotificationSide,
                  classes.messageNotificationBodySide,
                )}
              >
                <Typography weight="medium" gutterBottom>
                  {message.fromId} -> {message.subject}
                </Typography>
                <Typography color="text" colorBrightness="secondary">
                  {message.content}
                </Typography>
              </div>
            </MenuItem>
          ))}
          <Fab
            variant="extended"
            color="primary"
            aria-label="Add"
            className={classes.sendMessageButton}
          >
            Send New Message
            <SendIcon className={classes.sendButtonIcon} />
          </Fab>
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