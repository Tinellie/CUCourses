const { createWorker } = require('tesseract.js');
const colors = require("colors-console");
const {log} = require("debug");
const Jimp = require("jimp");

async function RecognizeCaptcha(buffer) {
    const worker = await createWorker("eng", 1, {
        // logger: m => console.log(m),
    });
    // await worker.setParameters({
    //     tessedit_char_whitelist: '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ',
    // })
    const {data: {text}} = await worker.recognize(buffer);
    console.log(colors("yellow", "CAPTCHA RECOGNIZED: " + text));
    await worker.terminate();
    return text;
}


async function RecognizeRotated(img, step, range) {
    const worker = await createWorker("eng");


    let currentCount = 0, current = '';
    let maxCount = 0, max = '';

    for (let i = -range/2; i <= range/2; i += step) {
        let {data: {text}}
            = await worker.recognize(
                await img.clone().rotate({deg:i}).getBuffer("image/png")
            );
        // console.log(`len: ${text.length}, match: ${text.match(/[a-z0-9]/i)}`);
        text = text.replaceAll(/[\s\n\r]/g, "");     // remove whitespace
        // console.log(colors("yellow", "trial: " + text));

        // console.log(`len: ${text.length}, match: ${text.match(/[a-z0-9]/i)}`);
        // console.log(text[1].charCodeAt(0));
        // console.log(text.match(/[\s\n\r]/g));
        // console.log(`current: [${currentCount}, ${current}] max: [${maxCount}, ${max}], \"${text}\"`);
        if (text.length === 1 && text.match(/[a-z0-9]/i)) {
            if (text !== current)
                [currentCount, current] = [0, text];
            currentCount++;
            if (currentCount > maxCount)
                [max, maxCount] = [current, currentCount];
        }
    }
    console.log(colors("yellow", "CAPTCHA RECOGNIZED: " + max));


    await worker.terminate();
    return max;
}

module.exports = { RecognizeCaptcha, RecognizeRotated };