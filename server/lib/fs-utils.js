
import fs from 'fs'
import path from 'path';

import { fileURLToPath } from 'url';

function currentDir() {
    return path.dirname(fileURLToPath(import.meta.url))
}

/**
 * Reads a JSON file from the file system and returns the parsed object
 * @param {*} path (array or string) - path to the file: 
 *                      eg: ['/tmp/path', 'to', 'file.json'] or '/tmp/path/to/file.json'
 * @returns 
 */
function readJsonFile (filePath) {
    let returnObj = {
        status: 'OK',
        filePath: null,
        fileData: null,
    }

    if (Array.isArray(filePath)) {
        returnObj.filePath = path.join.apply(null,filePath)
    }
    else {
        returnObj.filePath = filePath
    }

    //console.log('Reading file:', returnObj.filePath)

    if (! fs.existsSync( returnObj.filePath )) {
        returnObj.status = 'ENOENT'

        return returnObj;
    }

    let fileContentRaw = fs.readFileSync(returnObj.filePath, {encoding: 'utf8'} )

    returnObj.fileData = JSON.parse(fileContentRaw)

    return returnObj

}

export { readJsonFile, currentDir }