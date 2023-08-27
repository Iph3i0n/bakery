export class ImageEvent extends Event {
  readonly #file: File;

  constructor(file: File) {
    super("FileAdded", { bubbles: true, cancelable: false, composed: true });
    this.#file = file;
  }

  URL: Promise<string> | string | undefined = undefined;

  get File() {
    return this.#file;
  }
}
