import React from 'react';
import ListItem from '@material-ui/core/ListItem';
import DeleteIcon from '@material-ui/icons/Delete';
import { timeConversion } from '../../Utils';
import { useUserState } from "../../context/UserContext";

const StatusItem = React.memo(({isReadonly, deleteItem, category, item}) => {
    const status = timeConversion(Date.now() - Object.keys(item)[0]) + ' ' + item[Object.keys(item)[0]];
    const { isAuthenticated, userId } = useUserState();

    const isDelIcon = !isReadonly || (isReadonly && isAuthenticated && status.includes('[' + userId + ']:'));
    console.log("isDelIcon = ", isDelIcon);
    return (
        <ListItem>
             {!isDelIcon ? null : <DeleteIcon onClick={() => deleteItem(category, item)}/>} { status }
        </ListItem>
    )
});

export default StatusItem;
