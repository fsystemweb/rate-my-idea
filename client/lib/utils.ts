import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Copies the provided text to the user's clipboard.
 * This function is designed to be pure, focusing solely on the clipboard interaction.
 * It uses the modern `navigator.clipboard.writeText` API if available,
 * and falls back to a `document.execCommand('copy')` approach for older browsers.
 *
 * Calling components are responsible for providing the exact text to be copied
 * and for managing any visual feedback (e.g., 'Copied!' messages, icon changes)
 * on their specific UI elements.
 *
 * @param text The string to be copied to the clipboard.
 * @returns A Promise that resolves if the text was successfully copied, or rejects with an error if the operation failed.
 */
export async function copyToClipboard(text: string): Promise<void> {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    // Modern API
    try {
      await navigator.clipboard.writeText(text);
      return; // Successfully copied
    } catch (error) {
      console.warn("Failed to copy using navigator.clipboard.writeText. Attempting fallback.", error);
      // Fallback if modern API fails (e.g., due to permissions or a sandbox environment)
      return fallbackCopyToClipboard(text);
    }
  } else {
    // Fallback for older browsers or environments without navigator.clipboard
    return fallbackCopyToClipboard(text);
  }
}

/**
 * Fallback mechanism for copying text to the clipboard using `document.execCommand`.
 * This internal function creates a temporary textarea element, selects its content,
 * and executes the 'copy' command.
 *
 * @param text The string to be copied.
 * @returns A Promise that resolves if successful, or rejects with an error.
 */
function fallbackCopyToClipboard(text: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    // Make the textarea invisible and outside the viewport
    textarea.style.position = "fixed";
    textarea.style.left = "-9999px";
    textarea.style.top = "-9999px";
    textarea.setAttribute("readonly", ""); // Prevent user input
    textarea.setAttribute("aria-hidden", "true"); // Hide from screen readers
    document.body.appendChild(textarea);

    try {
      textarea.focus();
      textarea.select();
      // For mobile devices, ensure selection range is set
      textarea.setSelectionRange(0, textarea.value.length);

      const successful = document.execCommand("copy");
      document.body.removeChild(textarea);

      if (successful) {
        resolve();
      } else {
        const errorMsg = "Failed to copy using document.execCommand('copy'). Command returned false.";
        console.error(errorMsg);
        reject(new Error(errorMsg));
      }
    } catch (err) {
      // Ensure cleanup even if an error occurs during execCommand
      if (document.body.contains(textarea)) {
        document.body.removeChild(textarea);
      }
      const errorMsg = `Error during document.execCommand('copy') fallback: ${err instanceof Error ? err.message : String(err)}`;
      console.error(errorMsg);
      reject(new Error(errorMsg));
    }
  });
}