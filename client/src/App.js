
import './App.css';

import * as React from 'react';
import {FetchSubjectPanel} from "./panel/FetchSubjectPanel";
import {CourseCatalogPanel} from "./panel/CourseCatalogPanel";
import {Grid2} from "@mui/material";






function addCourse(course, setCourses) {
    setCourses(courses => {
        let list = [ ...courses ];
        for (let i = 0; i < course.length; i++) {

            // Check Duplicated Course Items with Same Course Code

            let idx = list.findIndex(v => v.code === course[i].code);

            if (idx >= 0) list[idx] = course[i];
            else list.push(course[i]);
        }
        return list;
    })
}


function App() {

    const [courses, setCourses] = React.useState([]);
    const [count, catalogUpdate] = React.useState(0);

    return (
        <Grid2 className="App" sx={{
            height: "100%",
            display: "flex",
            flexDirection: "row",
            "&>*": {
                height: "100%",
                flex: 1
            }
        }}>
            <FetchSubjectPanel addCourse={
                newCourse => { addCourse(newCourse, setCourses); catalogUpdate(c => c+1);}
            } courses={[courses, setCourses]}/>
            <CourseCatalogPanel courses={courses} update={count}/>
        </Grid2>
    );
}




export default App;
//!dsrZ;qy*0Fe