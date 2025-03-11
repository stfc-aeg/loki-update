import "./App.css";
import ImageInfo from "./ImageInfo";
import { OdinApp } from "odin-react";
import "odin-react/dist/index.css";
import "bootstrap/dist/css/bootstrap.min.css";

export default function App() {
  return (
    <OdinApp
      title="LOKI Update"
      icon_src="odin.png"
      navLinks={["Installed Images"]}
    >
      <ImageInfo />
    </OdinApp>
  );
}
