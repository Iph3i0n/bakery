import GlobalCss from "./global.pss";
import RenderSheet from "@ipheion/wholemeal/css";

export * as Display from "./area/display";
export * as Form from "./area/form";
export * as Layout from "./area/layout";
export * as Overlay from "./area/overlay";
export * as Text from "./area/text";
export * as Unit from "./area/unit";

const style = document.createElement("style");
style.innerHTML = RenderSheet(GlobalCss());
document.head.append(style);
