const fs = require('fs')
const Fuse = require('fuse.js')
const { listFiles } = require('./listFiles.js')

const ERRORS = {
	PathEmpty: class PathEmpty extends Error {
		constructor() {
			super('The path is empty')
		}
	},
	NoFolderFound: class NoFolderFound extends Error {
		constructor(query) {
			super(`No folder found that matches the query: "${query}"`)
		}
	},
	FolderEmpty: class FolderEmpty extends Error {
		constructor() {
			super('Folder is empty')
		}
	},
	NoFilesFound: class NoFilesFound extends Error {
		constructor(query) {
			super(`No files found that machtes the query: "${query}"`)
		}
	}
}

/**
 * Search for a folder that matches the query in the specified path.
 * Returns files inside the folder filtered based on the files query.
 */
function findFiles(path, query, { filesQuery = '', blacklist = [], notFoundThreshold = 0.001 } = {}) {
	// search for an folder that matches the query
	const folders = fs.readdirSync(path)
	if (folders.length === 0) throw new ERRORS.PathEmpty()
	const searchFolders = new Fuse(folders, { includeScore: true })
	const findFolders = searchFolders.search(query).filter(function (file) {
		return file.score < notFoundThreshold
	})
	if (findFolders.length === 0) throw new ERRORS.NoFolderFound(query)
	// take the first found item as the folder
	const foundFolder = findFolders[0].item
	console.log({ foundFolder })
	const files = listFiles(`${path}\\${foundFolder}`, { blacklist })
	if (files.length === 0) throw new ERRORS.FolderEmpty()
	// search for files
	if (filesQuery === '') {
		return files.map(function (file) {
			return { name: file.filename, path: file.filepath, lastModified: file.lastModified }
		})
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

	if (findFiles.length === 0) throw new ERRORS.NoFilesFound(filesQuery)
	return findFiles
}

function findManyFiles(path, queries, { filesQuery = '', blacklist = [], notFoundThreshold = 0.01 }) {
	const result = new Array(queries.length)
	for (let qIndex = 0; qIndex < queries.length; qIndex++) {
		const query = queries[qIndex]
		try {
			const files = findFiles(path, query, { filesQuery, blacklist, notFoundThreshold })
			result[qIndex] = { query, files }
		} catch (error) {
			result[qIndex] = { query, error }
		}
	}
	return result
}

module.exports = {
	ERRORS,
	findFiles,
	findManyFiles
}
