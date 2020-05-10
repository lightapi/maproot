import React from "react";
import { makeStyles } from '@material-ui/core/styles';
import Table from '@material-ui/core/Table';
import TableBody from '@material-ui/core/TableBody';
import TableCell from '@material-ui/core/TableCell';
import TableContainer from '@material-ui/core/TableContainer';
import TableHead from '@material-ui/core/TableHead';
import TableRow from '@material-ui/core/TableRow';
import Paper from '@material-ui/core/Paper';
import ImagePopup from './ImagePopup';
import VideoList from './VideoList';
import VideoPopup from './VideoPopup';

const useStyles = makeStyles({
    table: {
      minWidth: 700,
    },
  });

export default function Common(props) {
    const classes = useStyles();
    return (
        <div>
            {props.ss.map((subject, index) => (
            <React.Fragment  key={index}>
            <TableContainer component={Paper}>
                <Table className={classes.table} aria-label="spanning table">
                    <TableBody>
                        <TableRow>
                            <TableCell>From:</TableCell>
                            <TableCell align="left">{props.userId}</TableCell>
                            <TableCell align="left">Date:</TableCell>
                            <TableCell align="left">{subject.t}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={4} align="left">{subject.s}</TableCell>
                        </TableRow>
                        <TableRow>
                            <TableCell colSpan={4} align="left">{subject.d}</TableCell>
                        </TableRow>
                        {subject.is && subject.is.length > 0 || subject.vs && subject.is.length > 0 ? 
                        <TableRow>
                            <TableCell>Images:</TableCell>
                            <TableCell align="left"><ImagePopup images={subject.is}/></TableCell>
                            <TableCell align="left">Videos:</TableCell>
                            <TableCell align="left"><VideoList vs={subject.vs}/></TableCell>
                        </TableRow>
                        : null }
                    </TableBody>                
                </Table>            
            </TableContainer>
            <br/>
            </React.Fragment>
            ))}              
        </div>
    )
}
