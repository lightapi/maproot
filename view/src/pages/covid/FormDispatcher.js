import React, { useState } from 'react';
import Subject from './Subject';
import Button from '@material-ui/core/Button';
import { Redirect } from 'react-router';

//import { makeStyles } from '@material-ui/core/styles';
import Cookies from 'universal-cookie'

export default function StatusContainer(props) {
	console.log("props = ", props);
	let form = '';
	switch(props.category) {
		case 'askandgive':
			switch(props.subcategory) {
				case 'ask':
					form = 'askForm';
				    break;
				case 'give':
				    form = 'giveForm';
				    break;
			}
			break;
		case 'freecycle':
		    switch(props.subcategory) {
		    	case 'offer':
		    		form = 'offerForm';
		    		break;
		    	case 'want':
		    	    form = 'wantForm';
		    	    break;
		    }
			break;
		case 'barter':
		    switch(props.subcategory) {
		    	case 'goods':
		    		form = 'goodsForm';
		    		break;
		    	case 'services': 
		            form = 'servicesForm';
		            break;
		    }
		    break;
		case 'buyandsell':
		    switch(props.subcategory) {
		    	case 'buy':
		    		form = 'buyForm';
		    		break;
		    	case 'sell': 
		            form = 'sellForm';
		            break;
		    }
		    break;
		case 'realestate':
		    switch(props.subcategory) {
		    	case 'forsale':
		    	case 'forrent': 
		            form = 'saleRentForm';
		            break;
		    	default:
		    		form = 'realEstateForm';
		    		break;
		    }
		    break;
		default:
		    form = 'statusForm';
		    break;
	}

    return <div><Redirect to={{
      			pathname: '/app/form/{form}',
      			state: props.subjects
  	  		}}/></div>
}

