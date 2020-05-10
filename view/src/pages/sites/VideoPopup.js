import React, { useState, useEffect } from 'react';
import 'react-responsive-modal/styles.css';
import { Modal } from 'react-responsive-modal';
import ReactPlayer from 'react-player';
import { VideoCall } from '@material-ui/icons';

export default function VideoPopup(props) {
    console.log("props = ", props);
    const [ open, setOpen ] = useState(props.open);
    const { url, reset } = props;

    useEffect(() => {
        setOpen(props.open);
    }, [props]);

    console.log("open = ", open);

    return (
        <div>
        <Modal
            open={open}
            onClose={() => {
                setOpen(!open);
                reset();
            }}
            styles={{
            modal: {
                maxWidth: "unset",
                width: "100%",
                padding: "unset"
            },
            overlay: {
                background: "rgba(0, 0, 0, 0.5)"
            },
            closeButton: {
                background: "yellow"
            }
            }}
            center
        >
        <ReactPlayer
            url={url}
            width="100%"
            height="calc(100vh - 100px)"
            />
        </Modal>
        </div>
    )
}
