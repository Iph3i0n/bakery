const path = require("path");

const createExport = (options, output) => ({
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.tsx?$/,
        use: "ts-loader",
        exclude: /node_modules/,
      },
      {
        test: /\.std$/,
        use: {
          loader: "@ipheion/wholemeal/std",
          options,
        },
        exclude: /node_modules/,
      },
      {
        test: /\.pss$/,
        use: "@ipheion/wholemeal/pss",
        exclude: /node_modules/,
      },
      {
        test: /\.css$/,
        use: ["style-loader", "css-loader"],
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
    filename: output,
    path: path.resolve(__dirname, "docs", "dist"),
  },
  mode: "production",
  externals: {
    react: "react",
    reactDOM: "react-dom",
  },
});

module.exports = [
  createExport({ framework: "native" }, "bundle.min.js"),
  createExport({ framework: "react" }, "react.js"),
];
