const express = require("express");

const router = express.Router();


router.get('/restart', async (req, res) => {
    await req.app.locals.pup_obj.restart();

    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    res.end(null);

})

module.exports = router;
