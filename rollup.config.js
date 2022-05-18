import babel from "@rollup/plugin-babel";
import {uglify} from "rollup-plugin-uglify";
import del from "rollup-plugin-delete";


export default {
    input: "src/index.js",
    output: [
        {
            file: "umd/index.min.js",
            format: "umd",
            assetFileNames: "[name][extname]",
            name: "xmltool",
            plugins: [uglify()],

        }, {
            dir: "cjs",
            format: "cjs",
            assetFileNames: "[name][extname]",
            preserveModules: true,
            exports: "auto",
        }, {
            dir: "es",
            format: "es",
            assetFileNames: "[name][extname]",
            preserveModules: true,
            exports: "auto",
        },
    ],

    plugins: [
        del({targets: ["./es", "./cjs", "./umd"]}),
        babel({
            babelHelpers: "bundled",
            exclude: /(node_modules|bower_components)/,
        }),
    ],
};

