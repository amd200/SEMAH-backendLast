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
  sendWhatsAppMessage,
} from '../../configs/sendgridConfig.js';

export const employeeRegister = async (req, res) => {
  const { name, email, identityNumber, dob, password, phoneNumber } = req.body;
  if (!name || !email || !identityNumber || !dob || !password || !phoneNumber) {
    throw new BadRequestError('All fields are required');
  }

  // Check if the email already exists
  const normalizedEmail = email.toLowerCase();
  const isEmailExists = await prisma.employee.findUnique({
    where: {
      email: normalizedEmail,
    },
  });
  if (isEmailExists) {
    throw new BadRequestError('Email already exists');
  }

  // Check if the phone number already exists
  const isPhoneNumberExists = await prisma.employee.findFirst({
    where: {
      phoneNumber,
    },
  });
  if (isPhoneNumberExists) {
    throw new BadRequestError('Phone number already exists');
  }

  // Hashing the password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Generate a verification code
  const verificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString(); // 6-digit code
  const hashedCode = crypto
    .createHash('sha256')
    .update(verificationCode)
    .digest('hex');
  const codeExpiration = new Date(Date.now() + 15 * 60 * 1000); // 15 minutes expiration

  const employee = await prisma.employee.create({
    data: {
      name,
      email: normalizedEmail,
      identityNumber,
      dob: new Date(dob), // Ensure dob is stored as a valid date
      password: hashedPassword,
      phoneNumber,
      verificationToken: hashedCode,
      tokenExpiration: codeExpiration,
      isVerified: false,
      role: 'EMPLOYEE',
    },
  });

  const emailSubject = 'Employee Account Verification Code';
  const emailBody = `
    <p>Hi ${name},</p>
    <p>Your verification code for registering an employee account with email ${email} is:</p>
    <h1>${verificationCode}</h1>
    <p>This code will expire in 15 minutes.</p>
  `;
  await sendEmail(process.env.OWNER_EMAIL, emailSubject, emailBody);

  res.status(StatusCodes.CREATED).json({
    message:
      'Verification code sent to owner email. Please complete the verification process.',
  });
};

export const verifyEmployee = async (req, res) => {
  const { email, token } = req.body;
  if (!email || !token) {
    throw new BadRequestError('Email and verification token are required');
  }
  const normalizedEmail = email.toLowerCase();
  const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

  // Find employee by email and verification code
  const employee = await prisma.employee.findFirst({
    where: {
      email: normalizedEmail,
      verificationToken: hashedToken,
      tokenExpiration: {
        gt: new Date(),
      },
    },
  });
  if (!employee) {
    throw new BadRequestError('Invalid or expired token');
  }

  await prisma.employee.update({
    where: {
      email: normalizedEmail,
    },
    data: {
      isVerified: true,
      verificationToken: null,
      tokenExpiration: null,
    },
  });
  const user = createTokenUser(employee);
  attachCookiesToResponse({ res, user });
  res
    .status(StatusCodes.CREATED)
    .json({ message: 'Employee verified successfully.', user });
};

export const verifyUsingWhatsApp = async (req, res) => {
  const { phoneNumber } = req.body;
  if (!phoneNumber) {
    throw new BadRequestError('Phone number is required');
  }

  const employee = await prisma.employee.findFirst({
    where: {
      phoneNumber,
    },
  });
  if (!employee) {
    throw new BadRequestError('Employee not found');
  }

  // Generate a new WhatsApp verification token
  const whatsappVerificationCode = Math.floor(
    100000 + Math.random() * 900000
  ).toString();
  const whatsappTokenExpiration = new Date(Date.now() + 15 * 60 * 1000);

  // Update employee with the new token and expiration
  await prisma.employee.update({
    where: { id: employee.id },
    data: {
      whatsappVerificationToken: whatsappVerificationCode,
      whatsappTokenExpiration,
    },
  });

  // Send WhatsApp message
  const contentSid = process.env.TWILIO_WHATSAPP_SID; // Twilio content SID
  const contentVariables = { 1: whatsappVerificationCode };

  try {
    await sendWhatsAppMessage(
      `whatsapp:${process.env.OWNER_PHONE}`,
      contentSid,
      contentVariables
    );

    res
      .status(StatusCodes.OK)
      .json({ message: 'Verification code sent via WhatsApp Owner Number.' });
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

  // Find the employee with the matching phone number and token
  const employee = await prisma.employee.findFirst({
    where: {
      phoneNumber,
      whatsappVerificationToken: token,
      whatsappTokenExpiration: {
        gt: new Date(), // Ensure token is not expired
      },
    },
  });

  if (!employee) {
    throw new BadRequestError('Invalid or expired token');
  }

  // Update the employee to mark WhatsApp as verified
  await prisma.employee.update({
    where: { id: employee.id },
    data: {
      isVerified: true,
      whatsappVerificationToken: null,
      whatsappTokenExpiration: null,
    },
  });

  res
    .status(StatusCodes.OK)
    .json({ message: 'WhatsApp verification successful' });
};

export const employeeLogin = async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new BadRequestError('Please provide email and password');
  }

  // Check if the email exists
  const employee = await prisma.employee.findUnique({
    where: {
      email: email,
    },
  });
  if (!employee) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  // Comparing password
  const isPasswordCorrect = await bcrypt.compare(password, employee.password);
  if (!isPasswordCorrect) {
    throw new UnauthenticatedError('Invalid Credentials');
  }

  const employeeToken = createTokenUser(employee);
  attachCookiesToResponse({ res, user: employeeToken });
  res.status(StatusCodes.OK).json({ employee: employeeToken });
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
