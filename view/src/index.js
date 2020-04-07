import React from 'react';
import ReactDOM from 'react-dom';
import { HashRouter } from 'react-router-dom'
import { ThemeProvider } from "@material-ui/styles";
import { CssBaseline } from "@material-ui/core";
import Themes from "./themes";
import { CookiesProvider } from 'react-cookie';
import { LayoutProvider } from "./context/LayoutContext";
import { UserProvider } from "./context/UserContext";
import App from './App';
import * as serviceWorker from './serviceWorker';

ReactDOM.render(
(   
    <LayoutProvider>
        <ThemeProvider theme={Themes.default}>
            <UserProvider>
                <CssBaseline />
                <App/>
            </UserProvider>
        </ThemeProvider>
    </LayoutProvider>
),
document.getElementById('root')
);

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
