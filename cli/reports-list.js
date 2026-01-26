const fs = require('fs')
const path = require('path')
const { Command, Argument, Option } = require('commander')
const { listFiles } = require('../src/listFiles.js')
const { EventFile } = require('../src/EventFile.js')
const { analyze, parse, serialize } = require('xlsx-fuzzyparser')

function parseConfigFile(value) {
    const filePath = path.resolve(process.cwd(), value)
    return require(filePath)
}

const program = new Command()
program.description('List mbes files of a given year.')

program.addArgument(new Argument('<year>', 'The year to search files for.'))
program.addArgument(new Argument('[listFile]', 'The file to save the list to.').default(path.resolve(__dirname, '../data/list.xlsx')))
program.addArgument(
    new Argument('[listConfig]', 'The config of the list file.')
        .argParser(parseConfigFile)
        .default(parseConfigFile(path.resolve(__dirname, '../data/list-config.js')))
)
program.addOption(
    new Option('-sp, --search-path <searchPath>', 'The path to search the files in.')
        .argParser(function (value) {
            return path.resolve(process.cwd(), value)
        })
        .default(path.resolve("C:\\Users\\tiedemann\\Messe Berlin GmbH\\Event Services - Veranstaltungsproduktion"))
)
program.addOption(
    new Option('-sb, --sub-path <subPath>', 'Sub pathes of mbes standard directory structure to find the files in.')
        .argParser(function (value) {
            return value.split(' ')
        })
        .default(['009_Reinigung und Entsorgung', 'Kalkulation'])
)
program.addOption(
    new Option('-db, --dirs-blacklist <dirsBlacklist>', 'List of directories to exclude from the search of event directories.')
        .argParser(function (value) {
            return value.split(' ')
        })
        .default(['00_Ordnerstruktur ES_VA-Produktion', '001_MBPro', '01_ES_Kosteninformation_intern', '002_Anfragen', '003_Vorlagen', '004_Informationen der Fachabteilungen'])
)
program.addOption(
    new Option('-b, --blacklist <blacklist>', 'List of sub directories to exclude from the search of files.')
        .argParser(function (value) {
            return value.split(' ')
        })
        .default(['Archiv', 'ARCHIV'])
)

program.parse()
let [year, listFile, listConfig] = program.processedArgs
const options = program.opts()

console.log('[list]')
//console.log({ year, listFile, listConfig, options })
//process.exit(0)

async function main() {
    // read search path
    const directories = fs.readdirSync(options.searchPath)
    console.log(`directories: ${directories.length}...`)
    // TODO : cut year if length > 2 for searching
    if (year.length > 2) year = year.slice(2)
    // search files
    const foundFiles = []
    for (let fCnt = 0; fCnt < directories.length; fCnt++) {
        const dirName = directories[fCnt];
        if (options.dirsBlacklist.includes(dirName)) continue
        // check if directory name contains the year 
        // and has sub path with files in it
        const dirPath = path.resolve(options.searchPath, dirName)
        const stats = fs.statSync(dirPath)
        if (!stats.isDirectory()) continue
        const subdirs = fs.readdirSync(dirPath).filter(function (subdir) {
            const subStat = fs.statSync(path.resolve(dirPath, subdir))
            return subStat.isDirectory() && subdir.includes(year)
        })
        if (subdirs.length < 1) continue
        const subdir = path.resolve(dirPath, subdirs[0], ...options.subPath)
        // TODO : make a more robust check if subdirs length > 1 test the next available dir for more files 
        if (fs.existsSync(subdir)) {
            const files = listFiles(subdir, { blacklist: options.blacklist })
            if (files.length < 1) continue
            // TODO : add a files blacklist to skip unwanted files
            const eventFiles = files.reduce(function (accu, file) {
                if (!file.filename.endsWith('.xlsx')) return accu
                const eventFile = new EventFile(file)
                //if (eventFile.contractor === null || eventFile.contractor === 'ALBA' || eventFile.contractor === 'CWS') return accu
                if (eventFile.type === 'bill' || eventFile.type === 'planning') accu.push(eventFile)
                return accu
            }, [])
            foundFiles.push({ directory: `/${dirName}/${subdirs[0]}`, files: eventFiles })
        }
    }
    console.log(`found: ${foundFiles.length} directories...`)
    // console.table(foundFiles)
    // return
    // write the list file
    // TODO : make a new filename that contains the year in the end
    const fileName = listFile.replace(path.extname(listFile), `-${year.padStart(4, '20')}${path.extname(listFile)}`)
    const dirNames = foundFiles.reduce(function (accu, curr) {
        accu.push({ directory: curr.directory })
        return accu
    }, [])
    await serialize(dirNames, fileName, { config: listConfig.directories })
    for (let fCnt = 0; fCnt < foundFiles.length; fCnt++) {
        const found = foundFiles[fCnt]
        const config = Object.assign({}, listConfig.files, { sheetName: path.basename(found.directory) })
        await serialize(found.files, fileName, { config })
    }
    console.log(`saved as: ${path.basename(fileName)}`)
}

main()
