const express = require('express');
const e = require("express");
const colors = require('colors-console');

const router = express.Router();

const Course = require("../models/Course");
const captcha = require("../modules/captcha");


router.post('/subject', async (req, res) => {

    console.log();
    console.log();
    console.log(colors('green', "======== SEARCH SUBJECT ========"));

    console.log("PupObj: " + req.app.locals.pup_obj);
    console.log("Captcha: " + req.body.captcha);
    console.log("subject: " + req.body.subject);

    const search = await Search(req.app.locals.pup_obj, req.body.captcha, req.body.subject);
    captcha.clear(req.app.locals);
    if (typeof search === "string") {
        res.status("400").end(search); return;
    }

    const { data, screenshot } = search;
    console.log("Search Finished");
    res.json(data);

    console.log(colors("green", "================================"));
    console.log();
    console.log();
})
module.exports = router;


async function Search({page, browser}, captcha, selection){
    const cap_input = await page.$('#txt_captcha');
    cap_input.type(captcha);
    const sub_select = await page.$('#ddl_subject');
    sub_select.select(selection);

    console.log("ready to click search button")

    await Promise.all([
        page.click('#btn_search'),
        page.waitForNavigation()
    ])

    const err_label = await page.$("#lbl_error");
    const err_msg = await page.evaluate(el => el.textContent, err_label);
    if (err_msg) {
        console.error(err_msg);
        return err_msg;
    }
    else {
        console.log(colors("cyan", "Captcha Correct"));
        await page.waitForSelector("#gv_detail");
        await new Promise(r => setTimeout(r, 200));
        console.log(colors("cyan", "Successfully Loaded"));
    }

    let course_list = [];

    try{

        for (let i = 1; ; i++) {

            let table = await page.$(`#gv_detail`);

            let row = await table.$(`tr:nth-child(${i+1})`);
            if (!row) {
                console.log(colors("blue", "reach the end of the table"));
                break;
            }

            let cell = await row.$(`td:nth-child(2)`);
            let code = await row.$(`td:nth-child(1)`);

            let course = new Course(
                selection,
                await code.$eval(`a`, e=>e.innerHTML),
                await cell.$eval(`a`, e=>e.innerHTML)
            );

            console.log(colors("blue", `#${i}`) + ` ${course}`);

            let link = await cell.$("a");
            await searchCourse(page, link, course)

            course_list.push(course);
        }

    } catch (err) {
        console.warn(err)
    }
    // const err_label = await page.$(".errorLabel");
    const screenshot = await page.screenshot({ path: "image/screenshot_search.png" });

    // await browser.close()
    return { data: course_list, screenshot };
}


async function searchCourse(page, link, course_obj){

    await Promise.all([
        link.click(),
        page.waitForNavigation()
    ])

    course_obj.unit = await page.$eval("#uc_course_lbl_units", e=>e.innerHTML);
    course_obj.career = await page.$eval("#uc_course_lbl_acad_career", e=>e.innerHTML);
    course_obj.campus = await page.$eval("#uc_course_lbl_campus", e=>e.innerHTML);

    course_obj.academic_group = await page.$eval("#uc_course_lbl_acad_group", e=>e.innerHTML);
    course_obj.academic_organizations = await page.$eval("#uc_course_lbl_acad_org", e=>e.innerHTML);

    course_obj.grading = await page.$eval("#uc_course_lbl_grading_basis", e=>e.innerHTML);
    let grading = course_obj.grading.match(/([a-z_ ]*)\//i);
    if (grading) course_obj.grading = grading[1];

    course_obj.components = (await page.$eval("#uc_course_lbl_component", e=>e.innerHTML)).split('/');





    await Promise.all([
        page.goBack(),
        page.waitForNavigation()
    ])
}