export default {
  plugins: [
    [
      'remark-validate-links',
      {
        // Don't check repository URLs
        repository: false,
      }
    ]
  ]
};
