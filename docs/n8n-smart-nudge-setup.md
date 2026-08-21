# Smart Nudge — n8n workflow

Replaces the old single-template "Send Reminder" email with a real workflow-automation
integration: the HR dashboard's Send Reminder button (`src/app/hr/actions.ts`) fires a
webhook into n8n, which drafts a short nudge message with AI and emails it to the clinic's
configured Ops Lead instead of the employee.

## Import

1. In n8n: **Workflows → Import from File** → select `docs/n8n-smart-nudge-workflow.json`.
2. Open the **Nudge Trigger** (Webhook) node → copy its Production URL.
3. Under **Webhook → Authentication → Header Auth**, create a credential named
   `Clinic Webhook Secret` with header name `X-Webhook-Secret` and any secret value you choose.
4. Attach your own OpenAI credential to the **Draft Nudge** node, and your own SMTP
   credential to the **Notify Ops** node.
5. Activate the workflow.

## App configuration

Set these in the app's environment (e.g. Vercel project settings):

- `N8N_NUDGE_WEBHOOK_URL` — the webhook URL from step 2.
- `N8N_WEBHOOK_SECRET` — the same value used for the Header Auth credential in step 3.

Set the Ops Lead's name/email in-app under **HR → Settings** — that's what the workflow
addresses the nudge to (`OrgSettings.opsLeadName` / `opsLeadEmail`).

If `N8N_NUDGE_WEBHOOK_URL` isn't set, `sendReminder()` falls back to sending the original
static reminder email directly — the button always works, with or without n8n configured.
