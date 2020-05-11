import React, { useEffect } from "react";
import {
  Grid,
} from "@material-ui/core";
import useStyles from "./styles";

// components
import Widget from "../../components/Widget";
import PageTitle from "../../components/PageTitle";
import { Typography } from "../../components/Wrappers";
import Dot from "../../components/Sidebar/components/Dot";
import { useUserState, useUserDispatch } from "../../context/UserContext";
import Cookies from 'universal-cookie'

export default function Dashboard(props) {
  var classes = useStyles();
  const { email } = useUserState();
  const userDispatch = useUserDispatch();
  const cmd = {
    host: 'lightapi.net',
    service: 'user',
    action: 'queryUserByEmail',
    version: '0.1.0',
    data: { email }
  }
  const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
  const headers = {};

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      try {
        const cookies = new Cookies();
        Object.assign(headers, {'X-CSRF-TOKEN': cookies.get('csrf')})
        const response = await fetch(url, { headers, credentials: 'include', signal: abortController.signal });
        //console.log(response);
        if (!response.ok) {
          throw response;
        }

        const data = await response.json();
        //console.log(data);
        userDispatch({ type: "UPDATE_PROFILE", userId: data.userId });
      } catch (e) {
        // only call dispatch when we know the fetch was not aborted
        if (!abortController.signal.aborted) {
          const error = await e.json();
          console.log(error);
        }        
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, []);

  return (
    <>
      <PageTitle title="We are all connected, so let's help each other." button="Latest News" />
      <Grid container spacing={4}>
        <Grid item lg={3} md={4} sm={6} xs={12}>
          <Widget
            title="Registered City Maps"
            upperTitle
            bodyClass={classes.fullHeightBody}
            className={classes.card}
          >
            <div className={classes.visitsNumberContainer}>
              <Typography size="xl" weight="medium">
                72 Cities
              </Typography>
            </div>
            <div className={classes.visitsNumberContainer}>
              <Typography weight="medium">
                Capital city to cover the entire province or state
              </Typography>
            </div>
            <Grid
              container
              direction="row"
              justify="space-between"
              alignItems="center"
            >
              <Grid item>
                <Typography color="text" colorBrightness="secondary">
                  Ontario
                </Typography>
                <Typography size="md">10</Typography>
              </Grid>
              <Grid item>
                <Typography color="text" colorBrightness="secondary">
                  Canada
                </Typography>
                <Typography size="md">22</Typography>
              </Grid>
              <Grid item>
                <Typography color="text" colorBrightness="secondary">
                  US
                </Typography>
                <Typography size="md">50</Typography>
              </Grid>
            </Grid>
          </Widget>
        </Grid>

        <Grid item lg={3} md={8} sm={6} xs={12}>
          <Widget
            title="Entity Category"
            upperTitle
            className={classes.card}
            bodyClass={classes.fullHeightBody}
          >
            <div className={classes.performanceLegendWrapper}>
              <div className={classes.legendElement}>
                <Dot color="warning" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  requester
                </Typography>
              </div>
              <div className={classes.legendElement}>
                <Dot color="primary" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  volunteer
                </Typography>
              </div>
            </div>
            <div className={classes.performanceLegendWrapper}>
              <div className={classes.legendElement}>
                <Dot color="warning" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  real estate
                </Typography>
              </div>
              <div className={classes.legendElement}>
                <Dot color="primary" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  buy and sell
                </Typography>
              </div>
            </div>
            <div className={classes.performanceLegendWrapper}>
              <div className={classes.legendElement}>
                <Dot color="warning" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  retail
                </Typography>
              </div>
              <div className={classes.legendElement}>
                <Dot color="primary" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  service
                </Typography>
              </div>
            </div>
            <div className={classes.performanceLegendWrapper}>

              <div className={classes.legendElement}>
                <Dot color="warning" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  manufacture
                </Typography>
              </div>
              <div className={classes.legendElement}>
                <Dot color="primary" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  healthcare
                </Typography>
              </div>
            </div>
            <div className={classes.performanceLegendWrapper}>

              <div className={classes.legendElement}>
                <Dot color="warning" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  education
                </Typography>
              </div>
              <div className={classes.legendElement}>
                <Dot color="primary" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  government
                </Typography>
              </div>
            </div>
            <div className={classes.performanceLegendWrapper}>

              <div className={classes.legendElement}>
                <Dot color="warning" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  entertainment
                </Typography>
              </div>
              <div className={classes.legendElement}>
                <Dot color="primary" />
                <Typography
                  color="text"
                  colorBrightness="secondary"
                  className={classes.legendElementText}
                >
                  recreation
                </Typography>
              </div>

            </div>

          </Widget>
        </Grid>
        <Grid item lg={3} md={4} sm={6} xs={12}>
          <Widget title="Website Generator" upperTitle className={classes.card}>
            <div className={classes.serverOverviewElement}>
              <Typography
                color="text"
                colorBrightness="secondary"
                className={classes.serverOverviewElementText}
              >
                  Each registered entity can create and publish a website based on the category and subcategory to sell goods or services. 

              </Typography>
            </div>
            <div className={classes.serverOverviewElement}>
              <Typography
                color="text"
                colorBrightness="secondary"
                className={classes.serverOverviewElementText}
              >
                  For business, you can sell your products, make a reservation, or book an appointment. 
              </Typography>
            </div>
          </Widget>
        </Grid>
        <Grid item lg={3} md={8} sm={6} xs={12}>
          <Widget
            title="Realtime Status & PM"
            upperTitle
            className={classes.card}
            bodyClass={classes.fullHeightBody}
          >
            <div className={classes.serverOverviewElement}>
              <Typography
                color="text"
                colorBrightness="secondary"
                className={classes.serverOverviewElementText}
              >
                For a person, you can update your realtime status to ask help from a neighbour
              </Typography>
            </div>
            <div className={classes.serverOverviewElement}>
              <Typography
                color="text"
                colorBrightness="secondary"
                className={classes.serverOverviewElementText}
              >
                For business you can update your realtime status to inform your customer how long they have to wait outside and what is restocked, etc.
              </Typography>
            </div>
          </Widget>
        </Grid>
        <Grid item xs={12}>
          <Widget
            bodyClass={classes.mainChartBody}
          >
            <div className={classes.performanceLegendWrapper}>
              <div>
              It seems that the entire world is locked down, and nobody knows when the situation will return to normal. Even we can reopen the country next month, we still need social distancing until the vaccine for COVID-19 is available. For the majority of people, they have to change their lifestyles; however, for some vulnerable people, it is about survival. 
              <p/>              
              I have heard people who had returned from another country forced to be self-isolated at home without food, and online order would be delivered two weeks later. Wouldn't it be wonderful if a neighbor can shop more at the grocery and drop it at the door?
              <p/>
              I have seen people waiting at the local Costco for hours in the morning to get in. Wouldn't it be better for a Costco employee or a person waiting in the line to publish the waiting time on a website so that shoppers can decide when to go there?
              <p/>  
              To keep social distance, we need to travel less and avoid mass gatherings as much as possible. Is it a good idea for people to create websites and publish pictures and videos in real-time for hot spots to enable others to virtual travel at home?
              <p/>  
              Our government is helping poor people with financial aid; our doctors and nurses are fighting at the front line. We, as a community, need to be united, help each other, and grow stronger. To connect people in the same neighborhood, I have been working on an application in the last four weeks. 
              <p/>
              The project is open-sourced on Github.com, and developers are welcomed to join the effort to enhance the UI and add more features. We also accept donations on GitHub and Paypal to develop more website templates for small businesses. Please forward this site to others, we are helping others and helping ourselves. Thank you, and stay safe. 
              </div>
            </div>
          </Widget>
        </Grid>

        <Grid item lg={3} md={4} sm={6} xs={12}>
          <Widget
            title="Youtube Videos"
            upperTitle
            bodyClass={classes.fullHeightBody}
            className={classes.card}
          >
            <Grid container spacing={2}>
              <div className={classes.performanceLegendWrapper}>
                
                <Grid item xs={12}>
                  <div className={classes.legendElement}>
                  <Dot color="primary" />
                  <Typography
                    color="text"
                    colorBrightness="secondary"
                    className={classes.legendElementText}
                  >
                    <a href="https://www.youtube.com/watch?v=sZp918Iq9FY" rel="noreferrer noopener" target="_blank">Demo Video</a>
                  </Typography>
                  </div>

                </Grid>
              </div>  
            </Grid>
          </Widget>
        </Grid>

        <Grid item lg={3} md={8} sm={6} xs={12}>
          <Widget
            title="Open Source"
            upperTitle
            className={classes.card}
            bodyClass={classes.fullHeightBody}
          >
            <Grid container spacing={2}>
              <div className={classes.performanceLegendWrapper}>
                
                <Grid item xs={12}>
                  <div className={classes.legendElement}>
                  <Dot color="primary" />
                  <Typography
                    color="text"
                    colorBrightness="secondary"
                    className={classes.legendElementText}
                  >
                    <a href="https://github.com/networknt/maproot" rel="noreferrer noopener" target="_blank">MapRoot Repository</a>
                  </Typography>
                  </div>

                </Grid>
              </div>  
            </Grid>
          </Widget>
        </Grid>
        

        <Grid item lg={3} md={8} sm={6} xs={12}>
          <Widget
            title="Document"
            upperTitle
            className={classes.card}
            bodyClass={classes.fullHeightBody}
          >
            <Grid container spacing={2}>
              <div className={classes.performanceLegendWrapper}>
                
                <Grid item xs={12}>
                  <div className={classes.legendElement}>
                  <Dot color="primary" />
                  <Typography
                    color="text"
                    colorBrightness="secondary"
                    className={classes.legendElementText}
                  >
                    <a href="https://doc.maproot.net" rel="noreferrer noopener" target="_blank">Documentation</a>                  
                  </Typography>
                  </div>

                </Grid>
              </div>  
            </Grid>
          </Widget>
        </Grid>
        <Grid item lg={3} md={4} sm={6} xs={12}>
          <Widget title="Contact" upperTitle className={classes.card}>
            <Grid container spacing={2}>
              <div className={classes.performanceLegendWrapper}>
                
                <Grid item xs={12}>
                  <div className={classes.legendElement}>
                  <Dot color="primary" />
                  <Typography
                    color="text"
                    colorBrightness="secondary"
                    className={classes.legendElementText}
                  >
                    <a href="mailto:stevehu@gmail.com" target="_top">Send Mail</a>
                  </Typography>
                  </div>

                </Grid>
              </div>  

              <div className={classes.performanceLegendWrapper}>
                <Grid item xs={12}>
                  <div className={classes.legendElement}>
                  <Dot color="primary" />
                  <Typography
                    color="text"
                    colorBrightness="secondary"
                    className={classes.legendElementText}
                  >
                    <a href="https://gitter.im/networknt/maproot" rel="noreferrer noopener" target="_blank">Gitter Chat</a>
                  </Typography>
                  </div>

                </Grid>
              </div>  
            </Grid>
          </Widget>
        </Grid>

      </Grid>
    </>
  );
}
