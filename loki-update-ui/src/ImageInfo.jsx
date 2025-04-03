import React from "react";
import { useAdapterEndpoint, WithEndpoint } from "odin-react";
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Accordion from "react-bootstrap/esm/Accordion";
import ImageInfoCard from "./ImageInfoCard";

export default function ImageInfo() {
  const endpoint = useAdapterEndpoint(
    "loki-update",
    "http://192.168.0.194:8888",
    1000
  );

  const EndpointButton = WithEndpoint(Button);

  const installedEmmcImage = endpoint?.data?.installed_images?.emmc;
  const installedSdImage = endpoint?.data?.installed_images?.sd;
  const installedBackupImage = endpoint?.data?.installed_images?.backup;
  const installedFlashImage = endpoint?.data?.installed_images?.flash;
  const installedRuntimeImage = endpoint?.data?.installed_images?.runtime;

  const checkIdenticalPrimaryImages = () => {
    return (
      installedEmmcImage?.info?.app_name ===
        installedRuntimeImage?.info?.app_name &&
      installedEmmcImage?.info?.app_version ===
        installedRuntimeImage?.info?.app_version
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
                  <ImageInfoCard
                    installed_image={installedEmmcImage}
                    title="Installed Image in eMMC"
                    device="emmc"
                  />
                </Col>
                {checkIdenticalPrimaryImages ? (
                  <></>
                ) : (
                  <Col>
                    <ImageInfoCard
                      installed_image={installedRuntimeImage}
                      title="Installed Image in Runtime"
                      device="runtime"
                    />
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
                  <ImageInfoCard
                    installed_image={installedFlashImage}
                    title="Installed Image in Flash"
                    device="flash"
                  />
                </Col>
                <Col>
                  <ImageInfoCard
                    installed_image={installedBackupImage}
                    title="Installed Image in Backup"
                    device="backup"
                  />
                </Col>
                <Col>
                  <ImageInfoCard
                    installed_image={installedSdImage}
                    title="Installed Image in SD"
                    device="sd"
                  />
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
