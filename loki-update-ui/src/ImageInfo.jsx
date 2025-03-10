import React from "react";
import { useAdapterEndpoint, WithEndpoint, TitleCard } from "odin-react";
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import moment from "moment";

export default function ImageInfo() {
  const endpoint = useAdapterEndpoint(
    "loki-update",
    "http://192.168.0.154:8888"
  );

  const EndpointButton = WithEndpoint(Button);

  let installed_emmc_image = endpoint?.data?.installed_images?.emmc;
  let installed_sd_image = endpoint?.data?.installed_images?.sd;
  let installed_backup_image = endpoint?.data?.installed_images?.backup;
  let installed_flash_image = endpoint?.data?.installed_images?.flash;
  let installed_runtime_image = endpoint?.data?.installed_images?.runtime;

  const getHumanTime = (refreshTime) => {
    return moment.unix(refreshTime).format("DD/MM/YYYY HH:mm:ss");
  };

  return (
    <div className={"installed-images-container"}>
      <Container>
        <Row>
          <Col>
            <TitleCard title="Installed Image in EMMC">
              {!installed_emmc_image?.info?.error_occurred ? (
                <>
                  <p>App Name: {installed_emmc_image?.info?.app_name}</p>
                  <p>App Version: {installed_emmc_image?.info?.app_version}</p>
                  <p>Platform: {installed_emmc_image?.info?.platform}</p>
                </>
              ) : (
                <p>Error: {installed_emmc_image?.info?.error_message}</p>
              )}
              <p>
                Last Refresh:{" "}
                {getHumanTime(installed_emmc_image?.info?.last_refresh)}
              </p>
              <div>
                <EndpointButton
                  endpoint={endpoint}
                  event_type="click"
                  fullpath="installed_images/emmc/refresh"
                  value={true}
                >
                  Refresh
                </EndpointButton>
              </div>
            </TitleCard>
          </Col>
          <Col>
            <TitleCard title="Installed Image in SD">
              {!installed_sd_image?.info?.error_occurred ? (
                <>
                  <p>App Name: {installed_sd_image?.info?.app_name}</p>
                  <p>App Version: {installed_sd_image?.info?.app_version}</p>
                  <p>Platform: {installed_sd_image?.info?.platform}</p>
                </>
              ) : (
                <p>Error: {installed_sd_image?.info?.error_message}</p>
              )}
              <p>
                Last Refresh:{" "}
                {getHumanTime(installed_sd_image?.info?.last_refresh)}
              </p>
              <div>
                <EndpointButton
                  endpoint={endpoint}
                  event_type="click"
                  fullpath="installed_images/sd/refresh"
                  value={true}
                >
                  Refresh
                </EndpointButton>
              </div>
            </TitleCard>
          </Col>
        </Row>
        <Row>
          <Col>
            <TitleCard title="Installed Image in Backup">
              {!installed_backup_image?.info?.error_occurred ? (
                <>
                  <p>App Name: {installed_backup_image?.info?.app_name}</p>
                  <p>
                    App Version: {installed_backup_image?.info?.app_version}
                  </p>
                  <p>Platform: {installed_backup_image?.info?.platform}</p>
                </>
              ) : (
                <p>Error: {installed_backup_image.info?.error_message}</p>
              )}
              <p>
                Last Refresh:{" "}
                {getHumanTime(installed_backup_image?.info?.last_refresh)}
              </p>
              <div>
                <EndpointButton
                  endpoint={endpoint}
                  event_type="click"
                  fullpath="installed_images/backup/refresh"
                  value={true}
                >
                  Refresh
                </EndpointButton>
              </div>
            </TitleCard>
          </Col>
          <Col>
            <TitleCard title="Installed Image in Flash">
              {!installed_flash_image?.info?.error_occurred ? (
                <>
                  <p>App Name: {installed_flash_image?.info?.app_name}</p>
                  <p>App Version: {installed_flash_image?.info?.app_version}</p>
                  <p>Platform: {installed_flash_image?.info?.platform}</p>
                </>
              ) : (
                <p>Error: {installed_flash_image?.info?.error_message}</p>
              )}
              <p>
                Last Refresh:{" "}
                {getHumanTime(installed_flash_image?.info?.last_refresh)}
              </p>
              <div>
                <EndpointButton
                  endpoint={endpoint}
                  event_type="click"
                  fullpath="installed_images/flash/refresh"
                  value={true}
                >
                  Refresh
                </EndpointButton>
              </div>
            </TitleCard>
          </Col>
        </Row>
        <Row>
          <Col>
            <TitleCard title="Installed Image in Runtime">
              {!installed_runtime_image?.info?.error_occurred ? (
                <>
                  <p>App Name: {installed_runtime_image?.info?.app_name}</p>
                  <p>
                    App Version: {installed_runtime_image?.info?.app_version}
                  </p>
                  <p>Platform: {installed_runtime_image?.info?.platform}</p>
                </>
              ) : (
                <p>Error: {installed_runtime_image?.info?.error_message}</p>
              )}
              <p>
                Last Refresh:{" "}
                {getHumanTime(installed_runtime_image?.info?.last_refresh)}
              </p>
              <div>
                <EndpointButton
                  endpoint={endpoint}
                  event_type="click"
                  fullpath="installed_images/runtime/refresh"
                  value={true}
                >
                  Refresh
                </EndpointButton>
              </div>
            </TitleCard>
          </Col>
          <Col></Col>
        </Row>
      </Container>
    </div>
  );
}
