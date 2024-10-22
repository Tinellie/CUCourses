import {Box, Grid2, Typography} from "@mui/material";
import * as React from "react";
import {useState} from "react";

import {ApiTest} from "../components/ApiTest";
import {CaptchaForm} from "../components/CaptchaForm";








export function FetchSubjectPanel({addCourse}) {


    // Count Used for Updating Captcha Img
    const [imgCount, imgUpdate] = useState(0);
    const [subCount, subUpdate] = useState(0);


    function Text(t, color="primary.main") {
        return <Typography sx={{color:color}}>{t}</Typography>
    }



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
                <CaptchaForm imgCount={[imgUpdate, imgCount]}
                             subCount={[subUpdate, subCount]}
                             addCourse={addCourse}/>
            </Grid2>
        </Box>
    );
}
