import React from 'react';
import Widget from "../../components/Widget";
import Button from '@material-ui/core/Button';
import useStyles from "./styles";


export default function CityProfile(props) {
  const classes = useStyles();

  //console.log("props = ", props);
  //console.log("data = ", props.location.state.data);
  const data = props.location.state.data;

  const updateCityMap = () => {
    //console.log("updateCityMap is called");
    props.history.push({pathname: '/app/form/updateCityMap', state: { data }});
  };

  const deleteCityMap = () => {
    if (window.confirm("Are you sure you want to delete the city?")) {
      //console.log("confirmed");
      props.history.push({pathname: '/app/covid/deleteCity', state: { data }});
    } 
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
          <Button variant="contained" color="primary" onClick={updateCityMap}>
            Update
          </Button>
          <Button variant="contained" color="primary" onClick={deleteCityMap}>
            Delete
          </Button>
        </div>  
        <pre>{ JSON.stringify(data, null, 2) }</pre>
      </Widget>
    </div>
  );
}
