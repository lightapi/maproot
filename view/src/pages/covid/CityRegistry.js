import React from 'react';
import Widget from "../../components/Widget";
import Button from '@material-ui/core/Button';
import useStyles from "./styles";

export default function CityRegistry(props) {
  const classes = useStyles();
  
  console.log("props = ", props);
  console.log("error = ", props.location.state.error);
  const error = props.location.state.error;

  const createCityMap = () => {
    console.log("createCity is called");
    props.history.push('/app/form/createCityMap');
  };

  return (
    <div>
      <Widget
        title="City Map"
        upperTitle
        bodyClass={classes.fullHeightBody}
        className={classes.card}
      >
        <div className={classes.button}>
          <Button variant="contained" color="primary" onClick={createCityMap}>
            Create
          </Button>
        </div>  
        <pre>{ JSON.stringify(error, null, 2) }</pre>
      </Widget>
    </div>
  );
}
