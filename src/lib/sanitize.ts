import sanitizeHtml from "sanitize-html";

const defaultOptions = {
    allowedTags: ["b", "i", "em", "strong", "p", "br"],
    allowedAttributes: {},
    allowedIframeHostnames: [],
};

export const sanitizeContent = (content: string): string => {
    return sanitizeHtml(content, defaultOptions);
};

export const sanitizeEventDescription = (description: string): string => {
    return sanitizeHtml(description, {
        ...defaultOptions,
        allowedTags: [...defaultOptions.allowedTags, "ul", "ol", "li"],
    });
};

export const sanitizeReviewContent = (content: string): string => {
    return sanitizeHtml(content, defaultOptions);
};

export const validateKaistEmail = (email: string): boolean => {
    const allowedDomain = process.env.ALLOWED_EMAIL_DOMAIN || "@kaist.ac.kr";
    return email.endsWith(allowedDomain);
};

export const sanitizeFileName = (fileName: string): string => {
    // Remove special characters and spaces, keep only alphanumeric, dots, and hyphens
    return fileName.replace(/[^a-zA-Z0-9.-]/g, "_").toLowerCase();
};
