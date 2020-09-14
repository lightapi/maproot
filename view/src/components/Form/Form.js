import React, { useState, useEffect } from 'react';
import { withStyles } from '@material-ui/core/styles';
import CircularProgress from '@material-ui/core/CircularProgress';
import Button from '@material-ui/core/Button';
import { SchemaForm, utils } from 'react-schema-form';
import RcSelect from "react-schema-form-rc-select";
import forms from '../../data/Forms';
import Cookies from 'universal-cookie'

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
    const [schema, setSchema] = useState(null);
    const [form, setForm] = useState(null);
    const [actions, setActions] = useState(null);
    const [model, setModel] = useState({});

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
    }, [props.match.params.formId, props.location.state])

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
      try {
        const cookies = new Cookies();
        Object.assign(headers, {'X-CSRF-TOKEN': cookies.get('csrf')})
        const response = await fetch(url, { method: 'POST', body: JSON.stringify(action), headers, credentials: 'include'});
        // we have tried out best to response json from our APIs; however, some services return text instead like light-oauth2.
        const s = await response.text();
        console.log("submit error", s);
        const data = JSON.parse(s);
        setFetching(false);
        if (!response.ok) {
            // code is not OK.
            props.history.push({pathname: action.failure, state: { error: data }});  
        } else {
            props.history.push({pathname: action.success, state: { data }});
        }
      } catch (e) {
        // network error here.
        console.log(e);
        // convert it to json as the failure component can only deal with JSON.
        const error = { error: e };
        props.history.push({pathname: action.failure, state: { error }});
      }
    };

    if(schema) {
        var buttons = [];
        actions.map((item, index) => {
            buttons.push(<Button variant="contained" className={classes.button} color="primary" key={index} onClick={e => onButtonClick(item)}>{item.title}</Button>)
            return buttons;
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
