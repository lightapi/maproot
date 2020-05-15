import React, { useEffect, useRef } from "react";
import { Scrollbars } from 'react-custom-scrollbars';

const CartScrollBar = props => {
  const scrollbars = useRef(null);
  
  const onScroll = (e) => {
  	const positions = scrollbars.current.getValues();
  	if (positions.top >= 1){
      console.log("Reached scroll end!");
      event.stopPropagation();
    }
  }

  useEffect(() => {
    window.addEventListener('scroll', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll);
    };
  }, []);


  return (
    <Scrollbars style={{ width: 360, height: 320 }} ref={scrollbars}>
      {props.children}
    </Scrollbars>
  );
};

export default CartScrollBar;
