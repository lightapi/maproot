import React, { useState } from 'react';
import Subject from './Subject';
import Button from '@material-ui/core/Button';
//import { makeStyles } from '@material-ui/core/styles';
import Cookies from 'universal-cookie'

export default function StatusContainer(props) {
    const [subjects, setSubjects] = useState(props.subjects);
    const [currentCategory, setCurrentCategory] = useState('');

    const createItem = (category, item) => {
        // console.log("createItem is called!", category, item);
        let list = subjects[category];
        var object = {};
        object[Date.now().toString()] = item;
        list.unshift(object);
        //console.log("list = ", list);
        object = {};
        object[category] = list;
        setSubjects(prevState => {
            return {...prevState, ...object};
        });
    };

    const deleteItem = (category, item) => {
        console.log("deleteItem is called!", category, item);
        let list = subjects[category];
        console.log("list before removal", list);
        // remove the item from the list
        const filtered = list.filter(l => l !== item);
        console.log("list after removal", filtered);
        let object = {};
        object[category] = filtered;
        setSubjects(prevState => {
            return {...prevState, ...object};
        });
    };

    const delCategory = (category) => {
        console.log("del category is called!", category);
        delete subjects[category];
        setSubjects(prevState => {
            return {...prevState};
        });
    }
    
    const addCategory = () => {
        console.log("add category is clicked!");
        let object = {};
        object[currentCategory] = [];
        setSubjects(prevState => {
            return {...prevState, ...object};
        });    
    };

    const submitStatus = () => {
        console.log("submit status is clicked!");
        const url = '/portal/command';
        const headers = {
           'Content-Type': 'application/json'
        };
        const action = {
            host: 'lightapi.net',
            service: 'covid',
            action: 'updateStatus',
            version: '0.1.0',
            data: subjects
        }
        submit(url, headers, action);
    };

    const submit = async (url, headers, action) => {
      const cookies = new Cookies();
      Object.assign(headers, {'X-CSRF-TOKEN': cookies.get('csrf')})
      try {
        const response = await fetch(url, { method: 'POST', body: JSON.stringify(action), headers, credentials: 'include'});
        const s = await response.text();
        console.log("submit response", s);
        const data = JSON.parse(s);
        if (!response.ok) {
            // code is not OK.
            props.history.push({pathname: '/app/failure', state: { error: data }});  
        } else {
            props.history.push({pathname: '/app/success', state: { data }});
        }
      } catch (e) {
        // network error here.
        console.log(e);
        // convert it to json as the failure component can only deal with JSON.
        const error = { error: e };
        props.history.push({pathname: '/app/failure', state: { error }});
      }
    };


    return <React.Fragment>
        { Object.keys(subjects).map((key) => ( <Subject key={key} isReadonly={props.isReadonly} category={key} delCategory={delCategory} createItem={createItem} deleteItem={deleteItem} items={subjects[key]}/> ))}
        { props.isReadonly ? null :
        <div>
            <input
                type="text"
                value={currentCategory}
                placeholder="Enter a new category"
                onChange={e => {
                   setCurrentCategory(e.target.value); 
                }}
            />            
            <Button variant="contained" color="primary" onClick={addCategory}>
                Add Category
            </Button>
            <Button variant="contained" color="primary" onClick={submitStatus}>
                Submit Status
            </Button>
        </div>
        } 
    </React.Fragment>
};

