import React, { useState } from 'react';
import { makeStyles } from '@material-ui/core/styles';
import Grid from '@material-ui/core/Grid';
import { VideoCall } from '@material-ui/icons';
import VideoPopup from './VideoPopup';

const useStyles = makeStyles((theme) => ({
    root: {
      color: theme.palette.text.secondary,
    },
  }));

export default function VideoList(props) {
    const classes = useStyles();
    const [ openPosition, setOpenPosition ] = useState(-1);
    const { vs } = props;
    console.log("vs = ", vs);
    console.log("openPosition = ", openPosition);
    return (
        <div>
        <Grid container alignItems="center" className={classes.root}>
        {vs.map((video, index) => (
            <div key={index}>
            <VideoCall onClick={() => setOpenPosition(index)}/>
            <VideoPopup open={index === openPosition} reset={() => setOpenPosition(-1)} url={video.u}/>
            </div>
        ))}
        </Grid>
        </div>
    )
}
