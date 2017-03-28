
var gulp = require('gulp');
var webpack = require('webpack');
var gulpWebpack = require('webpack-stream');
var babel = require('gulp-babel');
var sourcemaps = require('gulp-sourcemaps');
var UglifyJSPlugin = require('uglifyjs-webpack-plugin');

gulp.task('build', ['babel', 'webpack', 'webpack-min']);

var FILE_NAME = 'sync-browser-mocks';
var MODULE_NAME = 'syncBrowserMocks';

var WEBPACK_CONFIG = {

  module: {
    rules: [
      {
        test: /\.js$/,
        use: ["source-map-loader"],
        enforce: "pre"
      }
    ]
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
        filename: '[file].map'
    })
  ],
  output: {
    filename: `${FILE_NAME}.js`,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    library: MODULE_NAME
  },
  bail: true
};

var WEBPACK_CONFIG_MIN = Object.assign({}, WEBPACK_CONFIG, {
  output: {
    filename: `${FILE_NAME}.min.js`,
    libraryTarget: 'umd',
    umdNamedDefine: true,
    library: MODULE_NAME
  },
  plugins: [
    new webpack.SourceMapDevToolPlugin({
        filename: '[file].map'
    }),
    new UglifyJSPlugin({
        test: /\.js$/,
        minimize: true,
        compress: { warnings: false },
        sourceMap: true
    })
  ]
});


gulp.task('webpack', ['babel'], function() {
  return gulp.src('dist/index.js')
      .pipe(gulpWebpack(WEBPACK_CONFIG, webpack))
      .pipe(gulp.dest('dist/webpacks'));
});

gulp.task('webpack-min', ['babel'], function() {
  return gulp.src('dist/index.js')
      .pipe(gulpWebpack(WEBPACK_CONFIG_MIN, webpack))
      .pipe(gulp.dest('dist/webpacks'));
});

gulp.task('babel', function () {
	return gulp.src('src/**/*.js')
    .pipe(sourcemaps.init())
		.pipe(babel())
    .pipe(sourcemaps.write('.'))
		.pipe(gulp.dest('dist'))
});
