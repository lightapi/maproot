import React, { useState } from "react";
import { IconButton, Menu, MenuItem } from "@material-ui/core";
import { Home as HomeIcon, Info, ShoppingBasket, EventSeat, Book, ContactMail } from "@material-ui/icons";
import classNames from "classnames";
import { useSiteState, useSiteDispatch } from "../../context/SiteContext";


export default function MailMenu(props) {
    var classes = props.classes;
    const [homeMenu, setHomeMenu] = useState(null);
    var siteDispatch = useSiteDispatch();
    const { site } = useSiteState();
    //console.log("site = ", site);
    const changeMenu = (menu) => {
       siteDispatch({ type: "UPDATE_MENU", menu }); 
    }

    return (
      <React.Fragment>
        { site ? (
          <React.Fragment>
          <IconButton
            aria-haspopup="true"
            color="inherit"
            className={classes.headerMenuButton}
            aria-controls="home-menu"
            onClick={e => setHomeMenu(e.currentTarget)}
          >
            <HomeIcon classes={{ root: classes.headerIcon }} />
          </IconButton>
          <Menu
            id="profile-menu"
            open={Boolean(homeMenu)}
            anchorEl={homeMenu}
            onClose={() => setHomeMenu(null)}
            className={classes.headerMenu}
            classes={{ paper: classes.profileMenu }}
            disableAutoFocusItem
          >
            <div>
              { (site.home && site.home.render) ? (
                <MenuItem
                  className={classNames(
                    classes.profileMenuItem,
                    classes.headerMenuItem,
                  )}
                  onClick={() => {changeMenu('home'); setHomeMenu(false);}}
                >
                  <HomeIcon className={classes.profileMenuIcon} /> Home
                </MenuItem>
                )
                : null
              }
              { (site.about && site.about.render) ? (
                <MenuItem
                  className={classNames(
                    classes.profileMenuItem,
                    classes.headerMenuItem,
                  )}
                  onClick={() => {changeMenu('about'); setHomeMenu(false);}}
                >
                  <Info className={classes.profileMenuIcon} /> About
                </MenuItem>
                )
                : null
              }
              { (site.catalog && site.catalog.render) ? (
                <MenuItem
                  className={classNames(
                    classes.profileMenuItem,
                    classes.headerMenuItem,
                  )}
                  onClick={() => {changeMenu('catalog'); setHomeMenu(false);}}
                >
                  <ShoppingBasket className={classes.profileMenuIcon} /> Catalog
                </MenuItem>
                )
                : null
              }
              { (site.reservation && site.reservation.render) ? (
                <MenuItem
                  className={classNames(
                    classes.profileMenuItem,
                    classes.headerMenuItem,
                  )}
                  onClick={() => {changeMenu('reservation'); setHomeMenu(false);}}
                >
                  <EventSeat className={classes.profileMenuIcon} /> Reservation
                </MenuItem>
                )
                : null
              }
              { (site.blog && site.blog.render) ? (
                <MenuItem
                  className={classNames(
                    classes.profileMenuItem,
                    classes.headerMenuItem,
                  )}
                  onClick={() => {changeMenu('blog'); setHomeMenu(false);}}
                >
                  <Book className={classes.profileMenuIcon} /> Blog
                </MenuItem>
                )
                : null
              }  
              { (site.contact && site.contact.render) ? (
                <MenuItem
                  className={classNames(
                    classes.profileMenuItem,
                    classes.headerMenuItem,
                  )}
                  onClick={() => {changeMenu('contact'); setHomeMenu(false);}}
                >
                  <ContactMail className={classes.profileMenuIcon} /> Contact
                </MenuItem>
                )
                : null  
              }
            </div>
          </Menu>
          </React.Fragment>
        )
        : null
      }
      </React.Fragment>
    );
}
