import React from "react";
import { TitleCard, useAdapterEndpoint, WithEndpoint } from "odin-react";
import moment from "moment";
import Button from "react-bootstrap/esm/Button";
import Spinner from "react-bootstrap/Spinner";
import FileUploadModal from "./FileUploadModal";
import BackUpImageModal from "./BackUpImageModal";
import RestoreImageModal from "./RestoreImageModal";

export default function ImageInfoCard({ installed_image, title, device }) {
  const endpoint = useAdapterEndpoint(
    "loki-update",
    "http://192.168.0.194:8888",
    1000
  );

  const EndpointButton = WithEndpoint(Button);

  const isFlashLoading = endpoint?.data?.installed_images?.flash?.loading;
  const allowOnlyEmmcUpload =
    endpoint?.data?.restrictions?.allow_only_emmc_upload;

  const getHumanTime = (refreshTime) => {
    return moment.unix(refreshTime).format("DD/MM/YYYY HH:mm:ss");
  };

  return (
    <TitleCard title={title}>
      {isFlashLoading && device === "flash" ? (
        <Spinner animation="border" variant="primary" />
      ) : (
        <>
          {!installed_image?.info?.error_occurred ? (
            <>
              <p>
                <strong>App Name:</strong> {installed_image?.info?.app_name}
              </p>
              <p>
                <strong>App Version:</strong>{" "}
                {installed_image?.info?.app_version}
              </p>
              <p>
                <strong>Platform:</strong> {installed_image?.info?.platform}
              </p>
              <p>
                <strong>Created:</strong>{" "}
                {getHumanTime(installed_image?.info?.time)}
              </p>
            </>
          ) : (
            <p>
              <strong>Error:</strong> {installed_image?.info?.error_message}
            </p>
          )}
          <p>
            <strong>Last Refresh:</strong>{" "}
            {getHumanTime(installed_image?.info?.last_refresh)}
          </p>
          <div>
            <EndpointButton
              endpoint={endpoint}
              event_type="click"
              fullpath={`installed_images/${device}/refresh`}
              value={true}
            >
              Refresh
            </EndpointButton>
            {device === "backup" ||
            device === "runtime" ||
            (allowOnlyEmmcUpload === true && device !== "emmc") ? (
              <></>
            ) : (
              <FileUploadModal
                currentImage={installed_image?.info}
                device={device}
              />
            )}
            {device === "emmc" ? (
              <>
                <BackUpImageModal />
                <RestoreImageModal />
              </>
            ) : (
              <></>
            )}
          </div>
        </>
      )}
    </TitleCard>
  );
}
