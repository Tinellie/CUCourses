const { createWorker } = require('tesseract.js');
const colors = require("colors-console");
const {log} = require("debug");
const Jimp = require("jimp");


class CaptchaHelper {
    constructor() {
        this.black = [0, 0, 0];
        this.white = [255, 255, 255];
    }


    async Binarization(img, threshold) {
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
            return (r < threshold && g < threshold && b < threshold) ? this.black : this.white
        });
        // let f = 2;
        // img.resize({w: img.width * f, h: img.height * f});
        // img.blur(1);
        return img;
    }

    async CropRecognize(img, n, f) {
        let l = [];
        let worker = null;
        for (let i = 0; i < n; i++) {
            let r = await f(
                await img.clone().crop({x: img.width/n * i+2, y: 0, w: img.width/4-4, h: img.height}),
                worker
            )
            l.push(r.result);
            worker = r.worker;
        }
        let str = `${l.toString().replaceAll(",", "")}`;
        let str_len = str.length;
        console.log(colors("yellow",
            `====================\n`
                 + `===${str.padStart(7+str_len/2, " ").padEnd(14, " ")}===\n`
                 + `====================`));
        return str;
    }

    async RecognizeCaptcha(buffer) {
        const worker = await createWorker("eng");

        const {data: {text}} = await worker.recognize(buffer);
        console.log(colors("yellow", "CAPTCHA RECOGNIZED: " + text));
        await worker.terminate();
        return text;
    }


    async RecognizeRotated(img, step, range, worker = null, retworker = false) {
        worker ??= await createWorker("eng");

        // let currentCount = 0, current = '';
        let maxCount = 0, max = '';
        
        let count = {};

        for (let i = -range / 2; i <= range / 2; i += step) {
            let {data: {text}}
                = await worker.recognize(
                await img.clone().rotate({deg: i}).getBuffer("image/png")
            );

            // console.log(`origin: ${text}`);
            text = text.replaceAll(/[^a-z0-9]/gi, "").toUpperCase();     // remove whitespace
            if (text.length > 1) text = [...new Set(text)].join("");

            console.log(colors("grey", `trial: ${text} (max: ${max} * ${maxCount})`));

            if (text.length > 0) {
                for (const char of text) {
                    if (count[char] === undefined) count[char] = 0;
                    count[char]++;
                    if (count[char] > maxCount) {
                        max = char;
                        maxCount = count[char];
                    }
                }
            }
        }


        //     if (text.indexOf(current) < 0 || current === "") {     // text doesn't contain current / not match with current
        //         console.log(`replace with "${text}", current = "${current}", idx = ${text.indexOf(current)}`);
        //
        //         if (current.length > 1) {           // if current contains more than one char
        //             let text2 = ""
        //             for (let i = 0; i < current.length; i++) {  // search if text contains on of the char
        //                 if (text.indexOf(current[i]) >= 0) {    // if text contains this char ?
        //                     text2 += current[i];                // then add this char
        //                 }
        //             }
        //             text = text2;   // = "" if none of the chars in current match
        //         }
        //         // console.log(`replace with "${text}"`);
        //
        //         [currentCount, current] = [0, text];        // replace with current
        //     }
        //     if (text.length > 0) {
        //         currentCount++;
        //         if (currentCount > maxCount)
        //             [max, maxCount] = [current, currentCount];
        //     }
        // }

        console.log(colors("yellow", "CAPTCHA RECOGNIZED: " + max));


        if (retworker) return { result: max, worker };

        await worker.terminate();
        return max;
    }
}
module.exports = new CaptchaHelper();