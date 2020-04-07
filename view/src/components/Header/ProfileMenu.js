import React, { useState } from "react";
import { useUserDispatch, signOut, signUp, changePassword, getProfile } from "../../context/UserContext";
import {
  IconButton,
  Menu,
  MenuItem,
} from "@material-ui/core";
import {
  Person as AccountIcon,
} from "@material-ui/icons";
import { Typography } from "../Wrappers/Wrappers";
import classNames from "classnames";
import { useUserState } from "../../context/UserContext";

export default function ProfileMenu(props) {
    var [profileMenu, setProfileMenu] = useState(null);
    var userDispatch = useUserDispatch();
    var classes = props.classes;
    var { isAuthenticated, userId } = useUserState();

    console.log(isAuthenticated);

    const signIn = () => {
        // this is the production redirect with redirect uri https://ob.lightapi.net
        let url = "https://signin.lightapi.net?client_id=f7d42348-c647-4efb-a52d-4c5787421e72&user_type=customer&state=1222";
        if(process.env.NODE_ENV !== 'production') {
            // this is development redirect with redirect uri https://localhost:3000
            url = "https://dev.signin.lightapi.net?client_id=f7d42348-c647-4efb-a52d-4c5787421e73&user_type=customer&state=1222";
        }
        window.location = url;
    }

    return (
        <React.Fragment>
        <IconButton
          aria-haspopup="true"
          color="inherit"
          className={classes.headerMenuButton}
          aria-controls="profile-menu"
          onClick={e => setProfileMenu(e.currentTarget)}
        >
          <AccountIcon classes={{ root: classes.headerIcon }} />
        </IconButton>
        <Menu
          id="profile-menu"
          open={Boolean(profileMenu)}
          anchorEl={profileMenu}
          onClose={() => setProfileMenu(null)}
          className={classes.headerMenu}
          classes={{ paper: classes.profileMenu }}
          disableAutoFocusItem
        >
        { isAuthenticated ? (
          <div>
          <div className={classes.profileMenuUser}>
            <Typography variant="h6" weight="medium">
              {userId}
            </Typography>
          </div>
          <MenuItem
            className={classNames(
              classes.profileMenuItem,
              classes.headerMenuItem,
            )}
            onClick={() => getProfile(userDispatch, props.history)}
          >
            <AccountIcon className={classes.profileMenuIcon} /> Profile
          </MenuItem>
          <MenuItem
            className={classNames(
              classes.profileMenuItem,
              classes.headerMenuItem,
            )}
          >
            <AccountIcon className={classes.profileMenuIcon} /> Tasks
          </MenuItem>
          <MenuItem
            className={classNames(
              classes.profileMenuItem,
              classes.headerMenuItem,
            )}
          >
            <AccountIcon className={classes.profileMenuIcon} /> Messages
          </MenuItem>
          <MenuItem
            className={classNames(
              classes.profileMenuItem,
              classes.headerMenuItem,
            )}
          >
            <AccountIcon className={classes.profileMenuIcon} /> Notifications
          </MenuItem>
          <div className={classes.profileMenuUser}>
            <Typography
              className={classes.profileMenuLink}
              color="primary"
              onClick={() => changePassword(userDispatch, props.history)}
            >
              Change Password
            </Typography>
          </div>
          <div className={classes.profileMenuUser}>
            <Typography
              className={classes.profileMenuLink}
              color="primary"
              onClick={() => signOut(userDispatch, props.history)}
            >
              Sign Out
            </Typography>
          </div>
          </div>
          ) : (
          <div>
          <div className={classes.profileMenuUser}>
            <Typography
              className={classes.profileMenuLink}
              color="primary"
              onClick={signIn}
            >
              Sign In
            </Typography>
          </div>
          <div className={classes.profileMenuUser}>
            <Typography
              className={classes.profileMenuLink}
              color="primary"
              onClick={() => signUp(userDispatch, props.history)}
            >
              Sign Up
            </Typography>
          </div>
          </div>
          )
        }

        </Menu>
        </React.Fragment>
    );
}
