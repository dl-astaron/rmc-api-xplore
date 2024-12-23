import { readJsonFile, currentDir } from "./lib/fs-utils.js"

class __ServerConfig {
    apiKey = null
    apiSecret = null
    serverPort = null
    configFileName = 'serverConfig.json'

    constructor () {
        ;
    }

    initialize() {
        console.log('Reading config file:', this.configFileName)

        let config = readJsonFile([currentDir(), '../../', this.configFileName])

        //console.log('Config read:', config)

        for (let k of ['serverPort', 'apiSecret', 'apiKey']) {
            this[k] = config.fileData[k]
        }
    }

}

const ServerConfig = new __ServerConfig()

export { ServerConfig }