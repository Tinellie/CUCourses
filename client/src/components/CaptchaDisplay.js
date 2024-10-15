import * as React from "react";

export function CaptchaDisplay({count, onLoad}) {
    console.log("Reloading Captcha ...")
    return (
        <div id="img-wrapper" style={{width:"fit-content"}}>
            <img
                id="img" src={(count > 0 ? "http://localhost:4000/captcha?c=" : "") + count} alt=" "
                onLoad={async () => {
                    console.warn("On LOAD")
                    fetch("http://localhost:4000/captcha/recognize")
                        .then(async res => {
                            let data = await res.text();
                            onLoad(data);
                            console.warn(data);
                        });
                }}
            />
        </div>
    )
}