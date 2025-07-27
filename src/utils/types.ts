interface SendMailType {
    to: string;
    subject: string;
    placeholders?: Record<any, any>;
    html?: string;
}