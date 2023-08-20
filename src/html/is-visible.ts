import BakeryBase from "../base-classes/main.ts";

export function is_visible(self: BakeryBase) {
  let current = self.parentElement;
  while (current && current.tagName !== "body") {
    if (current.tagName === "U-ROUTE") return !!self.state.routing_data;
    current = current.parentElement;
  }

  return true;
}
