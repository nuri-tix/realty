const fs = require('fs');
const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const gulpif = require('gulp-if');

const browsersync = require('browser-sync').create();

const fileInclude = require('gulp-file-include');

const scss = require('gulp-sass')(require('sass'));
const notify = require('gulp-notify');
const cleanCss = require('gulp-clean-css');
const autoprefixer = require('gulp-autoprefixer');
const groupMedia = require('gulp-group-css-media-queries');
const rename = require('gulp-rename');

const uglify = require("gulp-uglify-es").default;

const imagemin = require("gulp-imagemin");
const webp = require('imagemin-webp');
const webpcss = require('gulp-webp-css');
const webphtml = require('gulp-webp-html');

const ttf2woff2 = require('gulp-ttf2woff2');

const cleanPath = require('gulp-clean');

let project_name = require("path").basename(__dirname);
let src_folder = "src";

let path = {
	build: {
		html: project_name + '/',
		css: project_name + '/css/',
		js: project_name + '/js/',
		images: project_name + '/img/',
		fonts: project_name + '/fonts/',
		assets: project_name + '/assets/',
		json: project_name + '/json/',
	},
	src: {
		html: [src_folder + "/*.html", "!" + src_folder + "/_*.html"],
		css: src_folder + '/scss/style.scss',
		js: [src_folder + "/js/script.js", src_folder + "/js/vendors.js"],
		images: [src_folder + "/img/**/*.{jpg,png,jpeg}", "!**/favicon.*"],
		icons: src_folder + "/img/**/*.svg",
		fonts: src_folder + "/fonts/*.ttf",
		assets: src_folder + "/assets/**/*.*",
		json: src_folder + '/json/*.*',
	},
	watch: {
		html: src_folder + '/*.html',
		css: src_folder + '/scss/**/*.{scss,css}',
		js: src_folder + '/js/**/*.js',
		images: src_folder + "/img/**/*.{jpg,png,svg,gif,ico,webp}",
		icons: src_folder + "/img/**/*.svg",
		fonts: src_folder + "/fonts/*.ttf",
		assets: src_folder + "/assets/**/*.*",
		json: src_folder + '/json/*.*',
	},
	clean: project_name + "/"
};

function html() {
	return src(path.src.html)
		.pipe(fileInclude())
		.pipe(dest(path.build.html))
		.pipe(browsersync.stream());
}

function css() {
	return src(path.src.css)
		.pipe(scss({ outputStyle: 'expanded' }).on('error', notify.onError()))
		.pipe(groupMedia())
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(dest(path.build.css))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(cleanCss({
			level: 2,
		}))
		.pipe(dest(path.build.css))
		.pipe(browsersync.stream());
}

function js() {
	return src(path.src.js)
		.pipe(fileInclude())
		.pipe(dest(path.build.js))
		.pipe(uglify().on('error', notify.onError()))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(dest(path.build.js))
		.pipe(browsersync.stream());
}

function images() {
	return src(path.src.images)
		// .pipe(
		// 	imagemin({
		// 		progressive: true,
		// 		svgoPlugins: [{ removeViewBox: false }],
		// 		interlaced: true,
		// 		optimizationLevel: 3 // 0 to 7
		// 	})
		// )
		.pipe(dest(path.build.images))
		.pipe(browsersync.stream());
}

function icons() {
	return src(path.src.icons)
		.pipe(dest(path.build.images))
		.pipe(browsersync.stream());
}

function fonts() {
	return src(path.src.fonts)
		.pipe(ttf2woff2())
		.pipe(dest(path.build.fonts))
		.pipe(browsersync.stream());
}

function fontstyle() {
	let file_content = fs.readFileSync(src_folder + '/scss/components/fonts.scss');
	if (file_content == '') {
		fs.writeFile(src_folder + '/scss/components/fonts.scss', '', cb);
		fs.readdir(path.build.fonts, function (err, items) {
			if (items) {
				let c_fontname;
				for (var i = 0; i < items.length; i++) {
					let fontname = items[i].split('.');
					fontname = fontname[0];
					if (c_fontname != fontname) {
						fs.appendFile(src_folder + '/scss/components/fonts.scss', '@include font("' + fontname + '", "' + fontname + '", "400", "normal");\r\n', cb);
					}
					c_fontname = fontname;
				}
			}
		})
	}
	return src(path.src.html).pipe(browsersync.stream());
}
function infofile() {

}
function cb() { }


function htmlWebp() {
	return src(path.src.html)
		.pipe(fileInclude())
		.pipe(webphtml())
		.pipe(dest(path.build.html))
}

function cssWebp() {
	return src(path.src.css, {})
		.pipe(scss({ outputStyle: 'expanded' }).on('error', notify.onError()))
		.pipe(
			autoprefixer({
				grid: true,
				overrideBrowserslist: ["last 5 versions"],
				cascade: true
			})
		)
		.pipe(webpcss(
			{
				webpClass: ".webp",
				noWebpClass: ".no-webp"
			}
		))
		.pipe(groupMedia())
		.pipe(dest(path.build.css))
		.pipe(rename({
			suffix: '.min'
		}))
		.pipe(cleanCss({
			level: 2,
		}))
		.pipe(dest(path.build.css));
}

function imagesWebp() {
	return src(path.src.images)
		.pipe(
			imagemin([
				webp({
					quality: 85
				})
			])
		)
		.pipe(
			rename({
				extname: ".webp"
			})
		)
		.pipe(dest(path.build.images))
		.pipe(src(path.src.images))
		.pipe(
			imagemin({
				progressive: true,
				svgoPlugins: [{ removeViewBox: false }],
				interlaced: true,
				optimizationLevel: 3 // 0 to 7
			})
		)
		.pipe(dest(path.build.images));
}

function json() {
	return src(path.src.json)
		.pipe(dest(path.build.json))
		.pipe(browsersync.stream());
}
function assets() {
	return src(path.src.assets)
		.pipe(dest(path.build.assets))
		.pipe(browsersync.stream());
}

function clean() {
	return del(path.clean);
}

function cleanDir() {
	if (!fs.existsSync(path.clean)) {
		fs.mkdirSync(path.clean);
	}
	return src(path.clean).pipe(cleanPath());
}

function watchFiles() {
	browsersync.init({
		server: {
			baseDir: "./" + project_name + "/"
		},
		notify: false,
		port: 3000,
	});

	watch([path.watch.html], html);
	watch([path.watch.css], css);
	watch([path.watch.js], js);
	watch([path.watch.images], images);
	watch([path.watch.icons], icons);
	watch([path.watch.fonts], fonts);
	watch([path.watch.fonts], fontstyle);
	watch([path.watch.assets], assets);
	watch([path.watch.json], json);
}

exports.html = html;
exports.css = css;
exports.js = js;
exports.images = images;
exports.icons = icons;
exports.fonts = fonts;
exports.fontstyle = fontstyle;
exports.htmlWebp = htmlWebp;
exports.cssWebp = cssWebp;
exports.imagesWebp = imagesWebp;
exports.assets = assets;
exports.json = json;
exports.clean = clean;
exports.cleanDir = cleanDir;
exports.watchFiles = watchFiles;
exports.buildWebp = series(cleanDir, parallel(htmlWebp, js, fonts, imagesWebp, icons, json, assets), cssWebp);
exports.build = series(cleanDir, parallel(html, js, fonts, images, icons, json, assets), css);
exports.default = series(clean, parallel(html, fonts, js, images, icons, assets, json), fontstyle, css, watchFiles);
