import { IComponent, RenderEvent, LoadedEvent } from "./deps.ts";

export default function LinkFont(
  url: string,
  creator: string,
  self: IComponent
) {
  function make_sheet() {
    const ele = document.createElement("link");
    ele.href = url;
    ele.rel = "stylesheet";
    ele.setAttribute("data-creator", creator);
    return ele;
  }

  self.addEventListener(RenderEvent.Key, () => {
    if (!self.querySelector("link")) self.root.append(make_sheet());
  });

  self.addEventListener(LoadedEvent.Key, () => {
    if (!document.head.querySelector(`link[data-creator="${creator}"]`))
      document.head.append(make_sheet());
  });
}
