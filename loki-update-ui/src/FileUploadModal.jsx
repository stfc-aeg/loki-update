import React, { useState } from "react";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/esm/Modal";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import ProgressBar from "react-bootstrap/ProgressBar";
import axios from "axios";
import { useAdapterEndpoint } from "odin-react";
import sha256 from "crypto-js/sha256";
import CryptoJS from "crypto-js";

export default function FileUploadModal({ currentImage, device }) {
  const endpoint = useAdapterEndpoint(
    "loki-update",
    "http://192.168.0.194:8888"
  );

  const copying = endpoint?.data?.copy_progress?.copying;
  const progress = endpoint?.data?.copy_progress?.progress;
  const fileCopying = endpoint?.data?.copy_progress?.file_name;

  const [show, setShow] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [error, setError] = useState(false);

  const handleOpen = () => setShow(true);
  const handleClose = () => {
    setShow(false);
    setFiles([]);
  };

  const handleFileChange = (e) => {
    setFiles([...files, e.target.files[0]]);
  };

  const generateHash = async (file) => {
    const content = await file.arrayBuffer();
    const hashContent = sha256(content).toString(CryptoJS.enc.utf8);
    console.log(content);
    console.log(hashContent);

    return hashContent;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setUploading(true);

    // let checksums = [];
    // files.map(async (file) => checksums.push(await generateHash(file)));

    // console.log(checksums);

    // await axios.put(
    //   "http://192.168.0.194:8888/api/0.1/loki-update/copy_progress/checksums",
    //   checksums
    // );

    const formData = new FormData();
    files.map((file) => formData.append("file", file));

    try {
      setError(false);
      handleClose();

      await axios.post(
        "http://192.168.0.194:8888/api/0.1/loki-update",
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );

      setUploadComplete(true);
      setUploading(false);
    } catch (error) {
      console.log(error);
      setUploading(false);
      setError(true);
    }
  };

  return (
    <>
      <Button
        className={"update-button"}
        onClick={handleOpen}
        disabled={copying}
      >
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
      {uploading ? (
        <ToastContainer position="middle-center">
          <Toast bg={"secondary"}>
            <Toast.Header>
              <strong>Uploading</strong>
            </Toast.Header>
            <Toast.Body>Uploading files, please wait</Toast.Body>
          </Toast>
        </ToastContainer>
      ) : (
        <></>
      )}
      {copying && uploadComplete ? (
        <ToastContainer position="middle-center">
          <Toast bg={"secondary"}>
            <Toast.Header>
              <strong>Copying</strong>
            </Toast.Header>
            <Toast.Body>
              Copying files, please wait
              <br />
              Copying {fileCopying}
              <br />
              <ProgressBar now={progress} label={`${progress}%`} />
            </Toast.Body>
          </Toast>
        </ToastContainer>
      ) : (
        <></>
      )}
      {error ? (
        <ToastContainer position="middle-center">
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
