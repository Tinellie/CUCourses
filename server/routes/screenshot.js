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
    const [black, white] = [[0, 0, 0], [255, 255, 255]]


    let scan = (f) => img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
        const r = img.bitmap.data[idx];
        const g = img.bitmap.data[idx + 1];
        const b = img.bitmap.data[idx + 2];
        // const avg = (red + green + blue) / 3;
        // const threshold = 158; // 阈值
        // console.log(colors("red", `${idx}`));
        [
            img.bitmap.data[idx],
            img.bitmap.data[idx + 1],
            img.bitmap.data[idx + 2]
        ] = f(r, g, b);
    });

    // scan((r, g, b) => {
    //     const t = 5;
    //     return (Math.abs(r-g) > t || Math.abs(g-b) > t || Math.abs(b-r) > t) ?
    //         black : white;
    // });
    img.blur(1);
    scan((r, g, b) => {
        const t = 105;
        return (r < t && g < t && b < t) ? black : white
    })
    // img.blur(1);
    // scan((r, g, b) => {
    //     const t = 105;
    //     return (r < t && g < t && b < t) ? black : white
    // })
    // let m = 1, f=4;
    // let img2
    //     = new Jimp({width: img.width + 2*m, height: img.height + 2*m, color: '#ffffff'});
    // await img2.blit({src: img, x: m, y: m})
    //
    // await img2.resize({w: img2.width * f, h: img2.height * f});
    //
    // await img2.crop({x:img2.width *2 / 4, y:0, w: img2.width / 4 + 30, h: img2.height});
    // await img2.write("image/empty.png");


    // img.crop({x: -m, y: -m, w: img.width + 2*m, h: img.height + 2*m });
    //
    // async function recognize(f, i){
    //     let img2 = await f(img.clone());
    //     await img2.write(`image/captcha/${i}.png`);
    //     return await cap.RecognizeCaptcha(await img2.getBuffer("image/png"));
    // }
    //
    // let range = 60;
    // let d = 5;
    // for (let i = -range/2; i <= range/2; i+=d) {
    //     await recognize(async img => await img.rotate({deg:i}), i);
    // }

    await img.write("image/captcha2.png");
    let img_buffer = fs.readFileSync("image/captcha2.png");

    for (let i = 0; i < 4; i++) {
        await cap.RecognizeRotated(
            await img.clone().crop({x: img.width/4 * i+2, y: 0, w: img.width/4-4, h: img.height}), 5, 60
        );
    }


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