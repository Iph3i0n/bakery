export function get_file(accept = "image/*") {
  return new Promise<File | undefined>((res) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = accept;

    input.onchange = () => {
      if (!input.files) res(undefined);
      else res(input.files[0]);
    };

    input.click();
  });
}
