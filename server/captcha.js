const { createWorker } = require('tesseract.js');
const colors = require("colors-console");
const {log} = require("debug");
const Jimp = require("jimp");


class CaptchaHelper {
    constructor() {
        this.black = [0, 0, 0];
        this.white = [255, 255, 255];
    }


    async Binarization(img) {
        let scan = (f) => img.scan(0, 0, img.bitmap.width, img.bitmap.height, (x, y, idx) => {
            const r = img.bitmap.data[idx];
            const g = img.bitmap.data[idx + 1];
            const b = img.bitmap.data[idx + 2];
            [
                img.bitmap.data[idx],
                img.bitmap.data[idx + 1],
                img.bitmap.data[idx + 2]
            ] = f(r, g, b);
        });

        img.blur(1);
        scan((r, g, b) => {
            const t = 108;
            return (r < t && g < t && b < t) ? this.black : this.white
        });
        return img;
    }

    async CropRecognize(img, n, f) {
        let l = []
        for (let i = 0; i < n; i++) {
            l.push(await f(await img.clone().crop({x: img.width/n * i+2, y: 0, w: img.width/4-4, h: img.height})));
        }
    }

    async RecognizeCaptcha(buffer) {
        const worker = await createWorker("eng");

        const {data: {text}} = await worker.recognize(buffer);
        console.log(colors("yellow", "CAPTCHA RECOGNIZED: " + text));
        await worker.terminate();
        return text;
    }


    async RecognizeRotated(img, step, range) {
        const worker = await createWorker("eng");


        let currentCount = 0, current = '';
        let maxCount = 0, max = '';

        for (let i = -range / 2; i <= range / 2; i += step) {
            let {data: {text}}
                = await worker.recognize(
                await img.clone().rotate({deg: i}).getBuffer("image/png")
            );

            text = text.replaceAll(/[\s\n\r]/g, "");     // remove whitespace
            // console.log(colors("yellow", "trial: " + text));

            if (text.length === 1 && text.match(/[a-z0-9]/i)) {
                if (text !== current)
                    [currentCount, current] = [0, text];
                currentCount++;
                if (currentCount > maxCount)
                    [max, maxCount] = [current, currentCount];
            }
        }
        if(max.match(/[cov]/)) max.toUpperCase();
        console.log(colors("yellow", "CAPTCHA RECOGNIZED: " + max));


        await worker.terminate();
        return max;
    }
}
module.exports = new CaptchaHelper();