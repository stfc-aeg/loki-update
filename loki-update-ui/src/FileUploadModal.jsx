import React, { useState, useEffect } from "react";
import Button from "react-bootstrap/esm/Button";
import Modal from "react-bootstrap/esm/Modal";
import Form from "react-bootstrap/Form";
import Toast from "react-bootstrap/Toast";
import ToastContainer from "react-bootstrap/ToastContainer";
import ProgressBar from "react-bootstrap/ProgressBar";
import axios from "axios";
import { useAdapterEndpoint } from "odin-react";
import CryptoJS from "crypto-js";

export default function FileUploadModal({ currentImage, device }) {
  const endpoint = useAdapterEndpoint(
    "loki-update",
    process.env.REACT_APP_ENDPOINT_URL,
    1000
  );

  const adapterEndpointURL = process.env.REACT_APP_ENDPOINT_URL ?? "";

  const isCopying = endpoint?.data?.copy_progress?.copying;
  const progress = endpoint?.data?.copy_progress?.progress;
  const fileCopying = endpoint?.data?.copy_progress?.file_name;
  const isFlashCopying = endpoint?.data?.copy_progress?.flash_copying;
  const flashStage = endpoint?.data?.copy_progress?.flash_copy_stage;
  const flashCopyFileNum =
    endpoint?.data?.copy_progress?.flash_copying_file_num;
  const copyError = endpoint?.data?.copy_progress?.copy_error;
  const currentTarget = endpoint?.data?.copy_progress?.target;
  const copySuccess = endpoint?.data?.copy_progress?.success;
  const repos = endpoint?.data?.github_repos?.repo_info;
  const isDownloading = endpoint?.data?.github_repos?.downloading;
  const allowImagesFromRepo =
    endpoint?.data?.restrictions?.allow_images_from_repo;

  const defaultRepo = device === "flash" ? "loki" : "";

  const [show, setShow] = useState(false);
  const [files, setFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [uploadComplete, setUploadComplete] = useState(false);
  const [uploadError, setUploadError] = useState(false);
  const [success, setSuccess] = useState(false);
  const [fileInput, setFileInput] = useState("fileSystem");
  const [repoSelected, setRepoSelected] = useState(defaultRepo);
  const [availableTags, setAvailableTags] = useState([]);
  const [tagSelected, setTagSelected] = useState("");

  const handleOpen = () => {
    setShow(true);
    setFileInput("fileSystem");
  };

  const handleClose = () => {
    setShow(false);
    setFiles([]);
    setRepoSelected("");
  };

  useEffect(() => {
    if (repoSelected && repos) {
      const selectedRepo = repos.find((repo) => repo.name === repoSelected);
      if (selectedRepo) {
        setAvailableTags(selectedRepo.tags);
      }
    } else {
      setAvailableTags([]);
    }
  }, [repoSelected, repos]);

  useEffect(() => {
    setSuccess(copySuccess);
  }, [copySuccess]);

  const handleFileChange = (e) => {
    setFiles([...files, e.target.files[0]]);
  };

  const generateHash = async (file) => {
    let checksumObject = {};
    checksumObject["fileName"] = file.name;
    const content = await file.arrayBuffer();
    const wordArray = CryptoJS.lib.WordArray.create(new Uint8Array(content));
    checksumObject["checksum"] = CryptoJS.SHA256(wordArray).toString(
      CryptoJS.enc.Hex
    );

    return checksumObject;
  };

  const putDevice = async () => {
    await axios.put(
      adapterEndpointURL + "/api/0.1/loki-update/copy_progress/target",
      JSON.stringify(device),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    handleClose();
    setUploading(true);

    let checksums = [];
    await Promise.all(
      files.map(async (file) => checksums.push(await generateHash(file)))
    );

    const formData = new FormData();
    files.map((file) => formData.append("file", file));

    try {
      setUploadError(false);

      await axios.put(
        adapterEndpointURL + "/api/0.1/loki-update/copy_progress/checksums",
        JSON.stringify(checksums),
        {
          headers: {
            "Content-Type": "application/json",
          },
        }
      );

      await putDevice();

      await axios.post(adapterEndpointURL + "/api/0.1/loki-update", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      setUploadComplete(true);
      setUploading(false);
    } catch (error) {
      console.log(error);
      setUploading(false);
      setUploadError(true);
    }
  };

  const handleRepoSubmit = async (e) => {
    e.preventDefault();
    handleClose();

    const release = {
      repo: repoSelected,
      tag: tagSelected,
    };

    await putDevice();

    await axios.put(
      process.env.REACT_APP_ENDPOINT_URL +
        "/api/0.1/loki-update/github_repos/release_to_retrieve",
      JSON.stringify(release),
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  };

  return (
    <>
      <Button
        className={"card-button"}
        onClick={handleOpen}
        disabled={isCopying || isFlashCopying}
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
          {allowImagesFromRepo === true ? (
            <>
              <p>Source of files:</p>
              <Form>
                <Form.Group onChange={(e) => setFileInput(e.target.value)}>
                  <Form.Check
                    type="radio"
                    checked={fileInput === "fileSystem"}
                    label="File System"
                    value={"fileSystem"}
                  />
                  <Form.Check
                    type="radio"
                    checked={fileInput === "github"}
                    label="GitHub Repository"
                    value={"github"}
                    onClick={() => {
                      setRepoSelected(defaultRepo);
                      setTagSelected("");
                    }}
                  />
                </Form.Group>
              </Form>
              <hr />
            </>
          ) : (
            <></>
          )}
          {fileInput === "fileSystem" ? (
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
          ) : (
            <Form onSubmit={handleRepoSubmit}>
              <Form.Group>
                <Form.Label>Select GitHub Repository</Form.Label>
                <Form.Select
                  onChange={(e) => setRepoSelected(e.target.value)}
                  disabled={device === "flash"}
                >
                  {device === "flash" ? (
                    <>
                      <option key="loki" value="loki">
                        loki
                      </option>
                    </>
                  ) : (
                    <>
                      <option key="default" value="">
                        Select a repository
                      </option>
                      {repos.map((repo) => (
                        <option key={repo.name} value={repo.name}>
                          {repo.name}
                        </option>
                      ))}
                    </>
                  )}
                </Form.Select>
                <hr />
                <Form.Label>Select Tag</Form.Label>
                <Form.Select
                  onChange={(e) => setTagSelected(e.target.value)}
                  disabled={repoSelected === ""}
                >
                  <option key="default" value="">
                    Select a tag
                  </option>
                  {availableTags.map((tag) => (
                    <option key={tag} value={tag}>
                      {tag}
                    </option>
                  ))}
                </Form.Select>
              </Form.Group>
              <hr />
              <Button
                type="submit"
                disabled={repoSelected === "" || tagSelected === ""}
              >
                Submit
              </Button>
            </Form>
          )}
        </Modal.Body>
        <Modal.Footer>
          <Button onClick={handleClose}>Close</Button>
        </Modal.Footer>
      </Modal>

      <ToastContainer position="middle-center">
        <Toast bg={"secondary"} show={uploading}>
          <Toast.Header>
            <strong>Uploading</strong>
          </Toast.Header>
          <Toast.Body>Uploading files, please wait</Toast.Body>
        </Toast>
      </ToastContainer>

      <ToastContainer position="middle-center">
        <Toast
          bg={"secondary"}
          show={isDownloading && device === currentTarget}
        >
          <Toast.Header>
            <strong>Downloading</strong>
          </Toast.Header>
          <Toast.Body>
            Downloading files from repository, please wait
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <ToastContainer position="middle-center">
        <Toast bg={"info"} show={isFlashCopying === true && device === "flash"}>
          <Toast.Header>
            <strong>Copying</strong>
          </Toast.Header>
          <Toast.Body>
            Copying files to flash, this may take a while
            <br />
            Copying {flashCopyFileNum} of 3
            <br />
            {flashStage}
            <ProgressBar now={progress} label={`${progress}%`} />
          </Toast.Body>
        </Toast>
      </ToastContainer>

      <ToastContainer position="middle-center">
        <Toast
          bg={"info"}
          show={
            isCopying === true &&
            device === currentTarget &&
            uploadComplete === true
          }
        >
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

      <ToastContainer position="middle-center">
        <Toast
          bg={"danger"}
          onClose={() => setUploadError(false)}
          show={
            (uploadError === true || copyError === true) &&
            device === currentTarget
          }
        >
          <Toast.Header>
            <strong>Error</strong>
          </Toast.Header>
          <Toast.Body>An error occurred, please try again</Toast.Body>
        </Toast>
      </ToastContainer>

      <ToastContainer position="middle-center">
        <Toast
          bg={"success"}
          show={success === true && device === currentTarget}
          onClose={() => setSuccess(false)}
        >
          <Toast.Header>
            <strong>Success</strong>
          </Toast.Header>
          <Toast.Body>Image successfully updated</Toast.Body>
        </Toast>
      </ToastContainer>
    </>
  );
}
