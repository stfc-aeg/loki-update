import React, { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/esm/Modal";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import Spinner from "react-bootstrap/Spinner";
import axios from "axios";

export default function FileUploadModal({ currentImage, device }) {
  const [show, setShow] = useState(false);
  const [files, setFiles] = useState([]);
  const [success, setSucess] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  const handleOpen = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setFiles([]);
  };

  const handleFileChange = (e) => {
    setFiles([...files, e.target.files[0]]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const formData = new FormData();
    files.map((file) => formData.append("file", file));

    try {
      handleClose();
      setLoading(true);

      await axios.post(
        "http://192.168.0.194:8888/api/0.1/loki-update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
      setLoading(false);
      setSucess(true);
    } catch (error) {
      console.log(error);
      setLoading(false);
      setError(true);
    }
  };

  return (
    <>
      <Button className={"update-button"} onClick={handleOpen}>
        Update Image
      </Button>
      <Modal show={show} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Update Image</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <p>
            <strong>Current image:</strong>
          </p>
          <p>Name: {currentImage?.app_name}</p>
          <p>Application version: {currentImage?.app_version}</p>
          <p>Platform: {currentImage?.platform}</p>
          <hr />
          <Form onSubmit={handleSubmit}>
            <Form.Group>
              <Form.Label>Select BOOT.BIN file</Form.Label>
              <Form.Control
                id="bootBinFile"
                type="file"
                name="file"
                accept=".BIN"
                onChange={handleFileChange}
              />
            </Form.Group>
            <hr />
            <Form.Group>
              <Form.Label>Select boot.scr file</Form.Label>
              <Form.Control
                id="bootScrFile"
                type="file"
                name="file"
                accept=".scr"
                onChange={handleFileChange}
              />
            </Form.Group>
            <hr />
            <Form.Group>
              <Form.Label>Select image.ub file</Form.Label>
              <Form.Control
                id="imageFile"
                type="file"
                name="file"
                accept=".ub"
                onChange={handleFileChange}
              />
            </Form.Group>
            <hr />
            <Button type="submit" disabled={files.length !== 3}>
              Upload Files
            </Button>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>
      {loading ? (
        <ToastContainer position="top-center">
          <Toast bg={"secondary"}>
            <Toast.Header>
              <strong>Uploading</strong>
            </Toast.Header>
            <Toast.Body>
              Uploading files, please wait
              <br />
              <Spinner animation="border" variant="primary" />
            </Toast.Body>
          </Toast>
        </ToastContainer>
      ) : (
        <></>
      )}
      {success ? (
        <ToastContainer position="top-center">
          <Toast bg={"success"} onClose={() => setSucess(false)}>
            <Toast.Header>
              <strong>Success</strong>
            </Toast.Header>
            <Toast.Body>Files uploaded successfully</Toast.Body>
          </Toast>
        </ToastContainer>
      ) : (
        <></>
      )}
      {error ? (
        <ToastContainer position="top-center">
          <Toast bg={"danger"} onClose={() => setError(false)}>
            <Toast.Header>
              <strong>Error</strong>
            </Toast.Header>
            <Toast.Body>An error occurred, please try again</Toast.Body>
          </Toast>
        </ToastContainer>
      ) : (
        <></>
      )}
    </>
  );
}
