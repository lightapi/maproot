import React, { useState } from 'react';
import Lightbox from 'react-image-lightbox';
import 'react-image-lightbox/style.css'; // This only needs to be imported once in your app
import { Image } from "@material-ui/icons";
  
export default function ImagePopup(props) {
    const [index, setIndex] = useState(0);
    const [open, setOpen] = useState(false);
    const { images }  = props;
    return (
        <div>
            <Image onClick={() => setOpen(true)}/>
            {open && (
            <Lightbox
            mainSrc={images[index].u}
            nextSrc={images[(index + 1) % images.length].u}
            prevSrc={images[(index + images.length - 1) % images.length].u}
            onCloseRequest={() => setOpen(false)}
            onMovePrevRequest={() => setIndex((index + images.length - 1) % images.length)}
            onMoveNextRequest={() => setIndex((index + 1) % images.length)}
            />
        )}
        </div>
    )
}
