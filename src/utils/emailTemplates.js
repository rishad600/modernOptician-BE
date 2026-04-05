import moment from 'moment-timezone';
import config from '../config/config.js';

export const getForgotPasswordTemplate = (name, otp) => {
  const otpDigits = String(otp).split('').map(digit => `<div class="otp-digit">${digit}</div>`).join('');

  return `<!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
    <title>OTP Email – Optician Online Class</title>
    <style>
      * { margin: 0; padding: 0; box-sizing: border-box; }
      body { background: #f0f0f0; font-family: Arial, sans-serif; padding: 10px; }
  
      .email-client { max-width: 500px; margin: 0 auto; }
      .brand-row { margin-bottom: 16px; padding: 0 4px; }
      .brand-icon { width: 32px; height: 32px; background: #0369a1; border-radius: 8px; display: inline-block; vertical-align: middle; text-align: center; }
      .brand-icon img { width: 16px; height: 16px; margin-top: 8px; border: 0; outline: none; }
      .brand-name { font-size: 15px; font-weight: 500; color: #1a1a1a; display: inline-block; vertical-align: middle; margin-left: 8px; }
  
      .email-card { background: #ffffff; border-radius: 12px; overflow: hidden; border: 1px solid #d4d4d4; }
  
      .email-banner { background: #0c2340; padding: 36px 36px 30px; position: relative; overflow: hidden; }
      .lock-wrap { width: 48px; height: 48px; background: rgba(255,255,255,0.08); border: 1px solid rgba(255,255,255,0.15); border-radius: 12px; margin-bottom: 14px; text-align: center; }
      .lock-wrap img { width: 22px; height: 22px; margin-top: 12px; border: 0; outline: none; }
      .email-banner h1 { font-size: 22px; font-weight: 500; color: #f0f9ff; line-height: 1.25; margin: 0 0 6px; position: relative; z-index: 1; }
      .email-banner p { font-size: 13px; color: #7dd3fc; line-height: 1.6; margin: 0; position: relative; z-index: 1; }
  
      .email-body { padding: 28px 36px 32px; }
      .greeting { font-size: 14px; color: #52525b; line-height: 1.7; margin: 0 0 24px; }
      .greeting strong { color: #18181b; font-weight: bold; }
  
      .otp-label { font-size: 12px; font-weight: 500; color: #a1a1aa; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 10px; }
      .otp-box { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 22px; text-align: center; margin-bottom: 18px; }
      .otp-digits { text-align: center; }
      .otp-digit { width: 44px; height: 50px; background: #ffffff; border: 2px solid #0369a1; border-radius: 8px; display: inline-block; font-size: 24px; font-weight: 500; color: #0369a1; font-family: monospace; line-height: 48px; text-align: center; margin: 0 4px; }
  
      .expiry-row { background: #fffbeb; border: 1px solid #fcd34d; border-radius: 8px; padding: 12px 14px; margin-bottom: 24px; overflow: hidden; }
      .expiry-row img { width: 14px; height: 14px; float: left; margin-top: 2px; margin-right: 12px; border: 0; outline: none; }
      .expiry-row span { font-size: 12px; color: #92400e; display: block; overflow: hidden; }
      .expiry-row strong { color: #b45309; }
  
      .divider { height: 1px; background: #e4e4e7; margin: 22px 0; }
  
      .security-row { background: #fff1f2; border: 1px solid #fecdd3; border-radius: 8px; padding: 12px 14px; margin-bottom: 22px; overflow: hidden; }
      .security-row img { width: 14px; height: 14px; float: left; margin-top: 3px; margin-right: 12px; border: 0; outline: none; }
      .security-row span { font-size: 12px; color: #9f1239; line-height: 1.6; display: block; overflow: hidden; }
      .security-row strong { color: #be123c; }
  
      .ignore-txt { text-align: center; font-size: 12px; color: #a1a1aa; line-height: 1.7; }
  
      .email-footer { background: #fafafa; border-top: 1px solid #e4e4e7; padding: 20px 36px; text-align: center; }
      .email-footer p { font-size: 11px; color: #a1a1aa; line-height: 1.8; margin: 0 0 8px; }
      .footer-links { text-align: center; }
      .footer-links a { font-size: 11px; color: #71717a; text-decoration: none; margin: 0 8px; display: inline-block; }
    </style>
  </head>
  <body>
    <div class="email-client">
  
      <!-- Preheader to hide email text logic -->
      <span style="display:none;font-size:1px;color:#f0f0f0;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">Your one-time passcode to reset your Optician Online Class password.</span>
  
      <div class="brand-row">
        <div class="brand-icon">
          <img src="https://api.iconify.design/lucide/eye.svg?color=white&width=16&height=16" alt="Eye Icon" />
        </div>
        <span class="brand-name">Optician Online Class</span>
      </div>
  
      <div class="email-card">
  
        <div class="email-banner">
          <div class="lock-wrap">
            <img src="https://api.iconify.design/lucide/lock.svg?color=%237dd3fc&width=22&height=22" alt="Lock Icon" />
          </div>
          <h1>Reset your password</h1>
          <p>We received a request to reset the password for your account.</p>
        </div>
  
        <div class="email-body">
  
          <p class="greeting">Hi <strong>${name}</strong>, use the one-time passcode below to reset your password. Do not share this code with anyone.</p>
  
          <div class="otp-label">Your verification code</div>
          <div class="otp-box">
            <div class="otp-digits">
              ${otpDigits}
            </div>
          </div>
  
          <div class="expiry-row">
            <img src="https://api.iconify.design/lucide/clock.svg?color=%23d97706&width=14&height=14" alt="Clock Icon" />
            <span>This code expires in <strong>10 minutes</strong>. Request a new one if it expires.</span>
          </div>
  
          <div class="divider"></div>
  
          <div class="security-row">
            <img src="https://api.iconify.design/lucide/triangle-alert.svg?color=%23e11d48&width=14&height=14" alt="Warning Icon" />
            <span><strong>Security notice:</strong> Optician Online Class will never ask for this code via phone or chat. If you did not request a password reset, please ignore this email or contact support immediately.</span>
          </div>
  
          <p class="ignore-txt">Didn't request this? You can safely ignore this email.<br/>Your password will not be changed.</p>
  
        </div>
  
        <div class="email-footer">
          <p>&copy; ${moment.tz(config.timezone).year()} Optician Online Class. All rights reserved.</p>
        </div>
  
      </div>
    </div>
  </body>
  </html>`;
};
