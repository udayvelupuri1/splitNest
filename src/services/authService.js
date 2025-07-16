import { 
  RecaptchaVerifier, 
  signInWithPhoneNumber
} from 'firebase/auth';
import { auth } from '../firebase/config';
import { createUser } from './userService';

export const setupRecaptcha = (containerId) => {
  return new RecaptchaVerifier(auth, containerId, {
    size: 'invisible',
    callback: () => {
      // reCAPTCHA solved
    }
  });
};

export const sendOTP = async (phoneNumber, recaptchaVerifier) => {
  return await signInWithPhoneNumber(auth, phoneNumber, recaptchaVerifier);
};

export const verifyOTP = async (confirmationResult, otp, mobile, name) => {
  const result = await confirmationResult.confirm(otp);
  if (result.user) {
    if (name) {
      // Only create user if name is provided (signup)
      await createUser(result.user.uid, mobile, name);
    }
    // For signin, user already exists in Firestore
  }
};

export const logout = async () => {
  await auth.signOut();
};