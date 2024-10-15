import {Button, Grid2, TextField} from "@mui/material";
import {SubjectSelect} from "./SubjectSelect";
import {CaptchaDisplay} from "./CaptchaDisplay";
import * as React from "react";
import {useRef} from "react";
import qs from "qs";
import axios from "axios";

export function CaptchaForm({   imgCount: [imgCount, imgUpdate], subCount: [subCount, subUpdate],
                                captcha: [captcha, setCaptcha], addCourse}) {

    const subject = useRef("");


    return (
        <Grid2 container columnGap={1}
               component="form" //action="http://localhost:4000/search/subject" method="POST"
               onSubmit={e=>OnSubmit(e, subject.current, captcha, imgUpdate, imgCount, addCourse)}
               sx={{
                   width: "500px"
               }}>
            <Grid2 size={12} container justifyContent="center" sx={{marginTop: 3}}>
                <SubjectSelect count={subCount} setSubject={(v) => subject.current = v}/>
            </Grid2>


            <Grid2 size={12} container justifyContent="center">

                <Grid2 size={6} onClick={async ()=>{
                    console.log("CAPTCHA: refetching");
                    await fetch("http://localhost:4000/captcha/clear");
                    imgUpdate(imgCount+1)   // Refetch Captcha on Click
                }}>
                    <CaptchaDisplay count={imgCount} />
                </Grid2>

            </Grid2>

            <Grid2 size={12} container alignItems="center" spacing={1}>
                <Grid2 size="grow"/>

                <Grid2 container width={200} columnGap={1}>
                    <TextField id="captcha-input" label="captcha" type="text" name="captcha"
                               onChange={e=> {
                                   // Update Captcha Input State only if Input.length == 4
                                   if (e.target.value.length === 4) setCaptcha(e.target.value)
                               }}/>
                </Grid2>

                <Grid2 size="grow">
                    <Button variant="outlined"
                            sx={{height: 1, textTransform: 'capitalize'}}
                            onClick={async ()=>{
                                console.log("restart the browser...");
                                await fetch("http://localhost:4000/browser/restart");
                                console.log("refetching...");
                                imgUpdate(imgCount+1);   // Update
                                subUpdate(subCount+1);
                            }}>Refresh</Button>
                </Grid2>
            </Grid2>


            <Grid2 size={12} container justifyContent="center">
                <Grid2 size={4.5}>
                    <Button fullWidth type="submit" variant="default" color="primary">
                        Submit
                    </Button>
                </Grid2>
            </Grid2>

        </Grid2>
    )
}



async function OnSubmit(e, subject, captcha, setCount, count, addCourse) {
    e.preventDefault();

    console.log(`POST captcha "${captcha}" to server`);
    console.log(`Searching for course of subject "${subject}"`);

    let data = { "subject": subject, "captcha": captcha };
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(data),
        url: 'http://localhost:4000/search/subject'
    };
    let res = await axios(options);

    // Output Res
    console.log(res);
    for (const key in res.data) {
        let item = res.data[key];
        console.log(`[${item.code}] ${item.name} (${item.unit})`);
    }
    setCount(count+1); // Update Captcha Image
    console.log(addCourse(res.data));

}