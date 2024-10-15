const express = require("express");

const router = express.Router();


router.get('/', async (req, res) => {

    res.json(await req.app.locals.get_subjects());

})

module.exports = router;