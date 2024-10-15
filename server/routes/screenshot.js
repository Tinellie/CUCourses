const express = require("express");
const colors = require('colors-console');
const cap = require("../captcha");

const {Jimp} = require("jimp");
const fs = require("fs");

const router = express.Router();


let pup_obj = null;


router.get('/refetch', async (req, res) => {
    req.app.locals.captcha_img = undefined;
    res.writeHead(200, {
        'Content-Type': 'text/html',
    });
    res.end(null);

})

router.get('/', async (req, res) => {

    if (!req.app.locals.ready) {
        console.warn("Browser not initialized");
        res.writeHead(500, {
            'Content-Type': 'image/png',
        });
        res.end(null);
        return;
    }

    console.log();
    console.log();
    console.log(colors("green", "======== FETCH  CAPTCHA ========"));


    let screenshotBuffer = await req.app.locals.get_captcha();
    // let screenshotBuffer = fs.readFileSync("image/captcha.png");
    // console.log(screenshotBuffer);
    let img = await Jimp.read("image/captcha.png")
    // img.greyscale();
    // img.contrast(-0.5);

    img = await cap.Binarization(img);

    await img.write("image/captcha2.png");
    let img_buffer = fs.readFileSync("image/captcha2.png");

    let captcha =
        cap.CropRecognize(img, 4, (img) => cap.RecognizeRotated(img, 5, 60));


    screenshotBuffer = img_buffer;


    // Respond with the image
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': screenshotBuffer.length
    });
    res.end(screenshotBuffer);


    console.log(colors("green", "================================"));
    console.log();
    console.log();
    // await browser.close();
})

module.exports = router;

async function fetchCaptcha({browser, page}, out) {
    if (browser === undefined) {
        console.error("Browser does not exist");
        return;
    }
    console.log("Fetching captcha...");
    try {
        // const URL = 'https://rgsntl.rgs.cuhk.edu.hk/aqs_prd_applx/Public/tt_dsp_crse_catalog.aspx'
        // const browser = await puppeteer.launch()
        // const page = await browser.newPage()
        // await page.goto(URL)


        // const title = await page.evaluate(el => el.textContent, err_label);
        // console.log("label: ", title);

        // const url = "image/screenshot.png";
        const display = await page.$("#imgCaptcha");
        console.log("Generating screenshot...");
        const screenshot = await display.screenshot({path: out});
        await page.screenshot({path: "image/screenshot2.png"});

        // const screenshot = await page.screenshot({ path: url });
        // console.log(url)
        // await crop(url, out);


        return screenshot

    } catch (error) {
        console.error(error)
    }
}


async function crop(url, out) {

    console.log(`Crop ${url} to ${out}`);

    const img = await Jimp.read(url);
    img.crop({x: 123, y: 90, w: 188, h: 56})
    await img.write(out);

}