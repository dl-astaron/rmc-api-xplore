import { readJsonFile, currentDir } from "./lib/fs-utils.js"

class __ServerConfig {
    apiKey = null
    apiSecret = null
    configFileName = 'serverConfig.json'

    constructor () {

    }

    initialize() {
        let config = readJsonFile([currentDir(), '../../', this.configFileName])

        console.log('Config:', config)

        this.apiKey = config?.fileData?.apiKey
        this.apiSecret = config?.fileData?.apiSecret
    }

}

const ServerConfig = new __ServerConfig()

export { ServerConfig }