import React, { useState } from "react";
import {
  AppBar,
  Toolbar,
  IconButton,
  InputBase
} from "@material-ui/core";
import {
  Menu as MenuIcon,
  Search as SearchIcon,
  ArrowBack as ArrowBackIcon,
} from "@material-ui/icons";
import classNames from "classnames";

// styles
import useStyles from "./styles";

// components
import { Typography } from "../Wrappers/Wrappers";
import ProfileMenu from "./ProfileMenu";
import NotificationMenu from "./NotificationMenu";
import MailMenu from "./MailMenu";

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/LayoutContext";
import { useUserState } from "../../context/UserContext";

export default function Header(props) {
  var classes = useStyles();

  // global
  var layoutState = useLayoutState();
  var layoutDispatch = useLayoutDispatch();

  // local
  var [isSearchOpen, setSearchOpen] = useState(false);
  var { isAuthenticated } = useUserState();


  return (
    <AppBar position="fixed" className={classes.appBar}>
      <Toolbar className={classes.toolbar}>
        <IconButton
          color="inherit"
          onClick={() => toggleSidebar(layoutDispatch)}
          className={classNames(
            classes.headerMenuButton,
            classes.headerMenuButtonCollapse,
          )}
        >
          {layoutState.isSidebarOpened ? (
            <ArrowBackIcon
              classes={{
                root: classNames(
                  classes.headerIcon,
                  classes.headerIconCollapse,
                ),
              }}
            />
          ) : (
            <MenuIcon
              classes={{
                root: classNames(
                  classes.headerIcon,
                  classes.headerIconCollapse,
                ),
              }}
            />
          )}
        </IconButton>
        <Typography variant="h6" weight="medium" className={classes.logotype}>
          Light Portal
        </Typography>
        <div className={classes.grow} />
        <div
          className={classNames(classes.search, {
            [classes.searchFocused]: isSearchOpen,
          })}
        >
          <div
            className={classNames(classes.searchIcon, {
              [classes.searchIconOpened]: isSearchOpen,
            })}
            onClick={() => setSearchOpen(!isSearchOpen)}
          >
            <SearchIcon classes={{ root: classes.headerIcon }} />
          </div>
          <InputBase
            placeholder="Search…"
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
          />
        </div>
        { isAuthenticated ? (
          <NotificationMenu classes = {classes} />
        ) : null
        }
        { isAuthenticated ? (
          <MailMenu classes = {classes} />
        ) : null
        }
        <ProfileMenu classes = {classes } history = {props.history} />
      </Toolbar>
    </AppBar>
  );
}
