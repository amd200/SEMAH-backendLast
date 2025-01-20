import { PrismaClient } from '@prisma/client';
let prisma = new PrismaClient();
import { StatusCodes } from 'http-status-codes';
import BadRequestError from '../../errors/bad-request.js';
import UnauthenticatedError from '../../errors/unauthenticated.js';
import { attachCookiesToResponse } from '../../utils/jwt.js';
import createTokenUser from '../../utils/createTokenUser.js';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import {
  sendEmail,
  sendVerificationCode,
  sendWhatsAppMessage,
} from '../../configs/sendgridConfig.js';
import twilio from 'twilio';
import NotFoundError from '../../errors/not-found.js';

const client = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

export const clientRegister = async (req, res) => {
  const { name, companyName, email, password, phoneNumber } = req.body;
  if (!name || !companyName || !email || !password || !phoneNumber) {
    throw new BadRequestError('All fields are required');
  }

  // Check if the email already exists
  const normalizedEmail = email.toLowerCase();

  const isEmailExists = await prisma.client.findUnique({
    where: {
      email: normalizedEmail,
    },
  });
  if (isEmailExists) {
    throw new BadRequestError('Email already exists');
  }

  // Check if the phone number already exists
  const isPhoneNumberExists = await prisma.client.findFirst({
    where: {
      phoneNumber: phoneNumber,
    },
  });
  if (isPhoneNumberExists) {
    throw new BadRequestError('Phone number already exists');
  }

  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate tokens
  const emailVerificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const hashedEmailToken = crypto
    .createHash('sha256')
    .update(emailVerificationCode)
    .digest('hex');
  const emailTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

  const client = await prisma.client.create({
    data: {
      name,
      companyName,
      email: normalizedEmail,
      password: hashedPassword,
      phoneNumber,
      emailVerificationToken: hashedEmailToken,
      emailTokenExpiration,
      role: 'CLIENT',
    },
  });

  // Send verification email
  const emailSubject = 'Your Verification Code';
  const emailBody = `
    <p>Hi ${name},</p>
    <p>Thank you for registering. Please verify your account using the following code:</p>
    <h1>${emailVerificationCode}</h1>
    <p>If you did not register, please ignore this email.</p>
  `;
  await sendEmail(client.email, emailSubject, emailBody);

  res.status(StatusCodes.CREATED).json({
    message: 'Verification codes sent to your email and phone number.',
  });
};

export const resendConfirmationCode = async (req, res) => {
  const { email } = req.body;

  if (!email) {
    throw new BadRequestError('Email is required');
  }

  const normalizedEmail = email.toLowerCase();

  const client = await prisma.client.findUnique({
    where: { email: normalizedEmail },
  });

  if (!client) {
    throw new NotFoundError('No client found with this email');
  }

  if (client.isEmailVerified) {
    return res.status(StatusCodes.BAD_REQUEST).json({
      msg: 'Email is already verifed',
    });
  }

  const emailVerificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const hashedEmailToken = crypto
    .createHash('sha256')
    .update(emailVerificationCode)
    .digest('hex');
  const emailTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.client.update({
    where: { email: normalizedEmail },
    data: {
      emailVerificationToken: hashedEmailToken,
      emailTokenExpiration,
    },
  });

  const emailSubject = 'Your New Verification Code';
  const emailBody = `
    <p>Hi ${client.name},</p>
    <p>Please verify your account using the following code:</p>
    <h1>${emailVerificationCode}</h1>
    <p>This code will expire in 15 minutes. If you did not request this, please ignore this email.</p>
  `;
  await sendEmail(client.email, emailSubject, emailBody);

  res.status(StatusCodes.OK).json({
    message: 'New verification code sent to your email.',
  });
};

export const verifyWithPhone = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    throw new BadRequestError('Phone number is required');
  }

  const verification = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phoneNumber,
      channel: 'sms', // Use 'sms' for text message
    });

  res
    .status(StatusCodes.OK)
    .json({ message: 'Verification code sent via SMS.' });
};
export const verifyClientPhone = async (req, res) => {
  const { phoneNumber, token } = req.body;

  if (!phoneNumber || !token) {
    throw new BadRequestError(
      'Phone number and verification token are required'
    );
  }

  const verificationCheck = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phoneNumber,
      code: token,
    });

  if (verificationCheck.status !== 'approved') {
    console.error('Verification failed:', verificationCheck.status);
    throw new BadRequestError('Invalid or expired token');
  }

  // Update the client in the database
  const clientData = await prisma.client.findFirst({
    where: { phoneNumber },
  });

  if (!clientData) {
    throw new BadRequestError('Client not found');
  }

  await prisma.client.update({
    where: { id: clientData.id },
    data: {
      isPhoneVerified: true,
    },
  });

  res
    .status(StatusCodes.OK)
    .json({ message: 'Phone number verified successfully.' });
};

export const verifyClientEmail = async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    throw new BadRequestError('Email and verification token are required');
  }
  const normalizedEmail = email.toLowerCase();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find client with matching token and check if it hasn't expired
  const client = await prisma.client.findFirst({
    where: {
      email,
      emailVerificationToken: hashedToken,
      emailTokenExpiration: {
        gt: new Date(),
      },
    },
  });
  if (!client) {
    throw new BadRequestError('Invalid or expired token');
  }

  // Verify email and update client with isVerified field
  await prisma.client.update({
    where: { email },
    data: {
      isEmailVerified: true,
      emailVerificationToken: null,
      emailTokenExpiration: null,
    },
  });
  res.status(StatusCodes.OK).json({ message: 'Email verified successfully.' });
};

export const clientLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  // Check if the email exists
  const client = await prisma.client.findFirst({
    where: {
      email: email,
    },
  });
  if (!client) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  // Check if the email is verified
  if (!client.isEmailVerified && !client.isPhoneVerified) {
    throw new UnauthenticatedError('Please verify your email or phone first');
  }

  // Comparing password
  const isPasswordCorrect = await bcrypt.compare(password, client.password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }
  const clientToken = createTokenUser(client);

  let refreshToken = '';
  const existingToken = await prisma.token.findFirst({
    where: { clientId: client.id },
  });
  if (existingToken) {
    const { isValid } = existingToken;
    if (!isValid) {
      throw new UnauthenticatedError('Invalid Credentials');
    }
    refreshToken = existingToken.refreshToken;
    attachCookiesToResponse({ res, user: clientToken, refreshToken });
    res.status(StatusCodes.OK).json({ user: clientToken });
    return;
  }

  refreshToken = crypto.randomBytes(40).toString('hex');
  const userAgent = req.headers['user-agent'];
  const ip = req.ip;
  const userToken = { refreshToken, ip, userAgent, user: client.id };

  await prisma.token.create({
    data: {
      refreshToken,
      ip,
      clientId: client.id,
    },
  });

  attachCookiesToResponse({ res, user: clientToken, refreshToken });
  res.status(StatusCodes.OK).json({ user: clientToken });

  // const clientToken = createTokenUser(client);
  // attachCookiesToResponse({ res, user: clientToken });
  // res.status(StatusCodes.OK).json({ user: clientToken });
};

export const clientLoginWithPhone = async (req, res) => {
  const { phoneNumber, password } = req.body;
  if (!phoneNumber || !password) {
    throw new BadRequestError('Please provide phone number and password');
  }

  // check if the phone existed and is verified
  const client = await prisma.client.findFirst({
    where: {
      phoneNumber: phoneNumber,
    },
  });

  if (!client) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  if (!client.isPhoneVerified && !client.isWhatsAppVerified) {
    throw new UnauthenticatedError('Please verify your phone number first');
  }

  const isPasswordCorrect = await bcrypt.compare(password, client.password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const clientToken = createTokenUser(client);
  attachCookiesToResponse({ res, user: clientToken });
  res.status(StatusCodes.OK).json({ user: clientToken });
};

export const logout = async (req, res) => {
  res.cookie('token', 'logout', {
    httpOnly: true,
    expires: new Date(Date.now() + 1 * 1000),
  });
  res
    .status(StatusCodes.OK)
    .json({ msg: `User has been logged out successfully!` });
};

export const testSms = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    return res.status(400).json({ message: 'Phone number is required' });
  }

  try {
    await sendVerificationCode(phoneNumber);
    res.status(200).json({ message: 'Verification code sent successfully' });
  } catch (error) {
    res.status(500).json({
      message: 'Failed to send verification code',
      error: error.message,
    });
  }
};

export const verifyUsingWhatsApp = async (req, res) => {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    throw new BadRequestError('Phone number is required');
  }

  // Check if the phone number exists
  const client = await prisma.client.findFirst({
    where: { phoneNumber },
  });

  if (!client) {
    throw new BadRequestError('Client with this phone number does not exist');
  }

  // Generate a new WhatsApp verification token
  const whatsappVerificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const whatsappTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

  // Update client with the new token and expiration
  await prisma.client.update({
    where: { id: client.id },
    data: {
      whatsappVerificationToken: whatsappVerificationCode,
      whatsappTokenExpiration,
    },
  });

  // Send WhatsApp message
  const contentSid = process.env.TWILIO_WHATSAPP_SID;
  const contentVariables = { 1: whatsappVerificationCode };

  try {
    await sendWhatsAppMessage(
      `whatsapp:${phoneNumber}`,
      contentSid,
      contentVariables
    );

    res
      .status(StatusCodes.OK)
      .json({ message: 'Verification code sent via WhatsApp.' });
  } catch (error) {
    console.error('Error sending WhatsApp verification code:', error);
    throw new BadRequestError('Failed to send WhatsApp verification code');
  }
};

export const confirmWhatsAppVerification = async (req, res) => {
  const { phoneNumber, token } = req.body;

  if (!phoneNumber || !token) {
    throw new BadRequestError(
      'Phone number and verification token are required'
    );
  }

  // Find the client with the matching phone number and token
  const client = await prisma.client.findFirst({
    where: {
      phoneNumber,
      whatsappVerificationToken: token,
      whatsappTokenExpiration: {
        gt: new Date(), // Ensure token is not expired
      },
    },
  });

  if (!client) {
    throw new BadRequestError('Invalid or expired token');
  }

  // Update the client to mark WhatsApp as verified
  await prisma.client.update({
    where: { id: client.id },
    data: {
      isWhatsAppVerified: true,
      whatsappVerificationToken: null,
      whatsappTokenExpiration: null,
    },
  });

  res
    .status(StatusCodes.OK)
    .json({ message: 'WhatsApp verified successfully.' });
};

export const forgetPassword = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    throw new BadRequestError('Please provide a valid phoneNumber');
  }

  const findClient = await prisma.client.findFirst({
    where: { phoneNumber },
  });

  const verification = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verifications.create({
      to: phoneNumber,
      channel: 'sms', //
    });

  res
    .status(StatusCodes.OK)
    .json({ message: 'Verification code sent successfully' });
};

export const resetPassword = async (req, res) => {
  const { phoneNumber, token, newPassword } = req.body;
  if (!phoneNumber || !token || !newPassword) {
    throw new BadRequestError('Please provide all required fields');
  }

  const verificationCheck = await client.verify.v2
    .services(process.env.TWILIO_VERIFY_SERVICE_SID)
    .verificationChecks.create({
      to: phoneNumber,
      code: token,
    });

  if (verificationCheck.status !== 'approved') {
    throw new BadRequestError('Invalid or expired token');
  }

  const clientData = await prisma.client.findFirst({
    where: { phoneNumber },
  });

  if (!clientData) {
    throw new BadRequestError('Client not found');
  }

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(newPassword, salt);

  const updatedUser = await prisma.client.update({
    where: { id: clientData.id },
    data: { password: hashedPassword },
  });

  res
    .status(StatusCodes.OK)
    .json({ message: 'Password updated successfully', updatedUser });
};
