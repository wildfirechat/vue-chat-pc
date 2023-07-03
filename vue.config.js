// vue.config.js

const pkg = require('./package.json');
const CopywebpackPlugin = require('copy-webpack-plugin')
module.exports = {
    publicPath: '.',
    chainWebpack: config => {
        config.module.rules.delete('eslint');
    },
    configureWebpack: {
        // Webpack configuration applied to web builds and the electron renderer process
        target: "electron-renderer",
        resolve: {
            mainFields: ['main', 'browser']
        }
    },

    pluginOptions: {
        chainWebpack: config => {
            // config.module.rules.delete('eslint');
        },
        electronBuilder: {
            preload: 'src/ui/workspace/bridgeClientImpl.js',
            externals: ['electron-screenshots'],
            chainWebpackMainProcess: (config) => {
                // Chain webpack config for electron main process only
                config.module
                    .rule('native')
                    .test(/\.node$/)
                    .use('native-ext-loader')
                    .loader('native-ext-loader')
                    .end();
                // config.externals({
                //     'electron-screenshots': 'require("electron-screenshots")'
                // });
                config.plugin('copy').use(CopywebpackPlugin, [
                    [
                        {
                            from: `${__dirname}/public/**/*`,
                            to: `${__dirname}/dist_electron`,
                        },
                    ]
                ]);
            },
            chainWebpackRendererProcess: (config) => {
                // Chain webpack config for electron renderer process only (won't be applied to web builds)
                config.module
                    .rule("vue")
                    .use("vue-loader")
                    .loader("vue-loader")
                    .tap(options => {
                        options.compilerOptions.directives = {
                            html(node, directiveMeta) {
                                (node.props || (node.props = [])).push({
                                    name: "innerHTML",
                                    value: `xss(_s(${directiveMeta.value}), xssOptions())`
                                });
                            }
                        };
                        return options;
                    });
            },
            // nodeIntegration: true,
            contextIsolation: false,
            webSecurity: false,
            // Use this to change the entrypoint of your app's main process
            // mainProcessFile: 'src/myBackgroundFile.js',
            // Use this to change the entry point of your app's render process. default src/[main|index].[js|ts]
            // rendererProcessFile: 'src/myMainRenderFile.js',
            // Provide an array of files that, when changed, will recompile the main process and restart Electron
            // Your main process file will be added by default
            // mainProcessWatch: ['src/myFile1', 'src/myFile2'],
            // Provide a list of arguments that Electron will be launched with during "electron:serve",
            // which can be accessed from the main process (src/background.js).
            // Note that it is ignored when --debug flag is used with "electron:serve", as you must launch Electron yourself
            // Command line args (excluding --debug, --dashboard, and --headless) are passed to Electron as well
            // mainProcessArgs: ['--arg-name', 'arg-value']
            mainProcessArgs: ['--disable-background-timer-throttling', ''],
            // outputDir: 'release',
            builderOptions: {
              // 修改appId是，需要同时修改backgroud.js里面设置的appUserModelId，设置见：app.setAppUserModelId(xxx)
              appId: pkg.appId,
              compression: 'normal',
              artifactName: '${productName}-${version}-${os}-${arch}.${ext}',
              protocols: {
                  name: "wf-deep-linking",
                  schemes: ["wfc"]
              },
              // loongarch64架构时需要打开下面的配置
              // electronDownload: {
              //     mirror: "http://ftp.loongnix.cn/electron/LoongArch/",
              //     customDir: "v13.6.9",
              //     arch: "loong64",
              //     platform: "linux"
              // },
              mac: {
                extendInfo: {
                  NSCameraUsageDescription: "This app requires camera access to record video.",
                  NSMicrophoneUsageDescription: "This app requires microphone access to record audio."
                },
                hardenedRuntime: true,
                gatekeeperAssess: false,
                entitlements: "build/mac/entitlements.mac.plist",
                entitlementsInherit: "build/mac/entitlements.mac.plist",
                target: [
                    {
                        target:'default',
                        arch:[
                          'universal'
                        ]

                    }
                ]
              },
              linux: {
                category: "Chat",
                target: [
                  'deb',
                  'AppImage'
                ]
              },
              deb:{
                afterInstall: 'entries/install.sh'
              },
              extraResources:[
                  {
                      from: './build/icons',
                      to: 'extraResources/icons'
                  }
              ],
              extraFiles:[
                {
                  from: 'entries',
                  to: 'entries'
                }
              ],
              win: {
                target: "nsis",
                requestedExecutionLevel: "asInvoker"
              },
              nsis: {
                oneClick: false,
                allowToChangeInstallationDirectory: true,
                artifactName: '${productName}-${version}-${os}-${arch}-setup.${ext}',
                deleteAppDataOnUninstall: true,
                perMachine: false,
                createDesktopShortcut: true,
                shortcutName: '${productName}',
              }
            }
        }
    },
}
