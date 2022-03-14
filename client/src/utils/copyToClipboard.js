import { toast } from "react-toastify";

export const copyToClipboard = (str) => {
  if (navigator && navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(str);
    return toast.success("Copied to clipboard");
  }
  return Promise.reject("The Clipboard API is not available.");
};
