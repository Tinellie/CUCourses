import {useEffect, useState} from "react";
import {Typography} from "@mui/material";
import * as React from "react";

export function ApiTest({imgUpdate}){

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
                imgUpdate();
            })
            .catch(err => {
                console.error(err);
                setApi("API failed");
                setApiColor("error.main");
            });
    }, [apiCount])

    return (
        <Typography sx={{color: apiColor}}>{api}</Typography>
    );
}