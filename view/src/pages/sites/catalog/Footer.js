import React from 'react';
import { makeStyles } from '@material-ui/styles';

const useStyles = makeStyles({
  footer: {
    "color": "#999",
    "fontSize": "14px",
    "textAlign": "center",
    "padding": "32px",
    "background": "#ddd",
    "& strong": {
      "color": "#666",    
    },
  },
  footerLinks: {
    "marginBottom": "24px",
    "& a": {
      "margin": "0 8px",
      "color": "#666",
    },
  }  

})

const Footer = (props) => {
    var classes = useStyles();
    return(
        <footer className={classes.footer}>
            <p className={classes.footerLinks}>
                Want your website like this up in hours? <a href="http://doc.maproot.net/website/" target="_blank">Create it on your own</a>
                <span>  /  </span>
                <a href="mailto:stevehu@gmail.com" target="_blank">We can help</a>
            </p>
            <p>&copy; 2020 <strong>maproot.net</strong> - {props.site && props.site.home ? props.site.home.name : 'we are all connected!'}</p>
        </footer>
    )
};

export default Footer;
