interface SendMailType {
    to: string;
    subject: string;
    placeholders?: Record<string, string>;
    html?: string;
}