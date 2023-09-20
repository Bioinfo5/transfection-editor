const gulp = require("gulp");
const concat = require("gulp-concat");
const sourcemaps = require("gulp-sourcemaps");
const uglify = require("gulp-uglify-es").default;
const minifyCSS = require("gulp-csso");
const clean = require("gulp-clean");
const zip = require("gulp-zip");
const rename = require("gulp-rename");
const mergeStream = require("merge-stream");
const change = require('gulp-change');

const paths = {
	src: "src/",
	dest: "./dist",
	root: "."
}

function updateVersion(content) {
	const title = `<title>1E Therapeutics Plate Editor - ${process.env.npm_package_version}</title>`;
	return content.replace(/<title>.*<\/title>/g, title);
}

gulp.task("clean", function(cb) {
	return gulp.src("dist/*", {read: false})
	.pipe(clean());
});
gulp.task("build", function(cb) {
	gulp.src('./Editor.html')
		.pipe(change(updateVersion))
		.pipe(gulp.dest(paths.root));
	const apps = ["editor", "shared", "analyzer", "ui"];
	apps.forEach(function(a) { //Loop the array of apps to build
		//Build the js files
		gulp.src(paths.src + a + "/**/*.js")
		.pipe(sourcemaps.init())
		.pipe(concat(a + ".min.js"))
		.pipe(uglify())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(paths.dest));
		//Build the css files
		gulp.src(paths.src + a + "/**/*.css")
		.pipe(sourcemaps.init())
		.pipe(concat(a + "-styles.css"))
		.pipe(minifyCSS())
		.pipe(sourcemaps.write("."))
		.pipe(gulp.dest(paths.dest));
	});
	gulp.src("src/shared/shared-config/*.json")
		.pipe(gulp.dest(paths.dest));
	cb();
});
gulp.task("release", function(cb) {
	const folders = ["dependencies", "dist", "images"];
	const stream = mergeStream();
	folders.forEach(function(f) {
		stream.add(
			gulp.src([f + "/**/*", "!" + f + "/**/*.ini"])
			.pipe(rename(function(file) {
				file.dirname = f + '/' + file.dirname;
			}))
		);
	});
	stream.add(
		gulp.src("Editor.html")
			.pipe(change(updateVersion))
	);
	stream.pipe(zip("Release.zip"))
	.pipe(gulp.dest(paths.dest));
	cb();
});
gulp.task("default", gulp.series("clean", "build"));
