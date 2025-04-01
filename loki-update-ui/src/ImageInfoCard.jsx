import React from "react";
import { TitleCard, useAdapterEndpoint, WithEndpoint } from "odin-react";
import moment from "moment";
import Button from "react-bootstrap/esm/Button";
import FileUploadModal from "./FileUploadModal";

export default function ImageInfoCard({ installed_image, title, device }) {
  const endpoint = useAdapterEndpoint(
    "loki-update",
    "http://192.168.0.194:8888",
    1000
  );

  const EndpointButton = WithEndpoint(Button);

  const getHumanTime = (refreshTime) => {
    return moment.unix(refreshTime).format("DD/MM/YYYY HH:mm:ss");
  };

  return (
    <TitleCard title={title}>
      {!installed_image?.info?.error_occurred ? (
        <>
          <p>
            <strong>App Name:</strong> {installed_image?.info?.app_name}
          </p>
          <p>
            <strong>App Version:</strong> {installed_image?.info?.app_version}
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
        {device !== "backup" ? (
          <FileUploadModal
            currentImage={installed_image?.info}
            device={device}
          />
        ) : (
          <></>
        )}
      </div>
    </TitleCard>
  );
}
