import React, {useState} from 'react';
import List from '@material-ui/core/List';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import Typography from '@material-ui/core/Typography';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import StatusItem from './StatusItem';
import Button from '@material-ui/core/Button';
import DeleteIcon from '@material-ui/icons/Delete';
import { timeConversion } from '../../Utils';
import { useUserState } from "../../context/UserContext";

export default function Subject(props) {
    const items = props.items;
    const category = props.category;
    const isReadonly = props.isReadonly;
    const { isAuthenticated } = useUserState();
    const [expanded, setExpanded] = useState(false);
    const [currentItem, setCurrentItem] = useState('');
    const first = items.length > 0 ? timeConversion(Date.now() - Object.keys(items[0])[0]) + ' ' + items[0][Object.keys(items[0])[0]] : '';

    return (
        <ExpansionPanel onClick={() => setExpanded(true)}>
            <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography>{isReadonly ? null : <DeleteIcon onClick={() => {props.delCategory(category)}}/>} {category} : {first}</Typography>
            </ExpansionPanelSummary>
            <ExpansionPanelDetails>
            {
                expanded &&
                <React.Fragment>
                <List>
                    {items.map((item, index) =>
                        <StatusItem key={index} isReadonly={isReadonly} deleteItem={props.deleteItem} category={category} item={item}/>
                    )}
                </List>
                {!isAuthenticated ? null : 
                    <div>
                        <input
                            type="text"
                            value={currentItem}
                            placeholder="Enter a new item"
                            onChange={e => {
                               setCurrentItem(e.target.value); 
                            }}
                        />            
                        <Button variant="contained" color="primary" onClick={() => {props.createItem(category, currentItem)}}>
                            Create Item
                        </Button>
                    </div>
                }
                </React.Fragment>
            }
            </ExpansionPanelDetails>
        </ExpansionPanel>
    )
};
