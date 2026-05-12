module.exports = {
  webpack: {
    configure: (config) => {
      const rules = config.module.rules || [];
      const sourceMapRule = rules.find(
        (r) => r.loader && String(r.loader).includes('source-map-loader')
      );
      if (sourceMapRule) {
        sourceMapRule.exclude = /node_modules/;
      }
      return config;
    },
  },
};
