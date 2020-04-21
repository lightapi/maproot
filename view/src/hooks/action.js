export const GET_REQUEST_STARTED = 'GET_REQUEST_STARTED';
export const GET_REQUEST_SUCCESS = 'GET_REQUEST_SUCCESS';
export const GET_REQUEST_FAILURE = 'GET_REQUEST_FAILURE';
export const SUBMIT_FORM_STARTED = 'SUBMIT_FORM_STARTED';
export const SUBMIT_FORM_SUCCESS = 'SUBMIT_FORM_SUCCESS';
export const SUBMIT_FORM_FAILURE = 'SUBMIT_FORM_FAILURE';
export const LOGIN = 'LOGIN';
export const LOGOUT = 'LOGOUT';

export const requestSuccess = ({data}) => ({
    type: GET_REQUEST_SUCCESS,
    data,
});

export const requestStarted = () => ({
	type: GET_REQUEST_STARTED
});

export const requestFailure = ({error}) => ({
    type: GET_REQUEST_FAILURE,
    error,
});

export const formSuccess = ({data}) => ({
	type: SUBMIT_FORM_SUCCESS,
	data,
});

export const formFailure = ({error}) => ({
	type: SUBMIT_FORM_FAILURE,
	error,
});

export const formStarted = () => ({
	type: SUBMIT_FORM_STARTED,
});

