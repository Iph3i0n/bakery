import BakeryBase from "./base-classes/main";
import { RenderEvent, LoadedEvent } from "./deps";

const loaded_css: Record<string, boolean> = {};

export function link_css(url: string, self: BakeryBase) {
  function make_sheet() {
    const ele = document.createElement("link");
    ele.href = url;
    ele.rel = "stylesheet";
    return ele;
  }

  self.addEventListener(RenderEvent.Key, () => {
    if (!self.querySelector("link")) self.root.append(make_sheet());
  });

  self.addEventListener(LoadedEvent.Key, () => {
    if (!loaded_css[url]) document.head.append(make_sheet());

    loaded_css[url] = true;
  });
}

const loaded: Record<string, Promise<void>> = {};
