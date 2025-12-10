const express = require('express')
const router = express.Router()
const { parse, serialize } = require('xlsx-fuzzyparser')

// GET all events data
router.get('/', async function (req, res) {
	const { eventsFile, eventsConfig, eventsBlacklist } = req.app.locals.settings
	const eventsData = await parse(eventsFile, eventsConfig)
	const filtered = eventsData.filter((eventData) => !eventsBlacklist.some((predicate) => predicate(eventData)))
	res.json(filtered)
})

// GET event data by matchcode
router.get('/:matchcode', (req, res) => {})

module.exports = router
