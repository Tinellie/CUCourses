const error = require("../error");
const {Jimp} = require("jimp");
const cap = require("./captcha_helper");


class Captcha {

    static async fetch({browser, page}, output_path = "image/captcha.png") {
        if (browser === undefined) {
            error("Browser does not exist");
            return;
        }

        console.log("Fetching captcha...");
        try {

            const display = await page.$("#imgCaptcha");

            // return fs.readFileSync("image/captcha.png");
            return await display.screenshot({path: output_path})

        } catch (e) {
            error("failed to fetch captcha due to:");
            console.error(e)
        }
    }

    static async refresh({page}, locals) {
        await page.click("#btn_refresh");
        await page.waitForNavigation();
        this.clear(locals)
    }


    static async process(path, path2) {

        // processing the img

        let img = await Jimp.read(path);
        // img.resize({w: img.width * 2, h: img.height * 2});
        // img.blur(1);
        // img.resize({w: img.width / 2, h: img.height / 2});

        img = await cap.Binarization(img, 106);

        img.blur(1).contrast(0.2);
        // let f = 2;
        // img.resize({w: img.width*f, h: img.height*f});
        // img.blur(1);

        await img.write(path2 ?? path);
        return img;
    }


    static clear(locals) {
        locals.captcha_img = undefined;
    }


    static async recognize(path, path2) {
        let img = await this.process(path, path2);
        return await
            cap.CropRecognize(img, 4,
                (img, worker) => cap.RecognizeRotated(img, 10, 80, worker, true)
            );
    }


    static async crop(url, out) {

        console.log(`Crop ${url} to ${out}`);

        const img = await Jimp.read(url);
        img.crop({x: 123, y: 90, w: 188, h: 56})
        await img.write(out);
    }
}


module.exports = Captcha;


