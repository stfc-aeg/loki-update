import React from "react";
import { useAdapterEndpoint, WithEndpoint } from "odin-react";
import Button from "react-bootstrap/esm/Button";
import Container from "react-bootstrap/esm/Container";
import Row from "react-bootstrap/esm/Row";
import Col from "react-bootstrap/esm/Col";
import Accordion from "react-bootstrap/esm/Accordion";
import ImageInfoCard from "./ImageInfoCard";
import RebootBoardModal from "./RebootBoardModal";
import FileSyncWarning from "./FileSyncWarning";

const EndpointButton = WithEndpoint(Button);

export default function ImageInfo() {
    const endpoint = useAdapterEndpoint(
        "loki-update",
        import.meta.env.VITE_ENDPOINT_URL,
        1000
    );

    const installedEmmcImage = endpoint?.data?.installed_images?.emmc;
    const installedSdImage = endpoint?.data?.installed_images?.sd;
    const installedBackupImage = endpoint?.data?.installed_images?.backup;
    const installedFlashImage = endpoint?.data?.installed_images?.flash;
    const installedRuntimeImage = endpoint?.data?.installed_images?.runtime;
    const isRebootAllowed = endpoint?.data?.restrictions?.allow_reboot;
    const mmcSynced = endpoint?.data?.copy_progress?.mmc_synced;

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
                        {mmcSynced ? <></> : <FileSyncWarning />}
                    </Accordion.Header>
                    <Accordion.Body>
                        <Container>
                            <Row>
                                <Col>
                                    <ImageInfoCard
                                        installed_image={installedEmmcImage}
                                        title="Installed Image in eMMC"
                                        device="emmc"
                                        endpoint={endpoint}
                                    />
                                </Col>
                                {checkIdenticalPrimaryImages ? (
                                    <></>
                                ) : (
                                    <Col>
                                        <ImageInfoCard
                                            installed_image={
                                                installedRuntimeImage
                                            }
                                            title="Installed Image in Runtime"
                                            device="runtime"
                                            endpoint={endpoint}
                                        />
                                    </Col>
                                )}
                            </Row>
                        </Container>
                    </Accordion.Body>
                </Accordion.Item>
                <Accordion.Item>
                    <Accordion.Header>
                        Secondary Installations
                        {mmcSynced ? <></> : <FileSyncWarning />}
                    </Accordion.Header>
                    <Accordion.Body>
                        <Container>
                            <Row>
                                <Col>
                                    <ImageInfoCard
                                        installed_image={installedFlashImage}
                                        title="Installed Image in Flash (Recovery)"
                                        device="flash"
                                        endpoint={endpoint}
                                    />
                                </Col>
                                <Col>
                                    <ImageInfoCard
                                        installed_image={installedBackupImage}
                                        title="Installed Image in Backup"
                                        device="backup"
                                        endpoint={endpoint}
                                    />
                                </Col>
                                <Col>
                                    <ImageInfoCard
                                        installed_image={installedSdImage}
                                        title="Installed Image in SD"
                                        device="sd"
                                        endpoint={endpoint}
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
            {isRebootAllowed ? <RebootBoardModal endpoint={endpoint} /> : <></>}
        </div>
    );
}
