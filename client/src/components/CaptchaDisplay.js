import * as React from "react";

export function CaptchaDisplay({count}) {
    console.log("Reloading Captcha ...")
    return (
        <div id="img-wrapper">
            <img id="img" src={(count > 0 ? "http://localhost:4000/captcha?c=" : "") + count} alt=" "/>
        </div>
    )
}