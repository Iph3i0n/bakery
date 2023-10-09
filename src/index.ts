import GlobalCss from "./global.pss";
import RenderSheet from "@ipheion/wholemeal/css";

export * from "./area/display";
export * from "./area/form";
export * from "./area/layout";
export * from "./area/overlay";
export * from "./area/text";
export * from "./area/unit";

const style = document.createElement("style");
style.innerHTML = RenderSheet(GlobalCss());
document.head.append(style);
