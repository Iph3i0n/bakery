const tag = Deno.env.get("GITHUB_REF");

if (!tag?.match(/^[0-9]+\.[0-9]+\.[0-9]+$/gm))
  throw new Error("Version tags must match 0.0.0 but recieved " + tag);

await Deno.writeTextFile(
  "./dist/package.json",
  JSON.stringify({
    name: "@paulpopat/bakery",
    version: tag,
    description: "Web components for a modern PWA",
    main: "bundle.min.js",
    scripts: {},
    author: "Paul Popat",
    license: "ISC",
    repository: {
      type: "git",
      url: "https://github.com/PaulPopat/bakery.git",
    },
    readme: "https://github.com/PaulPopat/bakery/blob/master/readme.md",
    bugs: {
      url: "https://github.com/PaulPopat/bakery/issues",
    },
    homepage: "https://paulpopat.github.io/bakery/",
    publishConfig: {
      access: "public",
    },
    keywords: ["webcomponents", "pwa", "components"],
  })
);

await Deno.writeTextFile(
  "./dist/readme.md",
  await Deno.readTextFile("./readme.md")
);
