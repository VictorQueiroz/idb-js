import { Configuration } from "webpack";
import HtmlWebpackPlugin from "html-webpack-plugin";
import path from "path";

const configurations: Configuration[] = [
  {
    mode: "development",
    entry: {
      test: path.resolve(__dirname, "../test"),
    },
    output: {
      path: path.resolve(__dirname, "../public"),
    },
    plugins: [new HtmlWebpackPlugin()],
  },
];

export default configurations;
