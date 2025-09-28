// This is a test stub.
import { sendEmail } from '@/lib/mail';
import nodemailer from 'nodemailer';

// Mock the nodemailer transport
const sendMailMock = jest.fn();
jest.mock('nodemailer');
(nodemailer.createTransport as jest.Mock).mockReturnValue({
  sendMail: sendMailMock
});


describe('Mail Library', () => {
  beforeEach(() => {
    sendMailMock.mockClear();
    process.env.ZOHO_SMTP_USER = 'test@zoho.com';
    process.env.ZOHO_SMTP_PASS = 'password';
    process.env.EMAIL_FROM = 'from@cuddleia.com';
  });
  
  test('sendEmail function should be defined', () => {
    expect(sendEmail).toBeDefined();
  });

  test('sendEmail should call the transporter with correct options', async () => {
    const options = { to: 'recipient@example.com', subject: 'Test', html: '<p>Hi</p>' };
    await sendEmail(options);
    
    expect(sendMailMock).toHaveBeenCalledTimes(1);
    expect(sendMailMock).toHaveBeenCalledWith(expect.objectContaining({
      to: options.to,
      subject: options.subject,
      html: options.html,
      from: `"Cuddleia" <${process.env.EMAIL_FROM}>`
    }));
  });

  test('sendEmail should throw an error if credentials are not set', async () => {
    delete process.env.ZOHO_SMTP_USER;
    const options = { to: 'recipient@example.com', subject: 'Test', html: '<p>Hi</p>' };
    
    await expect(sendEmail(options)).rejects.toThrow("Email service is not configured.");
  });
});
