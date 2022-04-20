/* @flow */

module.exports = {
  extends: require.resolve(
    "@krakenjs/grumbler-scripts/config/.eslintrc-browser"
  ),

  rules: {
    "default-param-last": "off",
    "func-names": "off",
    "no-plusplus": "off",
    "no-commonjs": "off",
    "flowtype/require-return-type": "off",
  },
};
