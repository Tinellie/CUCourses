const express = require("express");
const colors = require('colors-console');
const cap = require("../captcha");

const {Jimp} = require("jimp");
const fs = require("fs");
const error = require("../error");

const router = express.Router();


const path = "image/captcha.png";
const path2 = "image/captcha.png";



router.get('/', async (req, res) => {

    // browser not ready
    if (!req.app.locals.ready) {
        console.warn("Browser not initialized");
        res.writeHead(500, {
            'Content-Type': 'image/png',
        });
        res.end(null);
        return;
    }

    console.log(colors("green", "\n\n======== FETCH  CAPTCHA ========"));

    let buffer = req.app.locals.captcha_img ?? await fetchCaptcha(req.app.locals.pup_obj, path);

    // console.log(colors("yellow", "Buffer: ") + buffer);
    // let buffer = fs.readFileSync("image/captcha.png");

    if (!buffer) {
        error( "failed to fetch captcha");
        return;
    }
    else console.log("successfully fetched captcha !");

    // respond with the image
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': buffer.length
    });
    res.end(buffer);

    console.log(colors("green", "================================\n\n"));

    if (!req.app.locals.captcha_img) {
        req.app.locals.captcha_img = buffer;
        req.app.locals.captcha_img_ready = true;
    }
});



router.get('/clear', async (req, res) => {
    if (!req.app.locals.captcha_img_ready) {
        res.status(403).end("Can't clear captcha as it do not exist! Try to fetch a captcha first");
        return;
    }
    clearCaptcha( req.app.locals);
    res.status(200).end();
});



router.get('/refresh', async (req, res) => {
    await refreshCaptcha(req.app.locals.pup_obj, req.app.locals);
    res.status(200).end();
});



router.get('/recognize', async (req, res) => {
    let r = await recognizeCaptcha(path, path2);
    console.log(colors("cyan", r));
    res.status(200).end(r);
});

module.exports = router;



async function fetchCaptcha({browser, page}, output_path = "image/captcha.png") {
    if (browser === undefined) {
        error("Browser does not exist");
        return;
    }

    console.log("Fetching captcha...");
    try {

        const display = await page.$("#imgCaptcha");
        // console.log("Generating screenshot...");
        // await page.screenshot({path: "image/screenshot2.png"});

        return await display.screenshot({path: output_path})

    } catch (error) {
        console.error(error)
    }
}
async function refreshCaptcha({page}, locals) {
    await page.click("#btn_refresh");
    clearCaptcha(locals)
}


async function processingCaptcha(path, path2) {

    // processing the img

    let img = await Jimp.read(path);
    img = await cap.Binarization(img, 108);
    // let f = 2;
    // img.resize({w: img.width*f, h: img.height*f});
    // img.blur(1);

    await img.write(path2 ?? path);
    return img;
}


function clearCaptcha(locals) {
    locals.captcha_img = undefined;
}


async function recognizeCaptcha(path, path2) {
    let img = await processingCaptcha(path, path2);
    return await
        cap.CropRecognize(img, 4,
            (img, worker) => cap.RecognizeRotated(img, 10, 100, worker, true)
        );
}


async function crop(url, out) {

    console.log(`Crop ${url} to ${out}`);

    const img = await Jimp.read(url);
    img.crop({x: 123, y: 90, w: 188, h: 56})
    await img.write(out);

}