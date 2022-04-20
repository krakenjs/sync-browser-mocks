var gulp = require("gulp");
var webpack = require("webpack");
var gulpWebpack = require("gulp-webpack");

gulp.task("build", ["webpack", "webpack-min"]);

var FILE_NAME = "sync-browser-mocks";
var MODULE_NAME = "syncBrowserMocks";

var WEBPACK_CONFIG = {
  module: {
    loaders: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        loader: "babel",
        query: {
          presets: ["es2015"],
          plugins: [
            "transform-object-rest-spread",
            "syntax-object-rest-spread",
            "transform-es3-property-literals",
            "transform-es3-member-expression-literals",
          ],
        },
      },
    ],
  },
  output: {
    filename: `${FILE_NAME}.js`,
    libraryTarget: "umd",
    umdNamedDefine: true,
    library: MODULE_NAME,
  },
  bail: true,
};

var WEBPACK_CONFIG_MIN = Object.assign({}, WEBPACK_CONFIG, {
  output: {
    filename: `${FILE_NAME}.min.js`,
    libraryTarget: "umd",
    umdNamedDefine: true,
    library: MODULE_NAME,
  },
  plugins: [
    new webpack.optimize.UglifyJsPlugin({
      test: /\.js$/,
      exclude: /(node_modules|bower_components)/,
      minimize: true,
    }),
  ],
});

gulp.task("webpack", function () {
  return gulp
    .src("src/index.js")
    .pipe(gulpWebpack(WEBPACK_CONFIG))
    .pipe(gulp.dest("dist"));
});

gulp.task("webpack-min", function () {
  return gulp
    .src("src/index.js")
    .pipe(gulpWebpack(WEBPACK_CONFIG_MIN))
    .pipe(gulp.dest("dist"));
});
