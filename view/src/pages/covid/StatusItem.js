import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import DeleteIcon from '@material-ui/icons/Delete';
import { timeConversion } from '../../Utils';

const StatusItem = React.memo(({isReadonly, deleteItem, category, item}) => {
    const status = timeConversion(Date.now() - Object.keys(item)[0]) + ' ' + item[Object.keys(item)[0]];
    return (
        <ListItem>
             {isReadonly ? null : <DeleteIcon onClick={() => deleteItem(category, item)}/>} { status }
        </ListItem>
    )
});

export default StatusItem;
