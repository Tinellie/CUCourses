import {Box, Button, Grid2, TextField, Typography} from "@mui/material";
import {SubjectSelect} from "./SubjectSelect";
import * as React from "react";
import {useEffect, useRef, useState} from "react";
import qs from "qs";
import axios from "axios";



function Img({count}) {
    console.log("Reloading Captcha ...")
    return (
        <div id="img-wrapper">
            <img id="img" src={(count > 0 ? "http://localhost:4000/screenshot?c=" : "") + count} alt=" "/>
        </div>
    )
}

function ApiTest({update}){

    const [api, setApi] = useState("Fetching ...");
    const [apiColor, setApiColor] = useState("Black");
    const [apiCount, setApiCount] = useState(0);

    useEffect(() => {
        console.log("Testing API")
        fetch("http://localhost:4000/test")
            .then(res => res.text())
            .then(res => {
                setApi(res);
                setApiColor("primary.main");
                update();
            })
            .catch(err => {

                console.error(err);
                setApi("API failed");
                setApiColor("error.main");

                // setTimeout(() => {
                //     setApiCount(apiCount+1);
                //
                //     let text = `Testing API (Attempt ${apiCount+1})`;
                //     console.warn(text);
                //     setApi(text);
                //
                // }, 4000)
            });
    }, [apiCount])

    return (
        <Typography sx={{color: apiColor}}>{api}</Typography>
    );
}



export function FetchSubjectPanel() {


    const subject = useRef("");


    // Count Used for Updating Captcha Img
    const [count, setCount] = useState(0);


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
            <ApiTest update={() => {setCount(count+1);}}/>
            <Grid2 sx={{
                display: "flex",
                flexDirection: "row",
                justifyContent: "center",
                alignItems: "stretch",
                gap: "10px"
            }}>
                <Grid2 container columnGap={1}
                       component="form" //action="http://localhost:4000/search/subject" method="POST"
                       onSubmit={e=>SearchCourse(e, subject.current, captcha, setCount, count, addCourse)}
                       sx={{
                           width: "500px"
                       }}>
                    <Grid2 size={12} container justifyContent="center" sx={{marginTop: 3}}>
                        <SubjectSelect count={count} setSubject={(v) => subject.current = v}/>
                    </Grid2>


                    <Grid2 size={12} container justifyContent="center">
                        {/*<Grid2 size="grow"/>*/}
                        <Grid2 size={6} onClick={async ()=>{
                            console.log("CAPTCHA: refetching");
                            await fetch("http://localhost:4000/screenshot/refetch");
                            setCount(count+1)
                        }}>
                            <Img count={count} />
                        </Grid2>
                        {/*<Grid2 size="grow"/>*/}
                    </Grid2>

                    <Grid2 size={12} container alignItems="center" spacing={1}>
                        <Grid2 size="grow"/>
                        <Grid2 container width={200} columnGap={1}>
                            <TextField id="captcha-input" label="captcha" type="text" name="captcha"
                                       onChange={e=> {
                                           // Update Captcha Input State only if Input.length == 4
                                           if (e.target.value.length === 4) setCaptcha(e.target.value)
                                       }}
                            />
                        </Grid2>
                        <Grid2 size="grow">
                            <Button variant="outlined"
                                    sx={{height: 1, textTransform: 'capitalize'}}
                                    onClick={async ()=>{
                                        console.log("restart the browser...");
                                        await fetch("http://localhost:4000/browser/restart");
                                        console.log("refetching...");
                                        setCount(count+1)
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
            </Grid2>
        </Box>
    );
}


async function SearchCourse(e, subject, captcha, setCount, count, addCourse) {
    e.preventDefault();

    console.log(`Try to POST captcha "${captcha}" to server`);
    console.log(`Searching for course of subject "${subject}"`);

    let data = { "subject": subject, "captcha": captcha };
    const options = {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        data: qs.stringify(data),
        url: 'http://localhost:4000/search/subject'
    };
    let res = await axios(options);
    console.log(`POST captcha: "${captcha}" to server`);

    // Output Res
    console.log(res);
    for (const key in res.data) {
        let item = res.data[key];
        console.log(`[${item.code}] ${item.name} (${item.unit})`);
    }
    setCount(count+1);
    console.log(addCourse(res.data));

}