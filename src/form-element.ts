import { ShouldRender, LoadedEvent, RenderEvent } from "./deps.ts";
import c from "./classes.ts";

export default abstract class FormElement extends HTMLElement {
  abstract readonly internals: ElementInternals;
  abstract readonly props: Record<string, string>;
  #value: string | boolean | undefined | File = undefined;
  #touched = false;
  #focused = false;

  #on_change = () => {
    this.#update_from_form();
    this.dispatchEvent(new ShouldRender());
  };

  get form(): HTMLFormElement {
    const form = this.internals.form;
    if (!form) throw new Error("Form elements must be inside a form");

    return form;
  }

  get #form_values() {
    const data = new FormData(this.form);
    const result: Record<string, string | boolean> = {};
    data.forEach((value, key) => {
      const v = value.toString();
      result[key] = v === "" || v === "true" ? true : v === "false" ? false : v;
    });

    return result;
  }

  #update_from_form() {
    const value = this.#form_values[this.name] || undefined;
    if (value) this.#value = value;
  }

  constructor() {
    super();

    this.addEventListener(RenderEvent.Key, () => {
      if (this.props.disabled) this.tabIndex = -1;
      else this.tabIndex = parseInt(this.props.tabindex ?? "0");
    });

    this.addEventListener(LoadedEvent.Key, () => {
      if (this.props.default) this.value = this.props.default;
      this.#on_change();
      this.form.addEventListener("change", this.#on_change);

      this.addEventListener("focus", () => {
        this.#focused = true;
        this.dispatchEvent(new ShouldRender());
      });

      this.addEventListener("blur", () => {
        this.#touched = true;
        this.#focused = false;
        this.dispatchEvent(new ShouldRender());
      });

      this.form.addEventListener("submit", (e) => {
        this.#touched = true;
        if (!this.validity.valid) e.preventDefault();
        self.dispatchEvent(new ShouldRender());
      });
    });
  }

  get value() {
    return this.#value;
  }

  set value(v: string | boolean | undefined | File) {
    this.#value = v;
    const input = v instanceof File ? v : v?.toString() ?? null;
    this.internals.setFormValue(input);
    this.dispatchEvent(new ShouldRender());
  }

  get name() {
    const result = this.getAttribute("name");

    if (!result) throw new Error("Form elements must have a name");
    return result;
  }

  submit() {
    this.internals.form?.requestSubmit();
  }

  formDisabledCallback(disabled: boolean) {
    this.setAttribute("disabled", disabled.toString());
  }

  formResetCallback() {
    this.value = this.getAttribute("default") ?? "";
  }

  get is_bad_empty() {
    return this.props.required && !this.#value;
  }

  get is_invalid() {
    if (!this.props.validate) return false;

    const test = this.#value;
    if (typeof test !== "string") return true;

    return !test.match(new RegExp(this.props.validate, "gm"))?.length;
  }

  get validity() {
    return {
      valid: !this.is_bad_empty && !this.is_invalid,
    };
  }

  get should_show_validation() {
    return this.#touched && !this.validity.valid;
  }

  get focused() {
    return this.#focused;
  }

  get label_class() {
    return c(
      "label",
      ["disabled", !!this.props.disabled],
      ["error", this.should_show_validation]
    );
  }
}

export function FindForm(submit: HTMLElement): HTMLFormElement | undefined {
  const parent = submit.parentElement;
  if (!parent) return undefined;
  if (parent.tagName === "FORM") return parent as HTMLFormElement;
  return FindForm(parent);
}
