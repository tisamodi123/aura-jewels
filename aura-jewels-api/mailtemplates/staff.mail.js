export const staffTempMailTemplate = ({ name, email, tempPassword }) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8" />
        <title>Staff Account Created</title>
    </head>
    <body style="margin:0; padding:0; background:#f4f4f4; font-family:Arial, sans-serif;">
        
        <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4; padding:20px;">
            <tr>
                <td align="center">
                    
                    <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:10px; overflow:hidden;">
                        
                        <!-- Header -->
                        <tr>
                            <td style=color:#ffffff; padding:10px; text-align:center;">
                                <h2 style="margin:0;">Welcome to Our System</h2>
                            </td>
                        </tr>

                        <!-- Body -->
                        <tr>
                            <td style="padding:30px;">
                                
                                <p>Hi <strong>${name}</strong>,</p>

                                <p>Your staff account has been created successfully.</p>

                                <table width="100%" cellpadding="10" cellspacing="0" style="background:#f9f9f9; border-radius:8px; margin:20px 0;">
                                    <tr>
                                        <td><strong>Email:</strong></td>
                                        <td>${email}</td>
                                    </tr>
                                    <tr>
                                        <td><strong>Temporary Password:</strong></td>
                                        <td>${tempPassword}</td>
                                    </tr>
                                </table>

                                <p style="color:#e74c3c;">
                                    Please login and change your password immediately.
                                </p>

                                <p>If you did not expect this email, please ignore it.</p>

                                <p>Regards,<br/>Team</p>

                            </td>
                        </tr>

                        <!-- Footer -->
                        <tr>
                            <td style="background:#f1f1f1; padding:15px; text-align:center; font-size:12px; color:#777;">
                                © ${new Date().getFullYear()} Your Company. All rights reserved.
                            </td>
                        </tr>

                    </table>

                </td>
            </tr>
        </table>

    </body>
    </html>
    `;
};