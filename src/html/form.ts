import { FormManagerElement } from "../base-classes/form";

export function FindForm(submit: HTMLElement): FormManagerElement | undefined {
  const parent = submit.parentElement;
  if (!parent) return undefined;
  if (parent.tagName === "F-FORM") return parent as FormManagerElement;
  return FindForm(parent);
}
