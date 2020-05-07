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
import { useInterval } from '../../hooks/useInterval';
import CircularProgress from '@material-ui/core/CircularProgress';
import { timeConversion } from '../../Utils';
import Cookies from 'universal-cookie'


export default function MailMenu(props) {
    var [mailMenu, setMailMenu] = useState(null);
    var [isMailsUnread, setIsMailsUnread] = useState(true);
    var [messages, setMessages] = useState([]);
    var [loading, setLoading] = useState(false);
    var classes = props.classes;
    var { email } = useUserState();

    //console.log("csrf = ", csrf);
    const cmd = {
      host: 'lightapi.net',
      service: 'user',
      action: 'getPrivateMessage',
      version: '0.1.0',
      data: { email }
    };

    const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));

    const queryMessageFn = async (url, headers) => {
      try {
        setLoading(true);
        const response = await fetch(url, { headers, credentials: 'include'});
        //console.log(response);
        if (!response.ok) {
          const error = await response.json();
          //console.log(error);
          setMessages([]);
        } else {
          const data = await response.json();
          setMessages(data);
        }
        setLoading(false);
      } catch (e) {
        console.log(e);
        setMessages([]);
        setLoading(false);
      }
    };

    useInterval(() => {
      const cookies = new Cookies();
      const headers = {'X-CSRF-TOKEN': cookies.get('csrf')};
      queryMessageFn(url, headers);
    }, 60000);

    //const { isLoading, data, error } = useApiGet({url, headers});
    //console.log("messages", messages);
    //console.log("error", error);
    //console.log("isLoading", isLoading);
    //const messages = data || [];
    let wait;
    if(loading) {
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
            badgeContent={isMailsUnread ? messages.length : null}
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
              {messages.length} New Messages
            </Typography>
          </div>
          {messages.map((message, index) => (
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
