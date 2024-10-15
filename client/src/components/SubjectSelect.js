import {Box, FormControl, InputLabel, MenuItem, Select, Typography} from "@mui/material";
import * as React from "react";
import {useEffect, useState} from "react";
import axios from "axios";

export function SubjectSelect({count, setSubject: parentSetSubject}){

    const [subject, setSubject] = useState('');
    const [subjects, setSubjects] = useState([])

    useEffect(() => {
        (async () =>{
                try {
                    console.log("Fetching Subject List ... ");
                    let res = await axios.get("http://localhost:4000/subjects");
                    console.log("Success!")
                    setSubjects(res.data);
                }
                catch (e) {
                    console.error(e);
                }

            })();
        }, [count]);

    return (
        <Box sx={{minWidth: 200}}>
            <FormControl fullWidth>

                <InputLabel id="subject-select-lable">Sub</InputLabel>

                <Select id="subject-select"
                        labelId="subject-select-label"
                        value={subject}
                        label="Sub"
                        variant="outlined" size="small"
                        onChange={(e) => {
                            setSubject(e.target.value);
                            parentSetSubject(e.target.value);
                        }}>
                    {
                        subjects.map(subject => <MenuItem key={subject} value={subject}>
                            <Typography align="left">{subject}</Typography>
                        </MenuItem>)
                    }
                </Select>
            </FormControl>
        </Box>
    )
}