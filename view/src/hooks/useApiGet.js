// https://dev.to/pallymore/clean-up-async-requests-in-useeffect-hooks-90h
import { useReducer, useEffect } from 'react';
import { requestStarted, requestSuccess, requestFailure } from './action';
import { reducer } from './reducer';
import Cookies from 'universal-cookie'

export const useApiGet = ({ url, headers }) => {
  const [state, dispatch] = useReducer(reducer, {
    isLoading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    const abortController = new AbortController();

    const fetchData = async () => {
      dispatch(requestStarted());
      try {
        const cookies = new Cookies();
        Object.assign(headers, {'X-CSRF-TOKEN': cookies.get('csrf')})
        const response = await fetch(url, { headers, credentials: 'include', signal: abortController.signal });
        //console.log(response);
        if (!response.ok) {
          throw response;
        }

        const data = await response.json();
        //console.log(data);
        dispatch(requestSuccess({ data }));  
      } catch (e) {
        // only call dispatch when we know the fetch was not aborted
        if (!abortController.signal.aborted) {
          const error = await e.json();
          console.log(error);
          dispatch(requestFailure({ error: error.description }));
        }        
      }
    };

    fetchData();

    return () => {
      abortController.abort();
    };
  }, []);

  return state;
};
