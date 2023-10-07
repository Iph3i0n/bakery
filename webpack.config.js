const path = require("path");

module.exports = {
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
        use: "@ipheion/wholemeal/std",
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
    filename: "bundle.min.js",
    path: path.resolve(__dirname, "docs", "dist"),
  },
  mode: "production",
};
