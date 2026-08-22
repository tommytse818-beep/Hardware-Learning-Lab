# Email Setup Notes

## Why a transactional email service is used

The application should not store Tommy’s Gmail password or attempt to sign in to a personal mailbox. Instead, a server-side transactional email provider sends notifications **to** the private Gmail inbox.

## Environment variables

Put these in `.env.local` for local development and in the deployment provider’s protected environment settings for production:

```env
RESEND_API_KEY=YOUR_SERVER_ONLY_API_KEY
EMAIL_FROM=Hardware Learning Lab <enquiries@YOUR_VERIFIED_DOMAIN>
ENQUIRY_NOTIFICATION_EMAIL=tommytse818@gmail.com
```

Never prefix these values with `NEXT_PUBLIC_`.

## Quote notifications

A successful quote submission is stored first. The email notification is a convenience, not the only record. If email delivery fails, the enquiry remains in the database and is marked accordingly.

## Bank transfer and programme documents

Do not automatically send banking information from an unauthenticated form. Verify the school/contact first, then send the quotation, terms, programme documents and payment instructions manually from the approved business process.

## Catch-up reminders

Teacher reminder emails:

- are generated on the server;
- are limited to students in a teacher’s assigned cohort;
- use a neutral catch-up template;
- do not disclose rank in the email;
- are logged and rate-limited;
- are teacher-triggered in V1, not unattended scheduled mail.
