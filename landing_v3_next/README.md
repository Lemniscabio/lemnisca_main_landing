# Lemnisca main landing

This Next.js app owns the main Lemnisca marketing site, product landing pages,
and customer-specific landing pages. Product apps such as Torch are deployed in
separate repos, so CTA links from this repo are part of each product's analytics
and attribution contract.

## Getting started

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser.

## Product attribution contract

For product landing pages, marketing CTA links must preserve where the visitor
came from before sending them into the product app. Torch currently uses links
like:

```text
https://torch.lemnisca.bio/assess?utm_source=lemnisca_landing&utm_medium=torch_landing_cta&utm_campaign=torch_assessment&cta_location=hero
```

The destination product app reads those query parameters, stores attribution for
the session, and attaches it to PostHog events. The landing side should also
register its own PostHog context:

```ts
posthog.register({
  surface: 'marketing',
  app: 'lemnisca_landing',
});
```

When adding another Lemnisca product, update both sides together:

- In this repo, add product CTA URLs with `utm_source`, `utm_medium`,
  `utm_campaign`, and a stable `cta_location`.
- In the product repo, ingest those parameters and register product context such
  as `product`, `surface: 'product'`, and the product app name.
- Keep PostHog in the same project when the goal is to follow users from
  marketing pages into the product experience.

If either the landing CTA URLs or the product attribution code changes, treat it
as an interdependent release and update the corresponding README in both repos.
