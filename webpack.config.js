const path = require("path");

const createExport = (framework, output, typings = true) => ({
  entry: {
    index: "./src/index.ts",
    "editor.worker": "monaco-editor/esm/vs/editor/editor.worker.js",
    "json.worker": "monaco-editor/esm/vs/language/json/json.worker",
    "css.worker": "monaco-editor/esm/vs/language/css/css.worker",
    "html.worker": "monaco-editor/esm/vs/language/html/html.worker",
    "ts.worker": "monaco-editor/esm/vs/language/typescript/ts.worker",
  },
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: [
          {
            loader: "ts-loader",
            options: {
              compilerOptions: {
                outDir: output,
              },
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.std$/,
        use: [
          {
            loader: "@ipheion/wholemeal/std",
            options: {
              framework,
              typings,
            },
          },
        ],
        exclude: /node_modules/,
      },
      {
        test: /\.pss$/,
        use: "@ipheion/wholemeal/pss",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["css-loader"],
      },
      {
        test: /\.ttf$/,
        use: ["file-loader"],
      },
    ],
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js", ".std", ".pss"],
  },
  output: {
    filename: "[name].js",
    path: output,
  },
  mode: process.env.PRODUCTION ? "production" : "development",
  watch: !process.env.PRODUCTION,
  externals: {
    react: "react",
    reactDOM: "react-dom",
  },
});

if (process.env.PRODUCTION)
  module.exports = [
    createExport("native", path.resolve(__dirname, "dist", "native")),
    createExport("react", path.resolve(__dirname, "dist", "react")),
    createExport("preact", path.resolve(__dirname, "dist", "preact")),
  ];
else
  module.exports = [
    createExport("native", path.resolve(__dirname, "docs", "dist")),
  ];
