import React from 'react';
import { Redirect } from 'react-router';

export default function FormDispatcher(props) {
	//console.log("props = ", props);
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
				default:
					form = 'websiteForm';
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
				default:
					form = 'websiteForm';
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
				default:
					form = 'websiteForm';
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
				default:
					form = 'websiteForm';
					break;
			}
		    break;
		case 'realestate':
		    switch(props.subcategory) {
		    	case 'forsale':
		    	case 'forrent': 
		            form = 'realEstateForm';
		            break;
				case 'torent':
					form = 'toRentForm';
					break;
				case 'tobuy':
					form = 'toBuyForm';
					break;
				default:
					form = 'websiteForm';
					break;
		    }
		    break;
		default:
		    form = 'websiteForm';
		    break;
	}
	console.log("form = ", form);

    return <div><Redirect to={{
      			pathname: '/app/form/' + form,
      			state: {data: props.site}
  	  		}}/></div>
}

