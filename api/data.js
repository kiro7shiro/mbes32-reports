const express = require('express')
const router = express.Router()
const { parse, serialize } = require('xlsx-fuzzyparser')
const { findFiles } = require('../src/reports.js')
const { Matchcode } = require('../src/Matchcode.js')

// GET all events data
router.get('/', async function (req, res) {
    const { eventsFile, eventsConfig, eventsBlacklist } = req.app.locals.settings
    const eventsData = await parse(eventsFile, eventsConfig)
    const filtered = eventsData.filter((eventData) => !eventsBlacklist.some((predicate) => predicate(eventData)))
    res.json(filtered)
})

// GET event data by matchcode
router.get('/:matchcode', function (req, res) {
    console.log(req.url)
    console.log(req.params)
    res.sendStatus(200)
})

// GET files by matchcode
router.get('/files/:matchcode', function (req, res) {
    const matchcode = new Matchcode(req.params.matchcode)
    const { eventsDataPath } = req.app.locals.settings
    console.log(matchcode)
	const files = findFiles(eventsDataPath, matchcode.base)
	res.json(files)
})

module.exports = router
