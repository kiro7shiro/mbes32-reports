const path = require('path')
const fs = require('fs')
const Fuse = require('fuse.js')
const { parse, serialize } = require('xlsx-fuzzyparser')
const { listFiles } = require('./listFiles.js')
const { Matchcode } = require('./Matchcode.js')
const { EventFile } = require('./EventFile.js')

class ReportError {
    constructor(message) {
        this.message = message
    }
}
class SearchDirectoryEmpty extends ReportError {
    constructor(searchPath) {
        super(`The search directory: ${searchPath} is empty.`)
    }
}
class NoDirectoryFound extends ReportError {
    constructor(query) {
        super(`No directory found that matches the query: "${query}"`)
        this.query = query
    }
}
class DirectoryEmpty extends ReportError {
    constructor(directory) {
        super(`Directory: ${directory} is empty.`)
        this.directory = directory
    }
}

class NoFilesFound extends ReportError {
    constructor(directory, filesQuery) {
        super(`No files found for: ${directory}, that match the filesQuery: "${filesQuery}"`)
        this.directory = directory
        this.filesQuery = filesQuery
    }
}

class Errors {
    static SearchDirectoryEmpty = SearchDirectoryEmpty
    static NoDirectoryFound = NoDirectoryFound
    static DirectoryEmpty = DirectoryEmpty
    static NoFilesFound = NoFilesFound
}

class Defaults {
    static directoriesEngine = {
        includeScore: true,
        useExtendedSearch: true,
        threshold: 0.6
    }
    static filesEngine = {
        includeScore: true,
        useExtendedSearch: true,
        keys: ['queryString'],
        threshold: 0.6
    }
}

/**
 * Search for files inside a directory that match the query in the search path.
 * Returns files inside the directory filtered based on the files query.
 * @param {String} searchPath - the path in which to search for the directory
 * @param {String} query - the query to search for a directory
 * @param {Object} [options] - options
 * @param {String} [options.filesQuery] - the query to search for files inside the directory
 * @param {String[]} [options.blacklist] - list of directories to exclude from the search
 * @returns {Object} - an object with properties `directory` and `files`
 */
function findFiles(
    searchPath,
    query,
    {
        directoriesEngine = {
            includeScore: true,
            useExtendedSearch: true,
            threshold: 0.6
        },
        filesEngine = {
            includeScore: true,
            useExtendedSearch: true,
            keys: ['queryString'],
            threshold: 0.6
        },
        filesQuery = '',
        blacklist = []
    } = {}
) {
    // search for an directory that matches the query
    const directories = fs.readdirSync(searchPath)
    if (directories.length === 0) throw new Errors.SearchDirectoryEmpty(searchPath)
    const searchDirectories = new Fuse(directories, directoriesEngine)
    const findDirectories = searchDirectories.search(query)
    if (findDirectories.length === 0) throw new Errors.NoDirectoryFound(query)
    // take the first found item as the requested directory
    const foundDirectory = findDirectories[0].item
    console.log(`searching in directory: ${foundDirectory} ...`)
    const files = listFiles(path.resolve(searchPath, foundDirectory), { blacklist })
    if (files.length === 0) throw new Errors.DirectoryEmpty(foundDirectory)
    // search for files
    if (filesQuery === '') {
        console.log(`found ${files.length} files ...`)
        return { directory: foundDirectory, files }
    }
    console.log(`searching for files: ${filesQuery} ...`)
    const queryStrings = files.reduce(function (accu, curr) {
        accu.push({
            queryString: curr.filepath.replace(searchPath, '') + curr.filename,
            ...curr
        })
        return accu
    }, [])
    const searchFiles = new Fuse(queryStrings, filesEngine)
    let findFiles = searchFiles.search(filesQuery)
    console.table(findFiles.map(f => { return { score: f.score, ...f.item } }), ['filename', 'score', 'queryString'])
    findFiles = findFiles.map(function (file) {
        return {
            filename: file.item.filename,
            filepath: file.item.filepath,
            lastModified: file.item.lastModified,
            refIndex: file.refIndex,
            score: file.score
        }
    })

    if (findFiles.length === 0) throw new Errors.NoFilesFound(foundDirectory, filesQuery)
    console.log(`found ${findFiles.length} files ...`)
    return { directory: foundDirectory, files: findFiles }
}

/**
 * Search for multiple files based on a list of queries.
 * @param {String} searchPath - the path in which to search for the files
 * @param {String} queriesFile - the path to a file containing the queries // TODO : rename to queries and accept an array of query strings
 * @param {Object} [options] - options
 * @param {String} [options.filesQuery] - the query to search for files inside the directory // TODO : accept an array of file queries must be same length as queries
 * @param {String[]} [options.blacklist] - list of directories to exclude from the search
 * @param {Number} [options.notFoundThreshold] - threshold for searching, if an item scores above the threshold it is considered not found
 * @returns {Object} - an object with properties `results` and `errors`, where `results` contains the found files and `errors` contains errors
 */
async function findManyFiles(searchPath, queriesFile, { filesQuery = '', blacklist = [], notFoundThreshold = 0.01 } = {}) {
    // [ ] : make function accept queries argument as an array of query objects or a filepath which will be parsed
    const queries = await makeQueries(path.join(process.cwd(), queriesFile), { filesQuery })
    console.log(`made ${queries.length} queries...`)
    const results = []
    const errors = []
    for (let qCnt = 0; qCnt < queries.length; qCnt++) {
        const query = queries[qCnt]
        const { matchcode, filesQuery } = query
        try {
            const { directory, files } = findFiles(searchPath, matchcode.base, { filesQuery, blacklist, notFoundThreshold })
            results.push({ directory, files, query })
        } catch (error) {
            if (error instanceof Errors.SearchDirectoryEmpty) throw error
            if (error instanceof Errors.DirectoryEmpty || error instanceof Errors.NoDirectoryFound || error instanceof Errors.NoFilesFound) {
                console.log(error.message)
                errors.push({ error, query })
            } else {
                throw error
            }
        }
    }
    return { results, errors }
}

async function makeQueries(
    filepath,
    {
        filesQuery = '',
        queriesFileConfig = {
            worksheet: 'queries',
            type: 'list',
            row: 1,
            columns: [
                { index: 1, key: 'matchcode' },
                { index: 2, key: 'filesQuery' }
            ]
        }
    } = {}
) {
    const rows = await parse(filepath, queriesFileConfig)
    const queries = rows.map(function (row) {
        return {
            matchcode: new Matchcode(row.matchcode),
            filesQuery: row.filesQuery || filesQuery
        }
    })
    return queries
}

async function writeReport(
    filepath,
    results,
    errors,
    reportConfig = {
        files: {
            type: 'list',
            worksheet: 'files',
            row: 1,
            columns: [
                { index: 1, key: 'filepath' },
                { index: 2, key: 'filename' },
                { index: 3, key: 'lastModified' },
                { index: 4, key: 'type' },
                { index: 5, key: 'contractor' }
            ]
        },
        errors: {
            type: 'list',
            worksheet: 'errors',
            row: 1,
            columns: [
                { index: 1, key: 'filepath' },
                { index: 2, key: 'filename' },
                { index: 3, key: 'lastModified' }
            ]
        }
    }
) {
    // parse files into EventFiles
    for (let rCnt = 0; rCnt < results.length; rCnt++) {
        const { directory, files } = results[rCnt]
        const eventFiles = files.map((file) => new EventFile(file))
        const fileConfig = Object.assign({}, reportConfig.files, { worksheet: directory })
        await serialize(eventFiles, filepath, fileConfig)
    }
    if (errors.length > 0) {
        const eventErrors = errors.map(function ({ error, query }) {
            return {
                matchcode: query.matchcode.raw,
                error: error.constructor.name,
                message: error.message,
                filesQuery: query.filesQuery
            }
        })
        await serialize(eventErrors, filepath, reportConfig.errors)
    }
}

module.exports = {
    Errors,
    Defaults,
    findFiles,
    findManyFiles,
    makeQueries,
    writeReport
}
