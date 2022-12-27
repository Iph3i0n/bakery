window.CODE_EXAMPLES = {
  cdn_install: e("script", {
    src: "https://cdn.jsdelivr.net/npm/@paulpopat/bakery",
  }),
  form: {
    text: {
      basic: e("f-input", { name: "test" }, "Hello World"),
    },
    select: {
      basic: e(
        "f-select",
        { name: "test-select" },
        e("option", { value: "value-1" }, "First Value"),
        e("option", { value: "value-2" }, "Second Value"),
        e("option", { value: "value-3" }, "Third Value"),
        e("option", { value: "value-4" }, "Fourth Value"),
        e("option", { value: "value-5" }, "Fifth Value"),
        e("span", { slot: "label" }, "Hello world")
      ),
    },
    multiselect: {
      basic: e(
        "f-multiselect",
        { name: "test-multiselect" },
        e("option", { value: "value-1" }, "First Value"),
        e("option", { value: "value-2" }, "Second Value"),
        e("option", { value: "value-3" }, "Third Value"),
        e("option", { value: "value-4" }, "Fourth Value"),
        e("option", { value: "value-5" }, "Fifth Value"),
        e("span", { slot: "label" }, "Hello world")
      ),
    },
    singleselect: {
      basic: e(
        "f-singleselect",
        { name: "test-singleselect" },
        e("option", { value: "value-1" }, "First Value"),
        e("option", { value: "value-2" }, "Second Value"),
        e("option", { value: "value-3" }, "Third Value"),
        e("option", { value: "value-4" }, "Fourth Value"),
        e("option", { value: "value-5" }, "Fifth Value"),
        e("span", { slot: "label" }, "Hello world")
      ),
    },
    textarea: {
      basic: e("f-textarea", { name: "test-textarea" }, "Hello World"),
    },
    date: {
      basic: e("f-date", { name: "test-date" }, "Hello World"),
    },
    toggle: {
      basic: e(
        "f-toggle",
        { name: "test-toggle" },
        "Which do you pick?",
        e("span", { slot: "off" }, "Option One"),
        e("span", { slot: "on" }, "Option Two")
      ),
    },
  },
  fetch: {
    external: {
      basic: e(
        "u-fetch",
        { url: "/examples/fetch-example.json", key: "data" },
        e("t-paragraph", {}, e("u-text", { use: "data.example_text" }))
      ),
      locale: e(
        "u-fetch",
        {
          url: "/examples/{locale}/locale-example.json",
          key: "data",
          fallback: "/examples/fetch-example.json",
        },
        e("t-paragraph", {}, e("u-text", { use: "data.example_text" }))
      ),
    },
    global: {
      basic: e(
        "u-global",
        { var: "TEST_TEXT", key: "text" },
        e("t-paragraph", {}, e("u-text", { use: "text.title" }))
      ),
    },
    each: {
      basic: e(
        "u-fetch",
        { url: "/examples/fetch-example.json", key: "data" },
        e("u-each", { subject: "data.repeated", key: "text" }),
        e("t-paragraph", {}, e("u-text", { use: "text" }))
      ),
    },
    if: {
      basic: e(
        "u-fetch",
        { url: "/examples/fetch-example.json", key: "data" },
        e(
          "u-if",
          { check: "data.should_show" },
          e("t-paragraph", {}, e("u-text", { use: "data.example_text" }))
        ),
        e(
          "u-if",
          { check: "data.should_show_false" },
          e("t-paragraph", {}, e("u-text", { use: "data.example_text" }))
        )
      ),
    },
  },
  display: {
    card: {
      basic: e(
        "d-card",
        {},
        e("span", { slot: "title" }, "Card Title"),
        e("t-paragraph", {}, "Card body")
      ),
    },
    listgroup: {
      basic: e(
        "d-listgroup",
        {},
        e("span", {}, "Item One"),
        e("a", { href: "https://www.google.com/" }, "Item Two"),
        e("span", {}, "Item Three")
      ),
    },
    panel: {
      basic: e(
        "d-panel",
        { colour: "body" },
        e("t-paragraph", {}, "Hello world")
      ),
    },
    alert: {
      basic: e("d-alert", { colour: "warning" }, "Hello world"),
    },
  },
  layout: {
    grid: {
      basic: e(
        "l-container",
        {},
        e(
          "l-row",
          {},
          e(
            "l-col",
            { xs: "12", md: "6" },
            e("t-paragraph", {}, "Hello world 1")
          ),
          e(
            "l-col",
            { xs: "12", md: "6" },
            e("t-paragraph", {}, "Hello world 2")
          )
        )
      ),
    },
    header: {
      basic: e(
        "l-header",
        { logo: "/img/logo.png", "logo-alt": "Bakery" },
        e("a", { href: "https://www.google.com/" }, "To Google"),
        e(
          "form",
          { slot: "right", onsubmit: "event.preventDefault()" },
          e("f-input", { name: "search" }, "Search"),
          e("f-button", { type: "submit" }, "Submit")
        )
      ),
    },
    accordion: {
      basic: e(
        "div",
        {},
        e(
          "l-accordion",
          {},
          e("span", { slot: "title" }, "First Item"),
          e("t-paragraph", {}, "First Item Content")
        ),
        e(
          "l-accordion",
          {},
          e("span", { slot: "title" }, "Second Item"),
          e("t-paragraph", {}, "Second Item Content")
        ),
        e(
          "l-accordion",
          {},
          e("span", { slot: "title" }, "Third Item"),
          e("t-paragraph", {}, "Third Item Content")
        )
      ),
    },
  },
  overlay: {
    modal: {
      basic: e(
        "div",
        {},
        e(
          "f-button",
          { type: "button", id: "test-modal-trigger" },
          "Open the modal"
        ),
        e(
          "o-modal",
          { trigger: "#test-modal-trigger", size: "medium" },
          e("span", { slot: "title" }, "Modal Title"),
          e("t-paragraph", {}, "Modal Content")
        )
      ),
    },
    offcanvas: {
      basic: e(
        "div",
        {},
        e(
          "f-button",
          { type: "button", id: "test-offcanvas-trigger" },
          "Open the offcanvas"
        ),
        e(
          "o-offcanvas",
          { trigger: "#test-offcanvas-trigger", size: "medium" },
          e("span", { slot: "title" }, "Offcanvas Title"),
          e("t-paragraph", {}, "Offcanvas Content")
        )
      ),
    },
  },
  text: {
    heading: {
      basic: e("t-heading", { level: "h1" }, "Test Heading"),
    },
    icon: {
      basic: e("t-icon", {
        name: "calendar",
        size: "body",
        colour: "primary",
      }),
    },
    link: {
      basic: e(
        "t-link",
        { href: "https://www.google.com/", block: true },
        "Test Link"
      ),
    },
    localised: {
      basic: e(
        "t-paragraph",
        {},
        e(
          "t-localised",
          {},
          "Default Text",
          e("span", { slot: "en-GB" }, "British Text")
        )
      ),
    },
    paragraph: {
      basic: e("t-paragraph", {}, "Hello World"),
    },
  },
};
