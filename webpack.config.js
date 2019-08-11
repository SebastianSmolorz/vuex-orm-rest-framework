const path = require('path');
module.exports = {
    entry: path.join(__dirname, "src/index.js"),
    devtool: 'source-map',
    module: {
        rules: [
            {
                test: /\.(js)$/,
                use: "babel-loader",
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: [".js"]
    },
    output: {
        path: path.join(__dirname, 'dist'),
        filename: "[name].js",
        sourceMapFilename: "[name].js.map"
    }
};
