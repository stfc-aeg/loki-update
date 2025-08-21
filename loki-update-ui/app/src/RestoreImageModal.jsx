import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/esm/Modal";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import ProgressBar from "react-bootstrap/ProgressBar";
import { WithEndpoint } from "odin-react";

const EndpointButton = WithEndpoint(Button);

export default function RestoreImageModal({ endpoint }) {
    const backupImage = endpoint?.data?.installed_images?.backup?.info;
    const progress = endpoint?.data?.copy_progress?.progress;
    const fileCopying = endpoint?.data?.copy_progress?.file_name;
    const isCopyingToEmmc = endpoint?.data?.installed_images?.emmc?.restore;
    const isCopying = endpoint?.data?.copy_progress?.copying;
    const isCopyingToFlash = endpoint?.data?.copy_progress?.flash_copying;
    const restoreSuccess = endpoint?.data?.copy_progress?.restore_success;

    const [show, setShow] = useState(false);
    const [success, setSuccess] = useState(false);

    useEffect(() => {
        setSuccess(restoreSuccess);
    }, [restoreSuccess]);

    return (
        <>
            <Button
                className="card-button"
                onClick={() => setShow(true)}
                disabled={isCopying || isCopyingToFlash}
            >
                Restore Image
            </Button>
            <Modal show={show} onHide={() => setShow(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Restore Image From Backup</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <p>
                        <strong>Current image in backup:</strong>
                    </p>
                    <p>Name: {backupImage?.app_name}</p>
                    <p>Application version: {backupImage?.app_version}</p>
                    <p>Platform: {backupImage?.platform}</p>
                    <hr />
                    Are you sure you want to restore this image?
                </Modal.Body>
                <Modal.Footer>
                    <EndpointButton
                        endpoint={endpoint}
                        event_type="click"
                        fullpath="installed_images/emmc/restore"
                        value={true}
                        pre_method={() => setShow(false)}
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
                <Toast bg={"info"} show={isCopyingToEmmc === true}>
                    <Toast.Header>
                        <strong>Copying</strong>
                    </Toast.Header>
                    <Toast.Body>
                        Copying files from backup, please wait
                        <br />
                        Copying {fileCopying}
                        <br />
                        <ProgressBar now={progress} label={`${progress}%`} />
                    </Toast.Body>
                </Toast>
            </ToastContainer>

            <ToastContainer position="middle-center">
                <Toast
                    bg={"success"}
                    show={success === true}
                    onClose={() => setSuccess(false)}
                >
                    <Toast.Header>
                        <strong>Success</strong>
                    </Toast.Header>
                    <Toast.Body>
                        Image successfully restored from backup
                    </Toast.Body>
                </Toast>
            </ToastContainer>
        </>
    );
}
