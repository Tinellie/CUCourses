import * as React from "react";
import {Grid2, styled, Typography} from "@mui/material";
import {useEffect} from "react";


const StyledDiv = styled('div')({
    // width: "100%",
    cursor: "pointer",
    '& *': {
        transition: "all 0.06s ease-out",
    },
    '&:hover img': {
        filter: "brightness(0.65)",
    },

    '&:active': {
    },
    '&:active *': {
        filter: "brightness(0.5)",
    },

    '& p': {
        opacity: 0
    },
    '&:hover p': {
        opacity: 1
    },
    position: "relative"
});


export function CaptchaDisplay({imgCount: [imgCount, imgUpdate], onRecognize, setCaptchaRecognized}) {

    useEffect(() => {
        setCaptchaRecognized("...");
    }, [setCaptchaRecognized, imgCount]);

    console.log("Reloading Captcha ..." + imgCount)
    return (
        <Grid2 size={6} onClick={async ()=>{
            console.warn("CAPTCHA: refreshing");
            await fetch("http://localhost:4000/captcha/refresh");
            imgUpdate(c=>c+1)   // Refetch Captcha on Click
        }} sx={{width: "fit-content"}}>
            <StyledDiv id="img-wrapper">
                <img
                    id="img" src={(imgCount > 0 ? "http://localhost:4000/captcha?c=" : "") + imgCount} alt=" "
                    onLoad={async () => {
                        console.warn("CAPTCHA: loaded");
                        fetch("http://localhost:4000/captcha/recognize")
                            .then(async res => {
                                let data = await res.text();
                                onRecognize(data);
                                console.warn(`CAPTCHA: recognized to be [${data}]`);
                            });
                    }}
                />
                <Typography sx={{
                    width: "100%", height: "100%",
                    position: "absolute",

                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",

                    letterSpacing: 5,
                    textTransform: "uppercase",
                    fontWeight: "100"
                }} color="white" variant="h5" component="p">
                    Refresh
                </Typography>
            </StyledDiv>
        </Grid2>
    )
}