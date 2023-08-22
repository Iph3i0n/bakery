import ContextFetcher from "../base-classes/context-fetcher.ts";
import BakeryBase from "../base-classes/main.ts";
import Router from "../base-classes/router.ts";

export function is_visible(self: BakeryBase) {
  let current = self.parentElement;
  while (current && current.tagName !== "BODY") {
    if (current.tagName === "U-IF" && current instanceof ContextFetcher)
      if (!current.use_string_context("check")) return false;
    if (current instanceof Router) if (!self.state.routing_data) return false;
    if (current.tagName === "U-EACH") return false;
    current = current.parentElement;
  }

  return true;
}
