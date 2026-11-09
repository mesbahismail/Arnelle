module.exports = ({ config }) => ({
  ...config,
  experiments: { ...config.experiments, baseUrl: process.env.RNL_PREVIEW_BASE_URL || '' },
});
