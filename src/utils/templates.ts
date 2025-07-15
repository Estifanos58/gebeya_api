export const WELCOME_OTP_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>OTP Verification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #0d6efd;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 30px;
      }
      .otp-box {
        background-color: #f1f3f5;
        padding: 16px;
        font-size: 24px;
        letter-spacing: 4px;
        font-weight: bold;
        text-align: center;
        margin: 20px 0;
        border-radius: 6px;
        color: #0d6efd;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>One-Time Password (OTP)</h2>
      </div>
      <div class="content">
        <p>Hello <strong>{name}</strong>,</p>
        <p>Use the following OTP to complete your verification process. This code is valid only for a limited time.</p>

        <div class="otp-box">{otp}</div>

        <p><strong>Expires At:</strong> {expiresAt}</p>

        <p>If you did not request this OTP, please ignore this email or contact support immediately.</p>
        <p>Thank you,<br />The Team</p>
      </div>
      <div class="footer">
        © {year} YourCompany. All rights reserved.
      </div>
    </div>
  </body>
</html>
`

export const PASSWORD_RESET_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #0d6efd;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 30px;
      }
      .button {
        display: inline-block;
        padding: 12px 24px;
        background-color: #0d6efd;
        color: #ffffff;
        text-decoration: none;
        border-radius: 6px;
        font-weight: bold;
        margin: 20px 0;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #999999;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Reset Your Password</h2>
      </div>
      <div class="content">
        <p>Hi <strong>{name}</strong>,</p>
        <p>We received a request to reset your password. Click the button below to choose a new password:</p>

        <a href="{resetLink}" class="button">Reset Password</a>

        <p>This link will expire on <strong>{expiresAt}</strong>.</p>

        <p>If you did not request a password reset, please ignore this email or contact our support team.</p>

        <p>Thanks,<br />The Support Team</p>
      </div>
      <div class="footer">
        © {year} YourCompany. All rights reserved.
      </div>
    </div>
  </body>
</html>
`

export const PASSWROD_RESET_SUCCESS_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Password Reset Successful</title>
    <style>
      body {
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        background-color: #f4f4f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 600px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
      }
      .header {
        background-color: #198754;
        color: #ffffff;
        padding: 24px;
        text-align: center;
      }
      .content {
        padding: 32px;
        color: #333333;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #888888;
      }
      .button {
        background-color: #198754;
        color: #ffffff;
        padding: 10px 20px;
        border-radius: 6px;
        text-decoration: none;
        display: inline-block;
        margin-top: 20px;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Password Changed Successfully</h2>
      </div>
      <div class="content">
        <p>Hello <strong>{name}</strong>,</p>
        <p>
          This is to let you know that your password was successfully changed on <strong>{date}</strong>.
        </p>
        <p>
          If this was you, no further action is needed. If you did not initiate this change,
          please contact our support team immediately.
        </p>

        <a href="{supportLink}" class="button">Contact Support</a>

        <p style="margin-top: 30px;">Stay safe,<br />The Support Team</p>
      </div>
      <div class="footer">
        © {year} YourCompany. All rights reserved.
      </div>
    </div>
  </body>
</html>
`