import {Box, Grid2} from "@mui/material";
import {DataGrid} from "@mui/x-data-grid";


const centralize = { align: "center", headerAlign: "center" }
const columns = [
    {
        field: "id",
        headerName: "Code",
        minWidth: 100,
        ...centralize
    },
    {
        field: "subject",
        headerName: "Subject",
        minWidth: 70,
        ...centralize
    },
    {
        field: "name",
        headerName: "Course Name",
        minWidth: 400, flex: 1,
        headerAlign: "center"
    },
    {
        field: "unit",
        headerName: "Unit",
        minWidth: 100,
        ...centralize
    },
]

export function CourseCatalogPanel({courses, update}) {
    let data = courses.map(
        (course,i) => ({
            id: course.subject + course.code,
            subject: course.subject,
            name: course.name,
            unit: course.unit,
        })
    )
    console.warn("DATA");
    console.log(data)
    console.log(courses)
    return (
        <Box sx={{
            padding: 10
        }}>
            <DataGrid columns={columns} rows={data} />
        </Box>
    )
}