const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require("cors");

const Course = require("./models/Course");


const puppeteer = require("puppeteer");

const app = express();
app.use(cors());
app.use(express.urlencoded());
app.use(express.json());

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


const routersPath = [
    'index',
    'users',
    'test',
    'captcha',
    'search',
    'browser',
    'subjects'
];
const routers = {};
for (let i = 0; i < routersPath.length; i++) {
    routers[routersPath[i]] = require('./routes/' + routersPath[i]);
}
for (let i = 0; i < routersPath.length; i++) {
    app.use('/'
        + (routersPath[i] === 'index' ? '' : routersPath[i]), routers[routersPath[i]]);
}


// catch 404 and forward to error handler
app.use(function (req, res, next) {
    next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
    // set locals, only providing error in development
    res.locals.message = err.message;
    res.locals.error = req.app.get('env') === 'development' ? err : {};

    // render the error page
    res.status(err.status || 500);
    res.render('error');
});


function StartBrowser() {
    app.locals.ready = false;
    let Start = (async () => {

        try {
            const URL = 'https://rgsntl.rgs.cuhk.edu.hk/aqs_prd_applx/Public/tt_dsp_crse_catalog.aspx'
            const browser = await puppeteer.launch()
            const page = await browser.newPage()
            await page.goto(URL);

            await page.screenshot({path: "image/screenshot_init.png"});

            // const title = await page.evaluate(el => el.textContent, err_label);
            // console.log("label: ", title);

            //
            // const display = document.getElementById("img");
            // display.src = "image/captcha.png";
            // console.log(display);

            app.locals.pup_obj = {
                browser,
                page,
                async restart() {

                    console.log();
                    console.log();
                    console.warn("\x1B[31m======== RESTARTING THE BROWSER ========\x1B[0m");
                    console.log();
                    console.log();

                    app.locals.captcha_img = undefined;

                    app.locals.pup_obj = null;
                    await Start();
                }
            }

            app.locals.get_captcha = async function () {
                return app.locals.captcha_img ??= await FetchCaptcha(app.locals.pup_obj);
            }
            app.locals.get_subjects = async function () {
                return app.locals.subjects_list ??= await FetchSubjects({page});
            }

        } catch (error) {
            console.error(error)
        }

    });
    Start().then(r => {
        app.locals.ready = true;
        console.log("Browser Ready")
    })
}


app.locals.check = () => {
    if (!app.locals.ready) {
        console.warn("Browser not ready");
        return false;
    }
    return true;
}

StartBrowser();

let mysql = require('mysql2');
const {query} = require("express");
app.locals.data = mysql.createConnection({
    host: 'localhost',
    port: '3306',
    user: 'root',
    password: '20241013@',
    database: 'COURSE_CATALOG'
});

app.locals.data.connect();

let $= {

    // insert: (...values) => this.query(
    //     `insert into COURSES values (${ values.join(',') })`,
    //     (r) => {},
    //     (e) => {
    //         if (e.code === "ER_DUP_ENTRY")
    //     }
    //
    // ),
    // addCourse: (course) => this.insert(course.subject + course.code, course.subject, course.code, course.unit)
    query(query, then, fallback) {
        app.locals.data.query(query, function (error, results) {
            if (error) {
                (fallback ?? ((e) => {throw e}))(error)
            }
            if (then) then(results);
        });
    },
    set(...values) {
        this.query(
            `replace into COURSES values (${ 
                values.map(item => typeof item === "string" ? `"${item}"` : item.toString()).join(',') 
            })`
        );
    },
    addCourse(course) {
        this.set(course.subject + course.code, course.subject, course.code, course.name, course.unit)
    }
}
// $.query = (query, then, fallback) => app.locals.data.query(query, function (error, results) {
//     if (error) {
//         (fallback ?? ((e) => {throw e}))(error)
//     }
//     if (then) then(results);
// });
// $.set = (...values) => this.query(
//     `replace into COURSES values (${ values.join(',') })`
// );
// $.addCourse = (course) => this.set(course.subject + course.code, course.subject, course.code, course.unit)
app.locals.$ = $;

// app.locals.$.addCourse(new Course("TEST", 1002, "Basic Test 2", 9));




async function FetchCaptcha({page}) {
    console.log("Fetching captcha...");

    const display = await page.$("#imgCaptcha");
    console.log("Generating screenshot...");
    await page.screenshot({path: "image/screenshot2.png"});
    return await display.screenshot({path: "image/captcha.png"});
}

async function FetchSubjects({page}) {
    console.log("Fetching subjects list...");

    const subject = await page.$$eval("#ddl_subject option", e => e.map(e => e.value));
    subject.shift();
    console.log(subject);
    return subject;
}


module.exports = app;


