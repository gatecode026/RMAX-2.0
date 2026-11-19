# Email notifications

RMAX sends email through Nodemailer over any SMTP account. Every email is a row in a MongoDB outbox
(`notificationjobs`), sent after the customer's response and retried until it succeeds.

## Events and who gets the email

| Event (trigger) | Admin | Manager | Customer (optional) |
|---|---|---|---|
| New lead — website enquiry (`POST /api/contact-messages`) or manual lead (`POST /api/admin/leads`) | `ADMIN_NOTIFICATION_EMAIL` | assigned manager, else `DEFAULT_MANAGER_NOTIFICATION_EMAIL` | acknowledgement for website enquiries (`ENABLE_CUSTOMER_LEAD_EMAILS`) |
| New quotation request (`POST /api/quote-requests`) | yes | assigned manager, else default manager | acknowledgement (`ENABLE_CUSTOMER_LEAD_EMAILS`) |
| Lead assigned / reassigned (`PATCH /api/admin/leads/:id`, only when the assignee changes) | — | the **new** manager | — |
| Order confirmed (`POST /api/orders`, saved in the confirmed state) | yes | default manager (orders carry no manager) | order confirmation (`ENABLE_CUSTOMER_ORDER_EMAILS`) |

Rules, all enforced on the server:
- Admin and manager get **separate** emails. Same address → one alert (the manager job is stored as `skipped: same_address_as_admin`).
- Assigned manager without a valid email (or inactive) → admin alert still sent; the manager job is stored `skipped` with the reason. Unassigned and no default manager → `skipped: no_default_manager_configured`.
- A quotation request also creates a lead; that submission sends **one** internal alert per recipient (the quotation alert). Independent enquiries each send their own.
- A lead created already assigned notifies that manager once (creation alert); no second "assigned" email.
- Quotations created by hand in the dashboard are not "requests" and send no alert.
- An email never grants dashboard access; the links open the normal sign-in and permission checks.

## Reliability

- **Idempotent**: each job has a unique key (event + record + recipient). Repeating a request, a callback, a retry or the recovery sweep never creates a second job, and a job the provider has `accepted` (or a legacy `sent`) is never sent again.
- **No double processing**: a worker claims a job atomically (`pending → processing` with a lock); two workers cannot get the same job.
- **Retries**: transient failures (timeout, connection, 4xx, auth) retry after 1, 5, 30, 120, 360 minutes, then `failed` after 6 attempts. Permanent failures (5xx, bad recipient) go straight to `failed`.
- **Ambiguous outcomes**: if the connection drops while the message body is being sent, the job becomes `uncertain` and is **not** resent automatically (it may have been delivered). Check the SMTP provider's log; if it was not delivered, set the job back to `pending`. Each email also has a stable `Message-ID`.
- **Failures never affect the customer**: enqueueing is wrapped so an email problem cannot fail a saved lead, quotation or order; errors are logged without addresses or credentials.
- **Transactions**: MongoDB transactions need a replica set (Atlas has one, a local standalone does not), so the business save and the job insert are separate writes. The recovery sweep covers the gap: it scans records from the last 72 hours with no job and enqueues them.
- **Where it runs**: right after the response (Next `after()`), plus the worker below.

### The worker: `GET /api/cron/notifications`
Requires `Authorization: Bearer $CRON_SECRET` (the endpoint is off while `CRON_SECRET` is unset). It releases jobs whose worker died, runs the recovery sweep, and sends everything that is due.

`vercel.json` schedules it **once a day**, because Vercel's Hobby plan only accepts daily crons (a more frequent schedule fails the deployment). Retries are also driven by normal site traffic. For retries every few minutes either upgrade the Vercel plan and change the schedule in `vercel.json`, or have any free external scheduler call the URL every 5 minutes with the `Authorization` header.

## SMTP setup — free option: Brevo

Brevo's free plan includes an SMTP relay with a **300 emails/day** account-wide cap (reported by several sources; check the current limit in your Brevo account). New accounts may wait for approval before sending.

1. Create a free account at brevo.com and finish the account approval.
2. **Senders & IP → Senders**: add the address you will send from (e.g. `alerts@your-domain.com`) and click the confirmation link Brevo emails to it. Adding your domain and the DNS records (SPF/DKIM) improves delivery; Brevo does not allow arbitrary unverified From addresses.
3. **SMTP & API → SMTP**: note the login and create an **SMTP key** (this is `SMTP_PASS`, not your account password).
4. Set the variables (hosting dashboard, or `.env.local` locally):
   ```
   SMTP_HOST=smtp-relay.brevo.com
   SMTP_PORT=587
   SMTP_SECURE=false
   SMTP_USER=<the SMTP login shown by Brevo>
   SMTP_PASS=<the SMTP key>
   MAIL_FROM="RMAX Solutions <alerts@your-domain.com>"   # must be the verified sender
   ADMIN_NOTIFICATION_EMAIL=you@your-domain.com
   APP_URL=https://www.rmaxiot.in
   CRON_SECRET=<long random string>
   ```
5. Run `npm run mail:check` (add `-- you@example.com` to send a test message). It verifies the connection and login **from the machine you run it on**; port 587 (or 465) outbound must be allowed there. Vercel allows outbound 587/465; port 25 is generally blocked.

Other providers work the same way (any SMTP host). Gmail with an app password also works for low volume but its From address is limited to the account.

## Variables
Required: `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS`, `MAIL_FROM`, `ADMIN_NOTIFICATION_EMAIL`, `APP_URL`.
Optional: `DEFAULT_MANAGER_NOTIFICATION_EMAIL`, `MAIL_REPLY_TO`, `ENABLE_CUSTOMER_LEAD_EMAILS`, `ENABLE_CUSTOMER_ORDER_EMAILS`, `CRON_SECRET` (needed for the worker).
While a required variable is missing nothing is sent and nothing is lost: the recovery sweep enqueues recent records once the settings are complete. None of these are `NEXT_PUBLIC_`, so they never reach the browser.

## Inspecting the outbox
Collection `notificationjobs`: `status` (`pending | processing | accepted | failed | skipped | uncertain`; older rows say `sent`, which means the same as `accepted`), `attempts`, `nextAttemptAt`, `lastError` (code only), `skipReason`.

## What "accepted" does and does not mean
`accepted` = the SMTP provider (Brevo) answered `250 … queued`. It is **not** proof the email reached an inbox: Brevo can still block it afterwards (for example an unauthenticated sender), and our outbox cannot see that. Three things are therefore recorded separately:
1. **Local result** — the code path ran and produced the job.
2. **Provider acceptance** — job `status: accepted`, with `acceptedAt` and `providerResponse`.
3. **Inbox receipt** — confirmed by a person in the test inbox (or by a Brevo delivery event if a webhook is added later). Until then, delivery is "unknown", and an accepted job is **not** retried because of that.
