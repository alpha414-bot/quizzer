import { AuthError } from "firebase/auth";
import { Timestamp } from "firebase/firestore";
import { StorageError } from "firebase/storage";
import _ from "lodash";

export const NumberPattern = /^[0-9]*$/;
export const PasswordPattern = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).+$/;
export const EmailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const getErrorMessageViaStatus = (error: RouteErrorInterface) => {
  switch (error.status) {
    case 404:
      return {
        status: 404,
        shortMessage: "404 Not Found | We can't find that page!",
        longMessage:
          "Sorry, the page you're looking for does not exist anymore, or we've moved it somewhere else. Try selecting a link from the navigation at the top/bottom of the page. ",
      };
    default:
      return {
        ...error,
        shortMessage: error.statusText || "Error Encountered",
        longMessage:
          error.data ||
          error.stack ||
          "There was a problem with this page. Try refreshing the page, if issue persists, contact administrator.",
      };
  }
};

export const isURL = (url: string): boolean => {
  const pattern = new RegExp("^(?:[a-z]+:)?//", "i");
  return pattern.test(url);
};

// prioritize tailwindcss
export const tw = (className?: string) => {
  let ClassName = _.split(className, " ");
  ClassName = _.map(ClassName, (item) => `!${item}`);
  return " "+_.join(ClassName, " ")+" ";
};

// firebase date converter to understandable momentjs date
export const fm = (date?: Timestamp) => {
  return date && new Date(date?.seconds * 1000);
};

// shorten string text to some characters and add ...
export const shorten = (text: string, maxLines: number) => {
  const lines = text.split("\n");
  const maxTextLength = maxLines * 20; // Assuming an average line length of 40 characters
  let shortenedText = lines[0]; // Get the first line
  if (shortenedText.length > maxTextLength) {
    shortenedText = shortenedText.substring(0, maxTextLength) + "...";
  }
  return _.trim(shortenedText);
};

export const AuthErrorFilter = (
  error: AuthError,
  operation: "forgot-password" | "sign-in" = "sign-in"
) => {
  switch (true) {
    case error.code == "auth/invalid-email":
      return "Email is an invalid format. Please try another.";
    case error.code == "auth/user-disabled":
      return "Your account has been disabled and unable login.";
    case error.code == "auth/multi-factor-auth-required":
      return "MF Authentication is needed. Please wait while you are redirected.";
    case (error as unknown) == "Problem sign in" ||
      error.code == "auth/user-not-found":
      return operation == "sign-in"
        ? "User does not exists in our records. Please crosscheck your credentials."
        : "No registered user with this email.";
    case error.code == "auth/wrong-password" ||
      error.code == "auth/invalid-credential":
      return "The provided credentials are incorrect, Retry with a correct credential or reset your password.";
    case error.code == "auth/email-already-in-use":
      return "The email address is already in use. Please try another.";
    case (error as unknown) == "auth/operation-not-allowed" ||
      error.code == "auth/operation-not-allowed":
      return "Failed to sign in due to restriction. Pleast try again later or contact administrator.";
    case error.code == "auth/weak-password":
      return "Password is too weak to complete sign up. Try again with a stronger password.";
    default:
      return "There was an issue while handling the operation. Please try again later. If issue persist, contact administrator.";
  }
};
export const StorageErrorFilter = (error: StorageError) => {
  switch (true) {
    case error.code == "storage/object-not-found":
      return "No file exists at the specified path.";
    case error.code == "storage/bucket-not-found	":
      return "No such bucket exists in cloud storage ";
    case error.code == "storage/unauthenticated	":
      return "User must be authenticated to be authorize to resources in the Cloud Storage";
    case error.code == "storage/retry-limit-exceeded":
      return "The maximum time limit on an operation (upload, download, delete, etc.) has been excceded. Try uploading again.";
    case error.code == "storage/invalid-argument":
      return "The argument passed to put() must be `File`, `Blob`, or `UInt8` Array. The argument passed to putString() must be a raw, `Base64`, or `Base64URL` string.";
    default:
      return "There was an issue while handling the operation. Please try again later. If issue persist, contact administrator. ";
  }
};

export const getFileExtension = (filename: string) => {
  const parts = _.split(filename, ".");
  return parts.length > 1 ? parts.pop() : "";
};

export const removeFileExtension = (filename: string) => {
  const parts = _.split(filename, ".");
  if (parts.length > 1) {
    parts.pop();
    return _.join(parts, ".");
  }
  return filename;
};

// Function to generate a random string of specified length
const generateRandomString = (length: number) => {
  const characters =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  return _.times(length, () =>
    characters.charAt(_.random(0, characters.length - 1))
  ).join("");
};

// Function to generate a random file name with a specific extension
export const generateRandomFileName = (length = 10) => {
  const randomString = generateRandomString(length);
  return `${randomString}`;
};

// Function to generate a slug
export const createSlug = (str: any) => {
  return _.chain(str)
    .deburr() // Remove accents and convert to basic Latin letters
    .toLower() // Convert to lowercase
    .trim() // Trim leading and trailing whitespace
    .replace(/[^a-z0-9\s-]/g, "") // Remove all non-alphanumeric characters except spaces and hyphens
    .replace(/\s+/g, "-") // Replace spaces with hyphens
    .replace(/-+/g, "-") // Replace multiple hyphens with a single hyphen
    .value(); // Get the final string value
};

// MIME_TYPE
type MimeType = {
  [key: string]: ExtensionType[];
};
export const MIME_TYPE: MimeType = {
  "image/*": [
    ".avif",
    ".bmp",
    ".gif",
    ".ico",
    ".jpeg",
    ".jpg",
    ".png",
    ".svg",
    ".webp",
  ],
  "audio/*": [".aac", ".flac", ".mp3", ".ogg", ".wav"],
  "video/*": [".avi", ".mp4", ".mpeg", ".ogg", ".webm", ".mkv"],
  "document/*": [
    // '.csv',
    ".doc",
    ".docx",
    // '.html',
    ".pdf",
    ".ppt",
    ".pptx",
    ".txt",
    ".xls",
    ".xlsx",
    // ".plain",
    // ".txt"
  ],
};

export const js = (data: any, stringify_only: boolean = false) => {
  let Data = JSON.stringify(data);
  if (stringify_only) {
    return Data;
  }
  return JSON.parse(Data);
};
