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

export const PAYMENT_SUCCESSFUL_TEMPLATE = 
`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Payment Confirmation</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 700px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #28a745;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 30px;
      }
      .order-details {
        margin-top: 20px;
      }
      .product {
        border-bottom: 1px solid #eee;
        padding: 15px 0;
      }
      .product:last-child {
        border-bottom: none;
      }
      .product p {
        margin: 4px 0;
      }
      .total {
        text-align: right;
        font-size: 18px;
        margin-top: 20px;
        font-weight: bold;
        color: #000;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #999999;
      }
      .section-title {
        font-size: 16px;
        margin-top: 30px;
        font-weight: bold;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>Payment Successful</h2>
      </div>
      <div class="content">
        <p>Hello <strong>{customerName}</strong>,</p>
        <p>Thank you for your purchase from <strong>{storeName}</strong>!</p>
        <p>Your order has been received and is now being processed.</p>

        <p class="section-title">Order Details</p>
        <p><strong>Order Number:</strong> {orderNumber}</p>
        <p><strong>Delivery Address:</strong> {deliveryAddress}</p>

        <div class="order-details">
          <div class="product">
            {purchasedProductsHTMLT_Template}
          </div>
        </div>

        <p class="total">Total Price: {totalPrice} ETB</p>

        <p>If you have any questions, feel free to contact our support team.</p>
        <p>Thank you,<br />GEBEYA Team</p>
      </div>
      <div class="footer">
        © {year} GEBEYA PLC. All rights reserved.
      </div>
    </div>
  </body>
</html>
`

export const ORDER_PLACED_TEMPLATE = 
`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>New Order Notification</title>
    <style>
      body {
        font-family: Arial, sans-serif;
        background-color: #f4f4f7;
        margin: 0;
        padding: 0;
      }
      .container {
        max-width: 700px;
        margin: 40px auto;
        background-color: #ffffff;
        border-radius: 8px;
        box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
        overflow: hidden;
      }
      .header {
        background-color: #007bff;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 30px;
      }
      .order-details {
        margin-top: 20px;
      }
      .product {
        border-bottom: 1px solid #eee;
        padding: 15px 0;
      }
      .product:last-child {
        border-bottom: none;
      }
      .product p {
        margin: 4px 0;
      }
      .total {
        text-align: right;
        font-size: 18px;
        margin-top: 20px;
        font-weight: bold;
        color: #000;
      }
      .footer {
        text-align: center;
        padding: 20px;
        font-size: 12px;
        color: #999999;
      }
      .section-title {
        font-size: 16px;
        margin-top: 30px;
        font-weight: bold;
        color: #333;
      }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h2>New Order Received</h2>
      </div>
      <div class="content">
        <p>Hello <strong>{storeOwner}</strong>,</p>
        <p>You have received a new order from <strong>{customerName}</strong>.</p>

        <p class="section-title">Order Details</p>
        <p><strong>Order Number:</strong> {orderNumber}</p>
        <p><strong>Delivery Address:</strong> {deliveryAddress}</p>

        <div class="order-details">
          <div class="product">
            {purchasedProductsHTMLT_Template}
          </div>
        </div>

        <p class="total">Total Price: {totalPrice} ETB</p>

        <p>Please prepare this order for delivery as soon as possible.</p>
        <p>Regards,<br /> GEBEYA E-Commerce Platform</p>
      </div>
      <div class="footer">
        © {year} GEBEYA PLC. All rights reserved.
      </div>
    </div>
  </body>
</html>

`

export const STORE_DISAPPROVED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Store Disapproval Notification</title>
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
        background-color: #dc3545;
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
        <h2>Store Application Disapproved</h2>
      </div>
      <div class="content">
        <p>Hi <strong>{name}</strong>,</p>

        <p>We’ve reviewed your store application for <strong>{storeName}</strong> and unfortunately, it has been disapproved at this time.</p>

        <p><strong>Reason:</strong> {reason}</p>

        <p>If you believe this decision was made in error or you would like to submit additional information, feel free to contact our support team.</p>

        <a href="{supportLink}" class="button">Contact Support</a>

        <p>Thank you for your interest and understanding.</p>

        <p>Best regards,<br />The Store Review Team</p>
      </div>
      <div class="footer">
        © {year} YourCompany. All rights reserved.
      </div>
    </div>
  </body>
</html>

`

export const STORE_APPROVED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Store Approval</title>
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
        background-color: #198754;
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
        background-color: #198754;
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
        <h2>Your Store Has Been Approved!</h2>
      </div>
      <div class="content">
        <p>Hi <strong>{name}</strong>,</p>
        <p>Congratulations! Your store <strong>{storeName}</strong> has been successfully approved by our team.</p>

        <p>You can now start adding products, managing orders, and growing your business.</p>

        <a href="{dashboardLink}" class="button">Go to Dashboard</a>

        <p>If you have any questions or need assistance, feel free to reach out to our support team.</p>

        <p>We’re excited to have you on board!<br />The Support Team</p>
      </div>
      <div class="footer">
        © {year} YourCompany. All rights reserved.
      </div>
    </div>
  </body>
</html>
`
export const STORE_BANNED_TEMPLATE = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Store Banned</title>
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
        background-color: #dc3545;
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
        background-color: #dc3545;
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
        <h2>Your Store Has Been Banned</h2>
      </div>
      <div class="content">
        <p>Hi <strong>{name}</strong>,</p>
        <p>We regret to inform you that your store <strong>{storeName}</strong> has been banned from our platform due to a violation of our policies.</p>

        <p><strong>Reason:</strong> {reason}</p>
        
        <p>We take these actions to ensure a safe and fair marketplace for all users.</p>

        <p>Please review our <a href="{policyLink}">terms and conditions</a> to better understand what may have caused this action.</p>

        <p>If you believe this was a mistake or would like to appeal the decision, you can contact our support team by clicking the button below.</p>

        <a href="{supportLink}" class="button">Contact Support</a>

        <p>Thank you for your understanding.<br />The Support Team</p>
      </div>
      <div class="footer">
        © {year} YourCompany. All rights reserved.
      </div>
    </div>
  </body>
</html>
`

export const STORE_UNBANNED_TEMPLATE = 
`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Store Reinstated</title>
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
        background-color: #198754;
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
        background-color: #198754;
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
        <h2>Your Store Has Been Reinstated</h2>
      </div>
      <div class="content">
        <p>Hi <strong>{name}</strong>,</p>
        <p>We’re pleased to inform you that your store <strong>{storeName}</strong> has been reinstated after a thorough review.</p>

        <p>You can now resume managing your products, fulfilling orders, and serving your customers without any restrictions.</p>

        <a href="{dashboardLink}" class="button">Go to Dashboard</a>

        <p>If you have any further questions or concerns, feel free to contact our support team at any time.</p>

        <p>Thank you for your cooperation.<br />The Support Team</p>
      </div>
      <div class="footer">
        © {year} YourCompany. All rights reserved.
      </div>
    </div>
  </body>
</html>
`

export const USER_BANNED_TEMPLATE = 
`<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Account Ban Notification</title>
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
        background-color: #dc3545;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 30px;
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
        <h2>Account Banned</h2>
      </div>
      <div class="content">
        <p>Hi <strong>{name}</strong>,</p>

        <p>We regret to inform you that your account has been permanently banned from our platform. This means you will no longer be able to browse, purchase, or interact with any stores on our site.</p>

        <p>This decision was made based on violations of our platform rules and community guidelines. We take these actions seriously to protect the experience of our users and sellers.</p>

         <p>If you believe this was a mistake or would like to appeal the decision, you can contact our support team by clicking the button below.</p>

        <a href="{supportLink}" class="button">Contact Support</a>


        <p>Thank you for your understanding.<br />The Support Team</p>
      </div>
      <div class="footer">
        © {year} YourCompany. All rights reserved.
      </div>
    </div>
  </body>
</html>
`

export const USER_UNBANNED_TEMPLATE =
`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>Account Reinstated</title>
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
        background-color: #28a745;
        color: #ffffff;
        padding: 20px;
        text-align: center;
      }
      .content {
        padding: 30px;
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
        <h2>Account Reinstated</h2>
      </div>
      <div class="content">
        <p>Hi <strong>{name}</strong>,</p>

        <p>We’re happy to inform you that your account has been reinstated and you now have full access to our platform again.</p>

        <p>You can now browse products, make purchases, and interact with stores just like before.</p>

        <p>We appreciate your patience during the review process.</p>

        <p>Welcome back!<br />The Support Team</p>
      </div>
      <div class="footer">
        © {year} YourCompany. All rights reserved.
      </div>
    </div>
  </body>
</html>
`