export interface TemplateExecutionContext {
    // ---- Routing / identification ----
    applicationId: string;
    templateId: string;

    // ---- Business data ----
    businessData: Record<string, any>; // données injectées dans le template

    // ---- Destination ----
    to: string[]; // destinataires (emails, phones, tokens…)
    cc?: string[];
    bcc?: string[];
    subject?: string; // override si besoin
    bodyOverride?: string; // override si besoin (email, sms…)

    // ---- Meta control ----
    meta?: {
        locale?: string; // choix de langue du template
        correlationId?: string; // pour tracer un flot complet
        tags?: string[];
        createdAt?: string; // ISO8601 (ajout automatique à l’entrée queue)
    };

    // ---- Tracking / observability ----
    tracking?: {
        messageId?: string; // id unique assigné par Messenger
    };
}
