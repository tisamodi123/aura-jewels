export const resetPasswordTemplate = ({ name, resetLink }) => {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Reset Password</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px;">
      <tr>
        <td align="center">
          
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#000000; color:#ffffff; padding:20px; text-align:center;">
                <h2 style="margin:0;">Reset Your Password</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333;">
                
                <p>Hi ${name || "User"},</p>

                <p>You requested to reset your password. Click the button below to set a new password:</p>

                <div style="text-align:center; margin:30px 0;">
                  <a href="${resetLink}" 
                     style="background:#000000; color:#ffffff; padding:12px 25px; text-decoration:none; border-radius:5px; font-weight:bold;">
                    Reset Password
                  </a>
                </div>

                <p>This link will expire in <b>15 minutes</b>.</p>

                <p>If you did not request this, please ignore this email.</p>

                <p style="margin-top:30px;">Thanks,<br/>Your Team</p>

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

  </html>
  `;
};

export const otpEmailTemplate = ({ name, otp }) => {
    return `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="UTF-8" />
    <title>Your OTP Code</title>
  </head>
  <body style="margin:0; padding:0; font-family: Arial, sans-serif; background-color:#f4f4f4;">
    
    <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f4; padding:20px;">
      <tr>
        <td align="center">
          
          <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff; border-radius:8px; overflow:hidden;">
            
            <!-- Header -->
            <tr>
              <td style="background:#000000; color:#ffffff; padding:20px; text-align:center;">
                <h2 style="margin:0;">Authentication OTP</h2>
              </td>
            </tr>

            <!-- Body -->
            <tr>
              <td style="padding:30px; color:#333;">
                
                <p>Hi ${name || "User"},</p>

                <p>Your One-Time Password (OTP) for registration/login is:</p>

                <div style="text-align:center; margin:30px 0;">
                  <span style="font-size:24px; letter-spacing:4px; font-weight:bold; background:#f4f4f4; padding:10px 20px; border-radius:4px; display:inline-block;">
                    ${otp}
                  </span>
                </div>

                <p>This code is valid for <b>10 minutes</b>. Please do not share it with anyone.</p>

                <p style="margin-top:30px;">Thanks,<br/>Your Team</p>

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