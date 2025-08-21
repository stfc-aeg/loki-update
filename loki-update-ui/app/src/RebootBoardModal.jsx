import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import ToastContainer from "react-bootstrap/ToastContainer";
import Toast from "react-bootstrap/Toast";
import Spinner from "react-bootstrap/Spinner";
import { WithEndpoint } from "odin-react";

const EndpointButton = WithEndpoint(Button);

export default function RebootBoardModal({ endpoint }) {
    const isRebooting = endpoint?.data?.reboot_board?.is_rebooting;

    const [show, setShow] = useState(false);
    const [rebooting, setRebooting] = useState(false);

    const handleReboot = () => {
        setShow(false);
        setRebooting(true);
    };

    useEffect(() => {
        if (isRebooting !== undefined) {
            setRebooting(isRebooting);
        }
    }, [isRebooting]);

    return (
        <>
            <Button
                className="reboot-board-button"
                variant="danger"
                onClick={() => setShow(true)}
            >
                Reboot Board
            </Button>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header>
                    <Modal.Title>Reboot Board</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    Are you sure you want to reboot the board?
                </Modal.Body>
                <Modal.Footer>
                    <EndpointButton
                        endpoint={endpoint}
                        event_type="click"
                        fullpath="reboot_board/reboot"
                        value={true}
                        pre_method={handleReboot}
                    >
                        Yes
                    </EndpointButton>
                    <Button
                        className={"card-button"}
                        onClick={() => setShow(false)}
                    >
                        No
                    </Button>
                </Modal.Footer>
            </Modal>

            <ToastContainer position="middle-center">
                <Toast bg={"info"} show={rebooting}>
                    <Toast.Header>
                        <strong>Rebooting board</strong>
                    </Toast.Header>
                    <Toast.Body>
                        <Spinner variant="primary" animation="border" />
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}
