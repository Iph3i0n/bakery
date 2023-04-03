import "./selection-polyfill.js";
import { CreateRef, LoadedEvent, PropsEvent, ShouldRender } from "../deps.ts";
import FormElement from "./form.ts";
import Slotted from "../toggleable-slot.ts";
import { get_file } from "../html/file.ts";

class ImageEvent extends Event {
  readonly #file: File;

  constructor(file: File) {
    super("ImageAdded", { bubbles: false, cancelable: false });
    this.#file = file;
  }

  URL: Promise<string> | string | undefined = undefined;
}

export default abstract class RichText extends FormElement {
  readonly #editor_ref = CreateRef<HTMLDivElement>();
  readonly #selector_ref = CreateRef<HTMLSelectElement>();
  readonly #link_input_ref = CreateRef<HTMLInputElement>();
  readonly #slot = Slotted();

  get #editor() {
    const result = this.#editor_ref.current;
    if (!result) throw new Error("Attempting to get the before init");
    return result;
  }

  get #selector() {
    const result = this.#selector_ref.current;
    if (!result) throw new Error("Attempting to get the before init");
    return result;
  }

  get #link_input() {
    const result = this.#link_input_ref.current;
    if (!result) throw new Error("Attempting to get the before init");
    return result;
  }

  // deno-lint-ignore no-explicit-any
  #exec(command: string, value: any = undefined) {
    document.execCommand(command, false, value);
  }

  #query_state(command: string) {
    return document.queryCommandState(command);
  }

  #update_state() {
    this.#selector.value = this.Format;
    this.#link_input.value =
      this.CurrentAnchor?.getAttribute("href")?.trim() ?? "";
    this.dispatchEvent(new ShouldRender());
  }

  constructor() {
    super();

    this.addEventListener(LoadedEvent.Key, () => {
      if (this.prefill) this.#editor.innerHTML = this.prefill;
      this.#editor.addEventListener("input", (e) => {
        const target = e.target;
        if (!(target instanceof Node)) return;
        const child = target.firstChild;

        if (child && child.nodeType === child.TEXT_NODE) this.Format = "p";
        else if (this.#editor.innerHTML === "<br>") this.#editor.innerHTML = "";
        this.value = this.#editor.innerHTML;
      });

      this.#editor.addEventListener("keydown", (e) => {
        if (e.key === "Enter" && this.Format === "blockquote") {
          e.preventDefault();
          setTimeout(() => (this.Format = "p"), 0);
        }
      });
    });

    this.addEventListener(PropsEvent.Key, (e) => {
      if (!this.#editor_ref.current) return;
      if (!(e instanceof PropsEvent)) return;
      if (e.Key !== "prefill") return;
      this.#editor.innerHTML = e.Value;
    });

    document.addEventListener("selectchange", () => this.#update_state());
    this.addEventListener("click", () => this.#update_state());
    this.addEventListener("keyup", () => this.#update_state());

    this.addEventListener("focus", () => this.#editor.focus());
  }

  get Format() {
    return document.queryCommandValue("formatBlock") || "p";
  }

  set Format(tag: string) {
    this.#exec("formatBlock", `<${tag}>`);
  }

  #current_anchor: HTMLAnchorElement | undefined = undefined;

  get CurrentAnchor() {
    try {
      // deno-lint-ignore no-explicit-any
      const selection: Selection = (this.root as any).getSelection();
      const range = selection.getRangeAt(0);
      if (!range) return this.#current_anchor;

      let start: Node | null = range.startContainer;
      if (start instanceof Text) start = start.parentElement;
      let end: Node | null = range.endContainer;
      if (end instanceof Text) end = end.parentElement;
      if (!(start instanceof HTMLElement)) {
        this.#current_anchor = undefined;
        return undefined;
      }

      if (start instanceof HTMLAnchorElement && start === end) {
        this.#current_anchor = start;
        return start;
      }
    } catch {
      this.#current_anchor = undefined;
      return undefined;
    }

    this.#current_anchor = undefined;
    return undefined;
  }

  get IsBold() {
    return this.#query_state("bold");
  }

  get IsItalic() {
    return this.#query_state("italic");
  }

  get IsStrikethrough() {
    return this.#query_state("strikethrough");
  }

  get IsUnderlined() {
    return this.#query_state("underline");
  }

  Stylify() {
    this.Format = this.#selector.value;
  }

  Urlify() {
    const anchor = this.CurrentAnchor;
    if (!anchor) return;
    anchor.href = this.#link_input.value;
  }

  Boldify() {
    this.#exec("bold", true);
  }

  Strikethroughify() {
    this.#exec("strikethrough", true);
  }

  Underlinify() {
    this.#exec("underline", true);
  }

  Ulify() {
    this.#exec("insertUnorderedList");
  }

  Olify() {
    this.#exec("insertOrderedList");
  }

  Lineify() {
    this.#exec("insertHorizontalRule");
  }

  Linkify() {
    this.#exec("createLink", " ");
    setTimeout(() => this.#update_state(), 0);
  }

  Unlinkify() {
    const anchor = this.CurrentAnchor;
    if (!anchor) return;
    const parent = anchor.parentElement;
    if (!parent) return;
    parent.replaceChild(
      document.createTextNode(anchor.textContent ?? ""),
      anchor
    );
  }

  async Image() {
    const reader = new FileReader();
    reader.addEventListener("load", () => {
      this.#exec("insertImage", reader.result);
      this.Format = "p";
    });

    const file = await get_file();
    if (!file) return;

    const event = new ImageEvent(file);
    this.dispatchEvent(event);
    if (event.URL) {
      this.#exec("insertImage", await event.URL);
      this.Format = "p";
    } else reader.readAsDataURL(file);
  }

  get FormatOptions() {
    return [
      { title: "Heading 1", value: "h1" },
      { title: "Heading 2", value: "h2" },
      { title: "Heading 3", value: "h3" },
      { title: "Heading 4", value: "h4" },
      { title: "Heading 5", value: "h5" },
      { title: "Heading 6", value: "h6" },
      { title: "Paragraph", value: "p" },
      { title: "Quote", value: "blockquote" },
      { title: "Code", value: "pre" },
    ];
  }

  get Slot() {
    return this.#slot;
  }

  get SelectorRef() {
    return this.#selector_ref;
  }

  get EditorRef() {
    return this.#editor_ref;
  }

  get LinkInputRef() {
    return this.#link_input_ref;
  }
}
