import React, { useState }from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import Checkbox from '@material-ui/core/Checkbox';
import Chip from '@material-ui/core/Chip';
import { useApiGet } from '../../hooks/useApiGet';
import { useUserState } from "../../context/UserContext";
import Widget from "../../components/Widget";
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';

const useStyles = makeStyles((theme) => ({
    formControl: {
      margin: theme.spacing(1),
      minWidth: 120,
      maxWidth: 300,
    },
    chips: {
      display: 'flex',
      flexWrap: 'wrap',
    },
    chip: {
      margin: 2,
    },
    noLabel: {
      marginTop: theme.spacing(3),
    },
    buttons: {
      alignItems: "center",  
    }
  }));

const ITEM_HEIGHT = 48;
const ITEM_PADDING_TOP = 8;
const MenuProps = {
    PaperProps: {
      style: {
        maxHeight: ITEM_HEIGHT * 4.5 + ITEM_PADDING_TOP,
        width: 250,
      },
    },
};

const allRoles = [
    'user',
    'lightapi.net',
    'merchant',
    'admin'
];

function getStyles(role, roles, theme) {
    return {
      fontWeight:
        roles.indexOf(role) === -1
          ? theme.typography.fontWeightRegular
          : theme.typography.fontWeightMedium,
    };
}

export default function UpdateRoles(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [email, setEmail] = useState();
  const [roles, setRoles] = useState([]);


  const handleChange = (event) => {
    setRoles(event.target.value);
  };

  const onEmailChange = (event) => {
    setEmail(event.target.value);
  };

  const handleChangeMultiple = (event) => {
    const { options } = event.target;
    const value = [];
    for (let i = 0, l = options.length; i < l; i += 1) {
      if (options[i].selected) {
        value.push(options[i].value);
      }
    }
    setRoles(value);
  };  

  const retrieve = () => {
    
  }

  const update = () => {

  }

  return (
    <div>
      <FormControl className={classes.formControl}>
        <TextField id="standard-basic" label="Email" onChange={onEmailChange}/>
        <Select
          labelId="demo-mutiple-name-label"
          id="demo-mutiple-name"
          multiple
          value={roles}
          onChange={handleChange}
          input={<Input />}
          MenuProps={MenuProps}
        >
          {allRoles.map((role) => (
            <MenuItem key={role} value={role}>
              {role}
            </MenuItem>
          ))}
        </Select>
        <p/>
        <div className={classes.buttons}>
          <Button variant="contained" className={classes.button} color="primary" onClick={e => retrieve()}>Retrieve Roles</Button>
          <Button variant="contained" className={classes.button} color="primary" onClick={e => update()}>Update Roles</Button>
        </div>
      </FormControl>
    </div>
  ) 
}
