import * as HtmlWebpackPlugin from "html-webpack-plugin";
import * as MiniCssExtractPlugin from "mini-css-extract-plugin";
import * as path from "path";
import * as TerserWebpackPlugin from "terser-webpack-plugin";
import * as webpack from "webpack";
import {BUILD_DIR, CLIENT_DIR, clientVars, config} from "./server/config";

const os = require('os');

const SpeedMeasurePlugin = require("speed-measure-webpack-plugin");
const smp = new SpeedMeasurePlugin();
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;
const WebpackBar = require('webpackbar');
export default () => {
  const { IS_PRODUCTION } = config; 
  const srcDir = path.resolve(process.cwd(), CLIENT_DIR);
  const buildDir = path.resolve(process.cwd(), BUILD_DIR, CLIENT_DIR);
  const tsConfigClientFile = path.resolve(srcDir, "tsconfig.json");
  const sassCommonVarsFile = "./components/vars.scss"; // needs to be relative for Windows
  return {
    entry: {
      app: path.resolve(srcDir, "components/app.tsx"),
    },
    output: {
      //path: buildDir,
      path: path.resolve(__dirname, './dist'),
      publicPath: '/',
      filename: '[name].js',
      chunkFilename: 'chunks/[name].js',
    },
    resolve: {
      extensions: ['.ts', '.tsx', '.js', '.json']
    },
    devServer: {
      //项目根目录
      host: '0.0.0.0',
      port: '8087',
      contentBase: path.join(__dirname, "./dist"),
      historyApiFallback: true,
      overlay: true,
      publicPath: '',
      proxy: {
        '/base': {
          target: 'http://127.0.0.1:8080/',
          secure: false,
          changeOrigin: true,
          // pathRewrite: { '^/base': '' }
        },
        '/servicemesh': {
          target: 'http://127.0.0.1:8080/',
          secure: false,
          changeOrigin: true,
          // pathRewrite: { '^/base': '' }
        },
        '/tekton': {
          target: 'http://127.0.0.1:8080/',
          secure: false,
          changeOrigin: true,
        },
        '/api-kube': {
          target: 'http://127.0.0.1:8080/',
          secure: false,  // 如果是https接口，需要配置这个参数
          changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
          pathRewrite: { '^/api-kube': '/workload' },
        },
        '/api-resource': {
          target: 'http://127.0.0.1:8080/',
          secure: false,  // 如果是https接口，需要配置这个参数
          changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
          pathRewrite: { '^/api-resource': '/workload' }
        },

        '/user-login': {
          target: 'http://127.0.0.1:8080/',
          secure: false,  // 如果是https接口，需要配置这个参数
          changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
        },

        '/api/config': {
          target: 'http://127.0.0.1:8080/',
          secure: false,  // 如果是https接口，需要配置这个参数
          changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
          pathRewrite: { '^/api/config': '/workload/config' }
        },

        '/api': {
          target: 'http://127.0.0.1:8080/',
          secure: false,  // 如果是https接口，需要配置这个参数
          changeOrigin: true, // 如果接口跨域，需要进行这个参数配置
          pathRewrite: { '^/api': '/workload' }
        },

        '/workload': {
          target: 'http://127.0.0.1:8080/',
          ws: true,
          secure: false,
          logLevel: 'debug',
        },
      }
    },
    mode: IS_PRODUCTION ? "production" : "development",
    // devtool: IS_PRODUCTION ? "" : "cheap-module-eval-source-map",
    devtool: false,
    optimization: {
      minimize: IS_PRODUCTION,
      minimizer: [
        ...(!IS_PRODUCTION ? [] : [
          new TerserWebpackPlugin({
            cache: true,
            parallel: true,
            terserOptions: {
              mangle: true,
              compress: true,
              keep_classnames: true,
              keep_fnames: true,
            },
            extractComments: {
              condition: "some",
              banner: [
                `Copyright ${new Date().getFullYear()} by`
              ].join("\n")
            }
          })
        ]),
      ],
      splitChunks: {
        cacheGroups: {
          commons: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all'
          }
        }
      }
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          exclude: /node_modules/,
          use: [

            "babel-loader",
            {
              loader: 'ts-loader',
              options: {
                configFile: tsConfigClientFile
              }
            }
          ]
        },
        {
          test: /\.(jpg|png|svg|map|ico)$/,
          use: [
            {
              loader: 'file-loader',
              options:{
                name:'assets/[name]-[hash:6].[ext]',
                esModule:false
              }
            },
          ],
         
        },
        {
          test: /\.(ttf|eot|woff2?)$/,
          use: [
            {
              loader: 'file-loader',
              options:{
                name:'assets/fonts/[name].[ext]',
                esModule:false
              }
            },
          ],
        },
        {
          test: /\.ya?ml$/,
          use: "yml-loader"
        },
        {
          test: /\.s?css$/,
          use: [
            IS_PRODUCTION ? MiniCssExtractPlugin.loader :
              {
                loader: "style-loader",
                options: {}
              },
            {
              loader: "css-loader",
              options: {
                sourceMap: !IS_PRODUCTION
              },
            },
            {
              loader: "sass-loader",
              options: {
                sourceMap: !IS_PRODUCTION,
                prependData: '@import "' + sassCommonVarsFile + '";',
                sassOptions: {
                  includePaths: [srcDir]
                },
              }
            },
          ]
        }
      ]
    },
    plugins: [
      ...(IS_PRODUCTION ?
        [
          new BundleAnalyzerPlugin()
        ] :
        [
          new webpack.HotModuleReplacementPlugin(),
        ]
      ),
      new WebpackBar(),
      new webpack.DefinePlugin({
        process: {
          env: JSON.stringify(clientVars)
        },
      }),

      // don't include all moment.js locales by default
      new webpack.IgnorePlugin(/^\.\/locale$/, /moment$/),

      new HtmlWebpackPlugin({
        template: 'index.html',
        inject: true,
        hash: true,
      }),
      new MiniCssExtractPlugin({
        filename: "[name].css",
      }),
    ],
  }
};

function getNetworkIp() {
  let needHost = ''; // 打开的host
  try {
    // 获得网络接口列表
    let network = os.networkInterfaces();
    for (let dev in network) {
      let iface = network[dev];
      for (let i = 0; i < iface.length; i++) {
        let alias = iface[i];
        if (alias.family === 'IPv4' && !alias.internal && alias.address.includes('10')) {
          needHost = alias.address;
          return needHost
        }
        else {
          needHost = 'localhost'
        }
      }
    }
  } catch (e) {
    needHost = 'localhost';
  }
  return needHost;
}
