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
import HomeMenu from "./HomeMenu";
import CartMenu from './CartMenu';

// context
import {
  useLayoutState,
  useLayoutDispatch,
  toggleSidebar,
} from "../../context/LayoutContext";
import { useUserState } from "../../context/UserContext";
import { useSiteState, useSiteDispatch } from "../../context/SiteContext";

export default function Header(props) {
  //console.log("props= ", props);

  var classes = useStyles();

  // global
  var layoutState = useLayoutState();
  var layoutDispatch = useLayoutDispatch();

  // local
  var [isSearchOpen, setSearchOpen] = useState(false);
  var { isAuthenticated } = useUserState();

  var siteDispatch = useSiteDispatch();
  const changeFilter = (e) => {
    siteDispatch({ type: "UPDATE_FILTER", filter: e.target.value }); 
  }

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
          MapRoot
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
            onChange={changeFilter}
            classes={{
              root: classes.inputRoot,
              input: classes.inputInput,
            }}
          />
        </div>
        { props.history.location.pathname.startsWith('/app/website') ? (
          <HomeMenu {...props} classes = {classes} />
        ) : null
        }  
        { props.history.location.pathname.startsWith('/app/website') ? (
          <CartMenu {...props} classes = {classes} />
        ) : null
        }  
        { isAuthenticated ? (
          <NotificationMenu {...props} classes = {classes} />
        ) : null
        }
        { isAuthenticated ? (
          <MailMenu {...props} classes = {classes} />
        ) : null
        }
        <ProfileMenu classes = {classes } history = {props.history} />
      </Toolbar>
    </AppBar>
  );
}
