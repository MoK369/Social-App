const HTML_EMAIL_TEMPLATE = ({
  title,
  message,
  otpOrLink,
  company = process.env.APP_NAME,
}: {
  title: string;
  message: string;
  otpOrLink: string;
  company?: string;
}): string => {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
  <title>${title}</title>
  <style>
    body {
      font-family: 'Segoe UI', sans-serif;
      background-color: #f4f6f8;
      margin: 0;
      padding: 0;
    }
    .container {
      max-width: 600px;
      margin: 40px auto;
      background-color: #ffffff;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      padding: 30px;
      text-align: center;
    }
    .header {
      background-color: #4a90e2;
      color: white;
      padding: 20px;
      border-radius: 8px 8px 0 0;
    }
    .otp-box {
      font-size: 28px;
      font-weight: bold;
      color: #4a90e2;
      background-color: #eaf1fb;
      padding: 15px;
      border-radius: 6px;
      margin: 20px 0;
      letter-spacing: 4px;
    }
    .footer {
      font-size: 12px;
      color: #888;
      margin-top: 30px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h2>${title}</h2>
    </div>
    <p>${message}</p>
    <div class="otp-box">${otpOrLink}</div>
    <p>This code or link will expire in 10 minutes. If you did not request this, please ignore this email.</p>
    <div class="footer">
      &copy; 2025 ${company}. All rights reserved.
    </div>
  </div>
</body>
</html>
`;
};

export default HTML_EMAIL_TEMPLATE;
