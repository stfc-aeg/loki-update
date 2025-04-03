import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/esm/Modal";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import ProgressBar from "react-bootstrap/ProgressBar";
import { useAdapterEndpoint, WithEndpoint } from "odin-react";

export default function BackUpImageModal() {
  const endpoint = useAdapterEndpoint(
    "loki-update",
    "http://192.168.0.194:8888",
    1000
  );

  const EndpointButton = WithEndpoint(Button);

  const progress = endpoint?.data?.copy_progress?.progress;
  const fileCopying = endpoint?.data?.copy_progress?.file_name;
  const isCopyingToBackup = endpoint?.data?.installed_images?.emmc?.backup;
  const isCopying = endpoint?.data?.copy_progress?.copying;
  const isFlashCopying = endpoint?.data?.copy_progress?.flash_copying;
  const backupSuccess = endpoint?.data?.copy_progress?.backup_success;

  const [show, setShow] = useState(false);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    setSuccess(backupSuccess);
  }, [backupSuccess]);

  return (
    <>
      <Button
        className={"card-button"}
        onClick={() => setShow(true)}
        disabled={isCopying || isFlashCopying}
      >
        Back Up Image
      </Button>
      <Modal show={show} onHide={() => setShow(false)}>
        <Modal.Header closeButton>
          <Modal.Title>Back Up Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>Are you sure you want to back up this image?</Modal.Body>
        <Modal.Footer>
          <EndpointButton
            endpoint={endpoint}
            event_type="click"
            fullpath="installed_images/emmc/backup"
            value={true}
            pre_method={() => setShow(false)}
          >
            Yes
          </EndpointButton>
          <Button className={"card-button"} onClick={() => setShow(false)}>
            No
          </Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="middle-center">
        <Toast bg={"info"} show={isCopyingToBackup === true}>
          <Toast.Header>
            <strong>Copying To Backup</strong>
          </Toast.Header>
          <Toast.Body>
            Copying files to backup, please wait
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
          <Toast.Body>Image successfully backed up</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
