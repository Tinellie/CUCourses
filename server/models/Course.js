
class Course {
    constructor(subject, code, name, unit = -1) {
        this.name = name;
        this.subject = subject;
        this.code = code;
        this.unit = unit;

        this.career = "Undergraduate";
        this.components = [];
        this.campus = "Main Campus";
        this.grading = null;

        this.academic_group = null;
        this.academic_organizations = null;


        this.requirement_text = "";
        this.requirement = {
            prerequisites: [],
            corequisites: [],
            exclusions: [],
            excluded_major: [],
            target: ""
        }
        this.advise = {
            prerequisites: [],
        }

    }

    setRequirement(str) {
        str+="."
        this.requirement.exclusions
            = Course.parseCoursesRequirement(
                str.match(/not for.*taken(.*)\./i)[1]
            );
        this.requirement.excluded_major
            = Course.parseSubjectRequirement(str.match(/not for (.*) majors\./i)[1]);

        this.requirement.corequisites
            = Course.parseCoursesRequirement(
                str.match(/must take(.*)in the same term\./i)[1]
            );
        this.requirement.prerequisites
            = Course.parseCoursesRequirement(
                str.match(/pre-requisite(.*)\./i)[1]
            );
        this.requirement.target = str.match(/for (.*) only\./i)[1];
    }
    setAdvise(str) {
        this.advise.prerequisites
            = Course.parseCoursesRequirement(
                str.match(/advised to take (.*)\./i)[1]
            );
    }



    static parseCoursesRequirement(c) {
        let subjects = this.parseSubjectRequirement(c);

        let requirement = [];

        let sub_idx = [];
        let idx = 0;
        for (let i = 0; i < subjects.length; i++) {
            sub_idx.push(idx = c.indexOf(subjects[i], idx+1));
        }


        for (let i = 0; i < subjects.length; i++) {
            let sub_req = c.substring(sub_idx[i], sub_idx[i+1])
            let sub_level = sub_req.match(/at or above(.*)level/)
            requirement =
                requirement.concat(sub_req
                    .match(/[0-9]+/g)
                    .map((code) =>
                        subjects[i] + code + (sub_level ? "+" : "") )
                )
        }
        return requirement;
    }
    static parseSubjectRequirement(c) {
        return c.match(/[A-Z_]+/g);
    }



    toString() {
        return `[${this.subject}${this.code}] ${this.name} (${this.unit})`;
    }

}

module.exports = Course;