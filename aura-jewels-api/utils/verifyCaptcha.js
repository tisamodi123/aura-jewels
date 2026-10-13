export const verifyCaptcha = async (captchaToken) => {
    if (!captchaToken) {
        throw new Error("Captcha token is required");
    }

    const params = new URLSearchParams({
        secret: process.env.NEXT_PUBLIC_SECRET_KEY,
        response: captchaToken,
    });
    console.log("Verifying captcha.............");

    const response = await fetch(
        "https://www.google.com/recaptcha/api/siteverify",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/x-www-form-urlencoded",
            },
            body: params,
        }
    );

    const data = await response.json();
    console.log("captcha Response =============>", data)
    if (!data.success) {
        console.error("Captcha Error:", data);
        throw new Error("Captcha verification failed");
    }

    return true;
};