window.e = function (tag, attr, ...children) {
  return {
    toString(level = 0) {
      const prefix = Array.apply(null, Array(level * 2)).join(" ");
      let attr_string = Object.keys(attr)
        .map((a) =>
          typeof attr[a] === "string"
            ? a + '="' + attr[a] + '"'
            : attr[a]
            ? a
            : ""
        )
        .filter((r) => r)
        .join(" ");
      if (attr_string) attr_string = " " + attr_string;
      const start = `<${tag}${attr_string}>`;

      if (children.length) {
        const test =
          prefix +
          start +
          children
            .map((c) => (typeof c === "string" ? c : c.toString(0)))
            .join("") +
          `</${tag}>`;
        if (test.length <= 100) return test;

        return (
          prefix +
          start +
          "\n" +
          children
            .map((c) =>
              typeof c === "string" ? prefix + "  " + c : c.toString(level + 1)
            )
            .join("\n") +
          "\n" +
          prefix +
          `</${tag}>`
        );
      }

      return prefix + start + `</${tag}>`;
    },
  };
};
