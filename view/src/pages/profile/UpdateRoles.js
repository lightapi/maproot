import React, { useState }from 'react';
import { makeStyles, useTheme } from '@material-ui/core/styles';
import Input from '@material-ui/core/Input';
import InputLabel from '@material-ui/core/InputLabel';
import MenuItem from '@material-ui/core/MenuItem';
import FormControl from '@material-ui/core/FormControl';
import TextField from '@material-ui/core/TextField';
import Select from '@material-ui/core/Select';
import { useApiGet } from '../../hooks/useApiGet';
import { useApiPost } from '../../hooks/useApiPost';
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


function EmailInput(props) {
  const { step, classes, inputRoles } = props;
  const [email, setEmail] = useState();
  if(step !== 1) {
    return null;
  }

  const onEmailChange = (event) => {
    setEmail(event.target.value);
  };

  return (
    <div>
      <FormControl className={classes.formControl}>
        <TextField id="standard-basic" label="Email" onChange={onEmailChange}/>
        <p/>
        <div className={classes.buttons}>
          <Button variant="contained" className={classes.button} color="primary" onClick={e => inputRoles(email)}>Retrieve Roles</Button>
        </div>
      </FormControl>
    </div>
  )  
}

function RolesInput(props) {
  const { step, classes, email, updateRoles } = props;
  const [roles, setRoles] = useState([]);

  const cmd = {
    host: 'lightapi.net',
    service: 'user',
    action: 'getRolesByEmail',
    version: '0.1.0',
    data: { email }
  }
  const url = '/portal/query?cmd=' + encodeURIComponent(JSON.stringify(cmd));
  const headers = {};
  const callback = (data) => {
    //console.log("data = ", data);
    setRoles(data.roles.split(' '));
  }

  const { isLoading, data, error } = useApiGet({url, headers, callback});

  if(step !== 2) {
    return null;
  }

  const handleChange = (event) => {
    setRoles(event.target.value);
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

  return (
    <div>
      <FormControl className={classes.formControl}>
        <TextField disabled id="standard-basic" label="Email" defaultValue={email}/>
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
          <Button variant="contained" className={classes.button} color="primary" onClick={e => updateRoles(roles)}>Update Roles</Button>
        </div>
      </FormControl>
    </div>
  ) 
}

function RolesUpdate(props) {
  const { step, classes, email, roles } = props;
	const body = {
		host: 'lightapi.net',
		service: 'user',
		action: 'updateRoles',
		version: '0.1.0',
		data: { email, roles: roles.join(' ') }
	};
	const url = '/portal/command';
	const headers = {};
	const { isLoading, data, error } = useApiPost({url, headers, body});
	console.log(isLoading, data, error);
	let wait;
	if(isLoading) {
		wait = <div><CircularProgress/></div>;
	} else {
		wait = (
		<div>
	    	<pre>{ data ? JSON.stringify(data, null, 2) : error }</pre>
		</div>
		)  
	}	

  if(step !== 3) {
    return null;
  }

  return (
	<div>
		{wait}
	</div>
	);
}

export default function UpdateRoles(props) {
  const classes = useStyles();
  const theme = useTheme();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState();
  const [roles, setRoles] = useState([]);

  const inputEmail = () => {
    setStep(1);
  }

  const inputRoles = (email) => {
    //console.log("inputRoles email = ", email);
    setEmail(email);
    setStep(2);
  }

  const updateRoles = (roles) => {
    setRoles(roles);
    setStep(3);
  }

  return (
    <div>
      <EmailInput step={step} classes={classes} inputRoles={inputRoles}/>
      { email? <RolesInput step={step} classes={classes} email={email} inputEmail={inputEmail} updateRoles={updateRoles}/> : null }
      { step === 3 ? <RolesUpdate step={step} classes={classes} email={email} roles={roles} /> : null}
    </div>
  ) 
}
