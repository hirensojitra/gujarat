module.exports = {
  externals: {
    express: "commonjs express",
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: {
          loader: "babel-loader",
        },
      },
      // Add other loaders as needed
    ],
  },
};
