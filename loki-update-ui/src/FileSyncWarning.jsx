import Badge from "react-bootstrap/Badge";
import Spinner from "react-bootstrap/Spinner";
import OverlayTrigger from "react-bootstrap/OverlayTrigger";
import Tooltip from "react-bootstrap/esm/Tooltip";

export default function FileSyncWarning() {
    return (
        <OverlayTrigger
            placement="right"
            overlay={
                <Tooltip>
                    The image may still be syncing to the MMC. You should wait,
                    shut down, or reboot before power on reset.
                </Tooltip>
            }
        >
            <Badge className="fs-sync-warning d-flex" bg="warning">
                <Spinner animation="grow" size="sm" />
                <span>File System Syncing</span>
            </Badge>
        </OverlayTrigger>
    );
}
