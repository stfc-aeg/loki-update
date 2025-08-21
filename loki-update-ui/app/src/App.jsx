import "bootstrap/dist/css/bootstrap.min.css";

import "./App.css";
import { OdinApp } from "odin-react";
import ImageInfo from "./ImageInfo";

function App() {
    return (
        <OdinApp title="LOKI Update">
            <ImageInfo />
        </OdinApp>
    );
}

export default App;
