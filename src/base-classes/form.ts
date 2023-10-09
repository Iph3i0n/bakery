import { ShouldRender, LoadedEvent, RenderEvent } from "../deps";
import c from "../html/classes";
import Router, { UrlBuilder } from "./router";
import ContextFetcher from "./context-fetcher";
import { is_visible } from "../html/is-visible";

const REGISTER_KEY = "__BAKERY_INTERNAL__register-form-element";
const VALIDATION_KEY = "__BAKERY_INTERNAL__request-validation";

type FormElementValue = string | File | File[] | boolean | undefined;
type FormValue = Record<string, FormElementValue>;

class RegisterFormElementEvent extends Event {
  #form_manager: FormManagerElement | undefined;

  constructor() {
    super(REGISTER_KEY, { bubbles: true, composed: true, cancelable: true });
  }

  get Manager() {
    return this.#form_manager;
  }

  set Manager(ele: FormManagerElement | undefined) {
    this.#form_manager = ele;
  }
}

class SubmittedEvent extends Event {
  readonly #data: FormValue;

  constructor(data: FormValue) {
    super("Submitted", { bubbles: true });
    this.#data = data;
  }

  get FormData() {
    return this.#data;
  }
}

class AfterSubmitEvent extends Event {
  readonly #data: FormValue;

  constructor(data: FormValue) {
    super("AfterSubmit", { bubbles: true });
    this.#data = data;
  }

  get FormData() {
    return this.#data;
  }
}

export abstract class FormManagerElement extends UrlBuilder {
  abstract method: string;
  abstract url: string;
  abstract credentials: RequestCredentials;
  abstract "success-url": string;
  abstract submit: string;

  readonly #elements: Array<FormElement> = [];

  constructor(target: HTMLElement) {
    super(target);
    this.addEventListener(REGISTER_KEY, (event) => {
      if (!(event instanceof RegisterFormElementEvent))
        throw new Error(
          "Only the register form element event class may be used to register an element."
        );
      const target = event.composedPath()[0];
      if (!(target instanceof FormElement))
        throw new Error("Only FormElement components may register themselves.");

      if (event.Manager) return;
      this.#elements.push(target);
      event.Manager = this;
    });
  }

  async #ajax_submit(data: FormData | FormValue) {
    let url = this.Render(this.url);
    if (this.method === "get") {
      const query = new URLSearchParams();
      if (data instanceof FormData) {
        data.forEach((v, k) => {
          if (v instanceof Blob)
            throw new Error("Only strings may be used in a get request");
          query.set(k, v);
        });
      } else {
        for (const key in data) {
          const value = data[key];
          if (value instanceof Blob)
            throw new Error("Only strings may be used in a get request");

          query.set(key, value?.toString() ?? "");
        }
      }

      url += "?" + query.toString();
    }

    const response = await fetch(url, {
      method: this.method,
      body:
        this.method === "get"
          ? undefined
          : data instanceof FormData
          ? data
          : JSON.stringify(data),
      credentials: this.credentials,
      headers:
        data instanceof FormData
          ? undefined
          : { "content-type": "application/json" },
    });

    let json: unknown;
    try {
      json = await response.json();
      // We swallow this error because no all endpoints return JSON.
      // deno-lint-ignore no-empty
    } catch {}

    this.provide_context("form_state", { response, json });
    if (!response.ok) return;

    document.dispatchEvent(new CustomEvent("data-invalidated"));

    const go_to = this["success-url"];
    if (!go_to) return;

    Router.Push(this.Render(go_to));
  }

  get #values() {
    const values: FormValue = {};
    for (const ele of this.#elements) {
      if (!ele || !is_visible(ele)) continue;
      else values[ele.submission_name] = ele.value;
    }

    return values;
  }

  #form_data_value(v: FormElementValue) {
    if (!v) return "";
    else if (typeof v === "boolean") return v ? "true" : "false";
    else if (typeof v === "string") return v;
    else if (v instanceof File) return v;
    else throw new Error("Unrecognised value type " + v);
  }

  get #form_data() {
    const result = new FormData();

    const values = this.#values;
    for (const key in values)
      result.set(key, this.#form_data_value(values[key]));

    return result;
  }

  #page_submit() {
    const form = document.createElement("form");
    form.action = this.url;
    form.method = this.method;

    const values = this.#values;
    for (const key in values) {
      const value = this.#form_data_value(values[key]);
      const input = document.createElement("input");
      input.name = key;
      if (typeof value === "string") {
        input.type = "text";
        input.value = value;
      } else {
        const container = new DataTransfer();
        container.items.add(value);
        input.type = "file";
        input.files = container.files;
      }

      form.appendChild(input);
    }

    document.body.appendChild(form);
    form.submit();
    form.remove();
  }

  Submit() {
    const validate_event = new CustomEvent(VALIDATION_KEY, {
      bubbles: false,
      cancelable: true,
    });
    this.dispatchEvent(validate_event);
    if (validate_event.defaultPrevented) return;

    const submit_event = new SubmittedEvent(this.#values);
    this.dispatchEvent(submit_event);
    if (submit_event.defaultPrevented) return;

    switch (this.submit ?? "ajax-json") {
      case "ajax-json": {
        this.#ajax_submit(this.#values);
        break;
      }
      case "ajax-form-data": {
        this.#ajax_submit(this.#form_data);
        break;
      }
      case "page-form-data": {
        this.#page_submit();
        break;
      }
      case "event-only": {
        break;
      }
    }

    this.dispatchEvent(new AfterSubmitEvent(this.#values));
  }
}

class ValueChangedEvent extends Event {
  readonly #key: string;
  readonly #value: FormElementValue;

  constructor(key: string, value: FormElementValue) {
    super("ValueChanged", { bubbles: true, cancelable: false });
    this.#key = key;
    this.#value = value;
  }

  get Value() {
    return this.#value;
  }

  get Name() {
    return this.#key;
  }
}

export default abstract class FormElement extends ContextFetcher {
  #value: FormElementValue = undefined;
  #touched = false;
  #focused = false;
  #form: FormManagerElement | undefined;

  abstract prefill: string;
  abstract disabled: boolean;
  abstract tabindex: string;
  abstract required: boolean;
  abstract validate: string;
  abstract name: string;

  constructor(target: HTMLElement) {
    super(target);

    this.addEventListener(RenderEvent.Key, () => {
      if (this.disabled) this.tabIndex = -1;
      else this.tabIndex = parseInt(this.tabindex ?? "0");
    });

    this.addEventListener("focus", () => {
      this.#focused = true;
      this.dispatchEvent(new ShouldRender());
    });

    this.addEventListener("blur", () => {
      this.#touched = true;
      this.#focused = false;
      this.dispatchEvent(new ShouldRender());
    });

    this.addEventListener(LoadedEvent.Key, () => {
      let default_value = this.use_string_context("prefill");
      this.value = default_value;

      const event = new RegisterFormElementEvent();
      this.dispatchEvent(event);

      const form = event.Manager;
      if (!form) return;

      this.#form = form;

      const on_validate = (e: Event) => {
        if (!this || !this.isConnected) {
          form.removeEventListener(VALIDATION_KEY, on_validate);
          return;
        }

        if (!is_visible(this)) return;

        this.#touched = true;
        if (!this.validity.valid) e.preventDefault();
        this.dispatchEvent(new ShouldRender());
      };

      this.#form.addEventListener(VALIDATION_KEY, on_validate);

      this.#form.addEventListener("AfterSubmit", () => {
        this.value = this.use_string_context("prefill");
        this.#touched = false;
      });

      this.addEventListener(RenderEvent.Key, () => {
        const next_default = this.use_string_context("prefill");

        if (next_default === default_value) return;
        default_value = next_default;
        this.value = next_default;
      });
    });
  }

  get value() {
    return this.#value;
  }

  set value(v: FormElementValue) {
    this.#value = v;
    this.should_render();
    this.dispatchEvent(new ValueChangedEvent(this.name, v));
  }

  submit() {
    this.#form?.Submit();
  }

  get is_bad_empty() {
    return this.required && !this.value;
  }

  get is_invalid() {
    if (!this.validate) return false;

    const test = this.value;
    if (typeof test !== "string") return true;

    return !test.match(new RegExp(this.validate, "gm"))?.length;
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
      ["disabled", !!this.disabled],
      ["error", this.should_show_validation]
    );
  }

  get submission_name() {
    return this.use_string_context("name");
  }
}
