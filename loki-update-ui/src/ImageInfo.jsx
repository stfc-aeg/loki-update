import React from "react";
import { useAdapterEndpoint, WithEndpoint, TitleCard } from "odin-react";
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Accordion from "react-bootstrap/esm/Accordion";
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

  const checkIdenticalPrimaryImages = () => {
    return (
      installed_emmc_image?.info?.app_name ===
        installed_runtime_image?.info?.app_name &&
      installed_emmc_image?.info?.app_version ===
        installed_runtime_image?.info?.app_version
    );
  };

  return (
    <div className={"installed-images-container"}>
      <Accordion defaultActiveKey={["0"]} alwaysOpen>
        <Accordion.Item eventKey="0">
          <Accordion.Header>
            {checkIdenticalPrimaryImages ? (
              <>Primary Installation</>
            ) : (
              <>Primary Installations</>
            )}
          </Accordion.Header>
          <Accordion.Body>
            <Container>
              <Row>
                <Col>
                  <TitleCard title="Installed Image in eMMC">
                    {!installed_emmc_image?.info?.error_occurred ? (
                      <>
                        <p>
                          <strong>App Name:</strong>{" "}
                          {installed_emmc_image?.info?.app_name}
                        </p>
                        <p>
                          <strong>App Version:</strong>{" "}
                          {installed_emmc_image?.info?.app_version}
                        </p>
                        <p>
                          <strong>Platform:</strong>{" "}
                          {installed_emmc_image?.info?.platform}
                        </p>
                      </>
                    ) : (
                      <p>
                        <strong>Error:</strong>{" "}
                        {installed_emmc_image?.info?.error_message}
                      </p>
                    )}
                    <p>
                      <strong>Last Refresh:</strong>{" "}
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
                {checkIdenticalPrimaryImages ? (
                  <></>
                ) : (
                  <Col>
                    <TitleCard title="Installed Image in Runtime">
                      {!installed_runtime_image?.info?.error_occurred ? (
                        <>
                          <p>
                            <strong>App Name:</strong>{" "}
                            {installed_runtime_image?.info?.app_name}
                          </p>
                          <p>
                            <strong>App Version:</strong>{" "}
                            {installed_runtime_image?.info?.app_version}
                          </p>
                          <p>
                            <strong>Platform:</strong>{" "}
                            {installed_runtime_image?.info?.platform}
                          </p>
                        </>
                      ) : (
                        <p>
                          <strong>Error:</strong>{" "}
                          {installed_runtime_image?.info?.error_message}
                        </p>
                      )}
                      <p>
                        <strong>Last Refresh:</strong>{" "}
                        {getHumanTime(
                          installed_runtime_image?.info?.last_refresh
                        )}
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
                )}
              </Row>
            </Container>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item>
          <Accordion.Header>Secondary Installations</Accordion.Header>
          <Accordion.Body>
            <Container>
              <Row>
                <Col>
                  <TitleCard title="Installed Image in Flash (Recovery)">
                    {!installed_flash_image?.info?.error_occurred ? (
                      <>
                        <p>
                          <strong>App Name:</strong>{" "}
                          {installed_flash_image?.info?.app_name}
                        </p>
                        <p>
                          <strong>App Version:</strong>{" "}
                          {installed_flash_image?.info?.app_version}
                        </p>
                        <p>
                          <strong>Platform:</strong>{" "}
                          {installed_flash_image?.info?.platform}
                        </p>
                      </>
                    ) : (
                      <p>
                        <strong>Error:</strong>{" "}
                        {installed_flash_image?.info?.error_message}
                      </p>
                    )}
                    <p>
                      <strong>Last Refresh:</strong>{" "}
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
                <Col>
                  <TitleCard title="Installed Image in Backup">
                    {!installed_backup_image?.info?.error_occurred ? (
                      <>
                        <p>
                          <strong>App Name:</strong>{" "}
                          {installed_backup_image?.info?.app_name}
                        </p>
                        <p>
                          <strong>App Version:</strong>{" "}
                          {installed_backup_image?.info?.app_version}
                        </p>
                        <p>
                          <strong>Platform:</strong>{" "}
                          {installed_backup_image?.info?.platform}
                        </p>
                      </>
                    ) : (
                      <p>
                        <strong>Error:</strong>{" "}
                        {installed_backup_image.info?.error_message}
                      </p>
                    )}
                    <p>
                      <strong>Last Refresh:</strong>{" "}
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
                  <TitleCard title="Installed Image in SD">
                    {!installed_sd_image?.info?.error_occurred ? (
                      <>
                        <p>
                          <strong>App Name:</strong>{" "}
                          {installed_sd_image?.info?.app_name}
                        </p>
                        <p>
                          <strong>App Version:</strong>{" "}
                          {installed_sd_image?.info?.app_version}
                        </p>
                        <p>
                          <strong>Platform:</strong>{" "}
                          {installed_sd_image?.info?.platform}
                        </p>
                      </>
                    ) : (
                      <p>
                        <strong>Error:</strong>{" "}
                        {installed_sd_image?.info?.error_message}
                      </p>
                    )}
                    <p>
                      <strong>Last Refresh:</strong>{" "}
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
            </Container>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
      <EndpointButton
        className={"refresh-all-button"}
        endpoint={endpoint}
        event_type="click"
        fullpath="installed_images/refresh_all_image_info"
        value={true}
      >
        Refresh All
      </EndpointButton>
    </div>
  );
}
