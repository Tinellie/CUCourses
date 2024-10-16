const express = require("express");
const colors = require('colors-console');
// const cap = require("../modules/captcha_helper");
const captcha = require("../modules/captcha");

const {Jimp} = require("jimp");
const fs = require("fs");
const error = require("../error");

const router = express.Router();


const path = "image/captcha.png";
const path2 = "image/captcha2.png";



router.get('/', async (req, res) => {

    // browser not ready
    if (!req.app.locals.ready) {
        error("Browser not initialized");
        res.status(500).end("Browser not initialized"); return;
    }

    console.log(colors("green", "\n\n======== FETCH  CAPTCHA ========"));

    let buffer = req.app.locals.captcha_img ?? await captcha.fetch(req.app.locals.pup_obj, path);

    // console.log(colors("yellow", "Buffer: ") + buffer);
    // let buffer = fs.readFileSync("image/captcha.png");

    if (!buffer) { error( "failed to fetch captcha"); return; }
    else console.log("successfully fetched captcha !");

    // respond with the image
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length
    }).end(buffer);

    console.log(colors("green", "================================\n\n"));

    if (!req.app.locals.captcha_img) {
        req.app.locals.captcha_img = buffer;
        req.app.locals.captcha_img_ready = true;
    }
});



// Clear Current Captcha Image
router.get('/clear', async (req, res) => {
    if (!req.app.locals.captcha_img_ready) {
        res.status(403).end("Can't clear captcha as it do not exist! Try to fetch a captcha first");
        return;
    }
    captcha.clear( req.app.locals);
    res.status(200).end();
});



// Refresh Captcha Image (click refresh_btn & clear current img)
router.get('/refresh', async (req, res) => {
    await captcha.refresh(req.app.locals.pup_obj, req.app.locals);
    res.status(200).end();
});



// Recognize Current Captcha Image using OCR
router.get('/recognize', async (req, res) => {
    let r = await captcha.recognize(path, path2);
    console.log(colors("cyan", r));
    res.status(200).end(r);
});

module.exports = router;



