const express = require('express')
const router = express.Router()

const { parse, serialize } = require('xlsx-fuzzyparser')

// GET /items
router.get('/', async function (req, res) {
    // Logic to fetch all items
    const { eventsFile, eventsConfig, eventsBlacklist, eventDataParsers } = req.app.locals.settings
    const eventsData = await parse(eventsFile, eventsConfig)
    const filtered = eventsData.filter((eventData) => !eventsBlacklist.some((predicate) => predicate(eventData)))
    res.json(filtered)
})

// GET /items/:id
router.get('/:matchcode', (req, res) => {
    const itemId = req.params.matchcode
    // Logic to fetch a single item by ID
    const item = items.find((item) => item.id === itemId)
    if (item) {
        res.json(item)
    } else {
        res.status(404).json({ error: 'Item not found' })
    }
})

// POST /items
router.post('/', (req, res) => {
    const newItem = req.body
    // Logic to create a new item
    items.push(newItem)
    res.status(201).json(newItem)
})

// PUT /items/:id
router.put('/:id', (req, res) => {
    const itemId = req.params.id
    const updatedItem = req.body
    // Logic to update an item by ID
    const index = items.findIndex((item) => item.id === itemId)
    if (index !== -1) {
        items[index] = updatedItem
        res.json(updatedItem)
    } else {
        res.status(404).json({ error: 'Item not found' })
    }
})

// DELETE /items/:id
router.delete('/:id', (req, res) => {
    const itemId = req.params.id
    // Logic to delete an item by ID
    const index = items.findIndex((item) => item.id === itemId)
    if (index !== -1) {
        const deletedItem = items.splice(index, 1)[0]
        res.json(deletedItem)
    } else {
        res.status(404).json({ error: 'Item not found' })
    }
})

module.exports = router
