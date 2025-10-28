const express = require('express')
const router = express.Router()

router.post('/:control', (req, res) => {
    const { control } = req.params
    res.render(control, req.body)
})

module.exports = router
