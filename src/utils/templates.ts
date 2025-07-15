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