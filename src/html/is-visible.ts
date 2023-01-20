import BakeryBase from "../base-classes/main.ts";

export function is_visible(self: BakeryBase) {
  let current = self.parentElement;
  while (current && current.tagName !== "body") {
    if (current.tagName === "U-ROUTE")
      return !!self.use_context((ctx) => ctx.routing_data);
    current = current.parentElement;
  }

  return true;
}
