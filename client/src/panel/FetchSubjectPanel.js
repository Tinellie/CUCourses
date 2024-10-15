import {Box, Button, Grid2, TextField, Typography} from "@mui/material";
import * as React from "react";
import {useRef, useState} from "react";
import qs from "qs";
import axios from "axios";

import {SubjectSelect} from "../components/SubjectSelect";
import {ApiTest} from "../components/ApiTest";
import {CaptchaDisplay} from "../components/CaptchaDisplay";
import {CaptchaForm} from "../components/CaptchaForm";








export function FetchSubjectPanel() {




    // Count Used for Updating Captcha Img
    const [imgCount, imgUpdate] = useState(0);
    const [subCount, subUpdate] = useState(0);

    const [courses, setCourses] = useState([]);

    function addCourse(newCourses) {
        let list = [ ...courses ];

        for (let i = 0; i < newCourses.length; i++) {

            // Check Duplicated Course Items with Same Course Code

            let idx = list.findIndex(v => v.code === newCourses[i].code);

            if (idx >= 0) list[idx] = newCourses[i];
            else list.push(newCourses[i]);
        }
        setCourses(list);
        return list;
    }

    function Text(t, color="primary.main") {
        return <Typography sx={{color:color}}>{t}</Typography>
    }


    const [captcha, setCaptcha] = useState("");

    return (
        <Box>
            <Typography variant="h4" component="h1" sx={{marginBottom:3, marginTop: 5}}>Fetch Course Catalog</Typography>
            <hr/>
            <ApiTest imgUpdate={() => {imgUpdate(imgCount+1);}}/>

            <Grid2 sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "stretch",
                gap: "10px"
            }}>
                <CaptchaForm imgCount={[imgCount, imgUpdate]}
                             subCount={[subCount, subUpdate]}
                             captcha={[captcha, setCaptcha]}
                             addCourse={addCourse}/>
            </Grid2>
        </Box>
    );
}
