import { MailerService } from '@nestjs-modules/mailer';

export const sendUserOtpEmail = async (
  email: string,
  otp: string,
  mailerService: MailerService,
) => {
  mailerService
    .sendMail({
      to: email, // list of receivers
      from: 'noreply@simplestore.com', // sender address
      subject: 'OTP Verification', // Subject line
      text: `Your OTP is ${otp}`, // plaintext body
      html: `<b>Your OTP is ${otp}</b>`, // HTML body content
    })
    .then(() => {})
    .catch(() => {});
  return {
    success: true,
    message: 'OTP sent to email',
  };
};

export const sendForgotPasswordEmail = async (
  email: string,
  otp: string,
  mailerService: MailerService,
) => {
  mailerService
    .sendMail({
      to: email, // list of receivers
      from: 'noreply@nestjs.com', // sender address
      subject: 'Reset Password', // Subject line
      text: `Your OTP for reset password is ${otp}`, // plaintext body
      html: `<b>Your OTP for reset password is ${otp}</b>`, // HTML body content
    })
    .then(() => {})
    .catch(() => {});
  return {
    success: true,
    message: 'OTP for reset password sent to email',
  };
};
