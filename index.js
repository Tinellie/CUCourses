
const express = require('express');
const puppeteer = require("puppeteer");
const {Jimp} = require("jimp");
const fs = require("fs");
const {join} = require("node:path");

const app = express();

let pup_obj = null;

app.get('/screenshot', async (req, res) => {

    const cap = "image/captcha.png"
    const { browser, page, screenshot } = await fetchCaptcha(cap);
    const screenshotBuffer = fs.readFileSync(join(cap));
    console.log(screenshotBuffer);

    // Respond with the image
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': screenshotBuffer.length
    });
    res.end(screenshotBuffer);

    pup_obj = { browser, page };
    // await browser.close();
})
app.post('/search', async (req, res) => {

    const screenshot = await Search(pup_obj, req.body.captcha, "MATH");

    // res.statusCode = 200;
    // res.setHeader('Content-Type', 'text/html');
    // res.end("Hello");
    const screenshotBuffer = screenshot

    // Respond with the image
    res.writeHead(200, {
        'Content-Type': 'image/png',
        'Content-Length': screenshotBuffer.length
    });
    res.end(screenshotBuffer);

})


app.listen(3000);
console.log(`Server started at http://localhost:3000`);

async function fetchCaptcha(out) {
    console.log("Fetching captcha...");
    try {
        const URL = 'https://rgsntl.rgs.cuhk.edu.hk/aqs_prd_applx/Public/tt_dsp_crse_catalog.aspx'
        const browser = await puppeteer.launch()
        const page = await browser.newPage()
        await page.goto(URL)

        // const title = await page.evaluate(el => el.textContent, err_label);
        // console.log("label: ", title);

        const url = "image/screenshot.png";
        const screenshot = await page.screenshot({ path: url });
        console.log(url)
        await crop(url, out);
        //
        // const display = document.getElementById("img");
        // display.src = "image/captcha.png";
        // console.log(display);


        return {page, browser, screenshot}

    } catch (error) {
        console.error(error)
    }
}

async function Search({page, browser}, captcha, selection){
    const cap_input = await page.$('#txt_captcha');
    cap_input.type(captcha);
    const sub_select = await page.$('#ddl_subject');
    sub_select.select(selection);
    const screenshot = await page.screenshot({ path: "image/screenshot_search.png" });


    const btn = await page.$('#btn_search');
    await btn.click();
    await new Promise(r => setTimeout(r, 200));
    // const err_label = await page.$(".errorLabel");
    const err_label = await page.$("#lbl_error");

    const title2 = await page.evaluate(el => el.textContent, err_label);
    console.log(title2);

    await browser.close()

    return screenshot;
}

async function crop(url, out){

    console.log(`Crop ${url} to ${out}`);

    const img = await Jimp.read(url);
    img.crop({x:123, y:90, w:188, h:56})
    await img.write(out);

}