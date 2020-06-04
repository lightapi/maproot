import React from 'react';
import Fab from '@material-ui/core/Fab';
import { makeStyles } from '@material-ui/styles';
import { useSiteDispatch } from "../../context/SiteContext";

/*
For independent compnent, use the makeStyles and have a chance to override the style using data from the
API. 
*/

const useStyles = makeStyles({
  home: {
    height: "100vh",
    backgroundSize: "cover",
    backgroundRepeat: "no-repeat",
    backgroundPosition: "top center",
  },
  homeContent: {
    height: "100%",
    display: "flex",
    flexDirection: "column",
    justifyContent: "flex-start",
    alignItems: "center",
    padding: "40px",
  },
  homeName: props => ({
    position: "absolute",
    top: "30%",
    textAlign: "center",
    fontSize: props.nameSize,
    fontWeight: "bold",
    fontStyle: "italic",
    color: "white",
    textShadow: "3px 3px 6px #000000",
  }),
  homeTitle: props => ({
    position: "absolute",
    top: "50%",
    textAlign: "center",
    fontSize: props.titleSize,
    fontWeight: "bold",
    color: "white",
    font: "normal normal normal 56px/1.4em lulo-clean-w01-one-bold,sans-serif",
    letterSpacing: "6px",
  }),
})

export default function Home(props) {
    const styleProps = { nameSize: props.site.home.nameSize || '110px', titleSize: props.site.home.titleSize || '70px' }
    var classes = useStyles(styleProps);
    var siteDispatch = useSiteDispatch();

    const onButtonClick = (menu) => {
      siteDispatch({ type: "UPDATE_MENU", menu }); 
    }

    return (
        <div className={classes.home} style ={{ backgroundImage: `url(${props.site.home.background})`, backgroundSize: 'cover',  overflow: 'hidden' }}>
            <div className={classes.homeContent}>
                <div className={classes.homeName}>{props.site.home.name}</div>
                <div className={classes.homeTitle}>{props.site.home.title}</div>
                <div>
                {props.site.home.buttons.map(button => (
                  <Fab variant="extended" color="primary" onClick={() => onButtonClick(button.menu)}>
                   {button.label}
                 </Fab>
                ))}
                </div>
            </div>
        </div>
    );
}
