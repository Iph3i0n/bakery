import ContextFetcher from "../base-classes/context-fetcher";
import BakeryBase from "../base-classes/main";
import Router from "../base-classes/router";
import { RenderEvent } from "../deps";

export function is_visible(self: BakeryBase) {
  let current = self.parentElement;

  while (current && current.tagName !== "BODY") {
    const fail = (still_failing: () => boolean) => {
      current?.addEventListener(RenderEvent.Key, function handler() {
        if (still_failing()) return;

        self.should_render();
        current?.removeEventListener(RenderEvent.Key, handler);
      });

      return false;
    };

    if (
      current.tagName === "U-IF" &&
      current instanceof ContextFetcher &&
      !current.use_string_context("check")
    )
      return fail(
        () =>
          current?.tagName === "U-IF" &&
          current instanceof ContextFetcher &&
          !current.use_string_context("check")
      );
    if (current instanceof Router && !current.CurrentlyMatching)
      return fail(
        () => current instanceof Router && !current.CurrentlyMatching
      );
    if (current.tagName === "U-EACH")
      return fail(() => current?.tagName === "U-EACH");
    current = current.parentElement;
  }

  return true;
}
