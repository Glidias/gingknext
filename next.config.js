module.exports = {
  target: 'experimental-serverless-trace',

  // !! 'node-libcurl' needs to be able to access '.node' files.
  // !! 'node-loader' is used as the loader via this webpack config.
  webpack(config, options) {
    config.module.rules.push({
      test: /\.node$/,
      loader: 'node-loader',
    });

    return config;
  }
}