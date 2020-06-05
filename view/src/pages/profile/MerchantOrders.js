import React from 'react';
import { makeStyles } from '@material-ui/core/styles';
import DeleteIcon from '@material-ui/icons/Delete';
import ReplyIcon from '@material-ui/icons/Reply'
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import { timeConversion } from '../../Utils';

const useRowStyles = makeStyles({
    root: {
      '& > *': {
        borderBottom: 'unset',
      },
    },
  });

  function Row(props) {
      console.log(props);
    const { row } = props;
    const classes = useRowStyles();

    const replyMessage = (userId, subject) => {
        props.history.push({pathname: '/app/form/privateMessage', state: { data : { userId, subject}}});
    };

    const deleteMessage = () => {
        if (window.confirm("Are you sure you want to delete the message?")) {
          console.log("delete the entry here");
        } 
    };

    return (
      <React.Fragment>
        <TableRow className={classes.root}>
          <TableCell component="th" scope="row">{timeConversion((new Date()).getTime() - row.timestamp)}</TableCell>
          <TableCell align="left"><ReplyIcon onClick={() => replyMessage(row.fromId, row.subject)}/>{row.fromId}</TableCell>
          <TableCell align="left">{row.subject}</TableCell>
          <TableCell align="right">
              <DeleteIcon onClick={() => console.log("delete is clicked", row.timestamp, row.fromId)} />
          </TableCell>
        </TableRow>
        <TableRow>
          <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={4}>
            {row.content}
          </TableCell>
        </TableRow>
      </React.Fragment>
    );
  }

export default function MerchantOrders(props) {
	console.log("props = ", props);
	console.log("data = ", props.location.state.data);
	const messages = props.location.state.data;
    return (
        <div>
            <h2>Orders</h2>
            <TableContainer component={Paper}>
                <Table aria-label="collapsible table">
                    <TableHead>
                    <TableRow>
                        <TableCell>Time</TableCell>
                        <TableCell align="left">From</TableCell>
                        <TableCell align="left">Subject</TableCell>
                        <TableCell/>
                    </TableRow>
                    </TableHead>
                    <TableBody>
                    {messages.map((msg, index) => (
                        <Row history={props.history} key={index} row={msg} />
                    ))}
                    </TableBody>
                </Table>
            </TableContainer>
        </div>
    );
}
