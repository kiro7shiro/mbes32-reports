const path = require('path')
const fs = require('fs')
const Fuse = require('fuse.js')
const { listFiles, makeQueries } = require('./files.js')

const ERRORS = {
	PathEmpty: class PathEmpty extends Error {
		constructor() {
			super('The search path is empty.')
		}
	},
	FolderEmpty: class FolderEmpty extends Error {
		constructor(folder) {
			super(`Folder: ${folder} is empty.`)
			this.folder = folder
		}
	},
	NoFolderFound: class NoFolderFound extends Error {
		constructor(query) {
			super(`No folder found that matches the query: "${query}"`)
			this.query = query
		}
	},
	NoFilesFound: class NoFilesFound extends Error {
		constructor(query, filesQuery) {
			super(`No files found for ${query}, that macht the query: "${filesQuery}"`)
			this.query = query
			this.filesQuery = filesQuery
		}
	}
}

/**
 * Search for a folder that matches the query in the specified path.
 * Returns files inside the folder filtered based on the files query.
 */
function findFiles(basePath, query, { filesQuery = '', blacklist = [], notFoundThreshold = 0.001 } = {}) {
	// search for an folder that matches the query
	const folders = fs.readdirSync(basePath)
	if (folders.length === 0) throw new ERRORS.PathEmpty()
	const searchFolders = new Fuse(folders, { includeScore: true })
	const findFolders = searchFolders.search(query).filter(function (folder) {
		return folder.score < notFoundThreshold
	})
	if (findFolders.length === 0) throw new ERRORS.NoFolderFound(query)
	// take the first found item as the requested folder
	const foundFolder = findFolders[0].item
	console.log(`searching in folder: ${foundFolder}...`)
	const files = listFiles(`${basePath}\\${foundFolder}`, { blacklist })
	if (files.length === 0) throw new ERRORS.FolderEmpty(foundFolder)
	// search for files
	if (filesQuery === '') {
		console.log(`found ${files.length} files...`)
		return files
	}
	const searchFiles = new Fuse(files, { includeScore: true, useExtendedSearch: true, keys: ['filepath'] })
	const findFiles = searchFiles
		.search(filesQuery)
		.filter(function (file) {
			return file.score < notFoundThreshold
		})
		.map(function (file) {
			return { name: file.item.filename, path: file.item.filepath, lastModified: file.item.lastModified, refIndex: file.refIndex, score: file.score }
		})

	if (findFiles.length === 0) throw new ERRORS.NoFilesFound(query, filesQuery)
	console.log(`found ${findFiles.length} files...`)
	return { folder: foundFolder, files: findFiles }
}

async function findManyFiles(
	basePath,
	queriesFile,
	{ matchcodeIndex = 1, subfolders = ['009_Reinigung'], files = ['.xlsx'], blacklist = [], notFoundThreshold = 0.01 } = {}
) {
	const queries = await makeQueries(path.resolve(process.cwd(), queriesFile), { matchcodeIndex, subfolders, files })
	console.log(`made ${queries.length} queries...`)
	const result = []
	const errors = []
	for (let qCnt = 0; qCnt < queries.length; qCnt++) {
		const query = queries[qCnt]
		const { matchcode, filesQuery } = query
		try {
			const { folder, files: foundFiles } = findFiles(basePath, matchcode.base, { filesQuery, blacklist, notFoundThreshold })
			result.push({ folder, files: foundFiles, query })
		} catch (error) {
			if (
				error instanceof ERRORS.FolderEmpty ||
				error instanceof ERRORS.NoFilesFound ||
				error instanceof ERRORS.NoFolderFound ||
				error instanceof ERRORS.PathEmpty
			) {
				console.log(error.message)
				errors.push({ error, query })
			} else {
				throw error
			}
		}
	}
	return { files: result, errors }
}

function writeReport(folder, files) {
	
}

module.exports = {
	ERRORS,
	findFiles,
	findManyFiles
}
