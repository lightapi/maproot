import React, { useState, useEffect, useReducer } from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import SchemaForm from 'react-schema-form/lib/SchemaForm';
import RcSelect from "react-schema-form-rc-select";
import utils from 'react-schema-form/lib/utils';
import { useCookies } from 'react-cookie';
import forms from '../../data/Forms';

const styles = theme => ({
    root: {
        display: 'flex',
        flexWrap: 'wrap',
    },
    formControl: {
        margin: theme.spacing(1),
        minWidth: 120,
    },
    selectEmpty: {
        marginTop: theme.spacing(2),
    },
    progress: {
        margin: theme.spacing(2),
    },
    button: {
        margin: theme.spacing(1),
    },
});

function Form(props) {
    const [fetching, setFetching] = useState(false);
    const [showErrors, setShowErrors]  = useState(false);
    const [formId, setFormId] = useState(null);
    const [schema, setSchema] = useState(null);
    const [form, setForm] = useState(null);
    const [actions, setActions] = useState(null);
    const [model, setModel] = useState({});
    const [cookies, setCookie] = useCookies(['csrf']);
    const mapper = {
        "rc-select": RcSelect
    };

    const { classes } = props;

    useEffect(() => {
        console.log(props.match.params.formId);
        let formData = forms[props.match.params.formId];
        setSchema(formData.schema);
        setForm(formData.form);
        setActions(formData.actions);
        console.log("state = ", props.location.state);
        // must ensure that the model is an empty object to the cascade dropdown
        setModel(props.location.state ? props.location.state.data || {} : formData.model || {});
    }, [props.match.params.formId])

    const onModelChange = (key, val, type) => {
        utils.selectOrSet(key, model, val, type);
        setModel({...model});  // here we must create a new object to force re-render.
    };

    function onButtonClick(action) {
        let validationResult = utils.validateBySchema(schema, model);
        if(!validationResult.valid) {
            setShowErrors(true);
        } else {
            console.log("model = ", model);
            // submit the form to the portal service.
            action.data = model;
            // use the path defined in the action, default to /portal/command.
            const url = action.path ? action.path : '/portal/command';
            const headers = {
                'Content-Type': 'application/json'
            };
            submitForm(url, headers, action);
        }
    };

    const submitForm = async (url, headers, action) => {
      setFetching(true);
      Object.assign(headers, {'X-CSRF-TOKEN': cookies.csrf})
      try {
        const response = await fetch(url, { method: 'POST', body: JSON.stringify(action), headers, credentials: 'include'});
        console.log(response);
        if (!response.ok) {
          throw response;
        }
        const data = await response.json();
        console.log(data);
        setFetching(false);
        props.history.push({pathname: action.success, state: { data }});
      } catch (e) {
          const error = await e.json();
          console.log(error);
          props.history.push({pathname: action.failure, state: { error }});
      }
    };

    if(schema) {
        var buttons = [];
        actions.map((item, index) => {
            buttons.push(<Button variant="contained" className={classes.button} color="primary" key={index} onClick={e => onButtonClick(item)}>{item.title}</Button>)
        });
        let wait;
        if(fetching) {
            wait = <div><CircularProgress className={classes.progress} /></div>;
        } else {
            wait = <div></div>;
        }
        let title = <h2>{schema.title}</h2>
        return (
            <div>
                {wait}
                {title}
                <SchemaForm schema={schema} form={form} model={model} mapper={mapper} showErrors={showErrors} onModelChange={onModelChange} />
                {buttons}
            </div>
        )
    } else {
        return (<CircularProgress className={classes.progress} />);
    }
}

export default withStyles(styles)(Form);
