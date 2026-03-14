export type HelpArticleSection = {
  id: string;
  title: string;
  paragraphs: string[];
  callout?: {
    type: "note" | "warning" | "tip";
    title: string;
    content: string;
  };
  codeBlock?: {
    language: string;
    code: string;
  };
};

export type HelpArticle = {
  slug: string;
  title: string;
  description: string;
  category: "getting-started" | "integrations" | "security-privacy" | "billing";
  sections: HelpArticleSection[];
  relatedSlugs: string[];
};

export type HelpCategory = {
  slug: HelpArticle["category"];
  icon: string;
  title: string;
  description: string;
};

export const helpCategories: HelpCategory[] = [
  {
    slug: "getting-started",
    icon: "rocket",
    title: "Getting Started",
    description: "Everything you need to set up your account.",
  },
  {
    slug: "integrations",
    icon: "link",
    title: "Integrations",
    description: "Connect with Shopify, Slack, or Zapier.",
  },
  {
    slug: "security-privacy",
    icon: "shield",
    title: "Security & Privacy",
    description: "GDPR compliance and account safety.",
  },
  {
    slug: "billing",
    icon: "wallet",
    title: "Billing",
    description: "Invoices, refunds, and subscription details.",
  },
];

export const helpArticles: HelpArticle[] = [
  {
    slug: "setup-api-access",
    title: "How to Setup API Access",
    description: "Generate your first API token and call your first endpoint securely.",
    category: "getting-started",
    relatedSlugs: ["webhook-quickstart", "manage-api-keys", "billing-faq"],
    sections: [
      {
        id: "generate-token",
        title: "Generate Your API Token",
        paragraphs: [
          "Open your profile settings and create a personal API token with the minimum scope required.",
          "Store the token in a secure secret manager and never commit it to source control.",
        ],
        callout: {
          type: "warning",
          title: "Security Warning",
          content: "API tokens are sensitive credentials. Rotate tokens immediately if exposed.",
        },
      },
      {
        id: "first-request",
        title: "Make Your First Request",
        paragraphs: [
          "Use your token as a Bearer token in the Authorization header.",
          "Start with a read-only endpoint to verify your auth and network setup.",
        ],
        codeBlock: {
          language: "bash",
          code: "curl -X GET https://sass-starter.test/api/v1/plans \\\n+  -H \"Accept: application/json\" \\\n+  -H \"Authorization: Bearer YOUR_TOKEN\"",
        },
      },
      {
        id: "troubleshooting",
        title: "Troubleshooting Common Errors",
        paragraphs: [
          "If you receive 401, verify token validity and environment base URL.",
          "If you receive 429, reduce request burst and apply retry with backoff.",
        ],
        callout: {
          type: "tip",
          title: "Pro Tip",
          content: "Log request IDs from responses so support can quickly trace issues.",
        },
      },
    ],
  },
  {
    slug: "webhook-quickstart",
    title: "Webhook Quickstart",
    description: "Receive real-time events for payments and lifecycle changes.",
    category: "integrations",
    relatedSlugs: ["setup-api-access", "manage-api-keys", "refund-policy"],
    sections: [
      {
        id: "create-endpoint",
        title: "Create a Public Endpoint",
        paragraphs: [
          "Your webhook endpoint must be publicly reachable via HTTPS.",
          "Return a 2xx response quickly, then process asynchronously.",
        ],
      },
      {
        id: "verify-signature",
        title: "Verify Event Signatures",
        paragraphs: [
          "Always verify signatures before trusting webhook payloads.",
          "Reject unsigned or malformed payloads with a non-2xx response.",
        ],
        codeBlock: {
          language: "json",
          code: "{\n+  \"event\": \"checkout.completed\",\n+  \"order_public_id\": \"01JABC...\",\n+  \"provider_reference\": \"fake_checkout_abc123\"\n+}",
        },
      },
      {
        id: "retry-behavior",
        title: "Understand Retry Behavior",
        paragraphs: [
          "Webhook providers retry failed deliveries. Ensure idempotency by storing event IDs.",
          "Avoid duplicate side effects by checking if an event has already been processed.",
        ],
      },
    ],
  },
  {
    slug: "manage-api-keys",
    title: "Manage API Keys and Rotation",
    description: "Best practices for key scopes, expiration, and rotation policies.",
    category: "security-privacy",
    relatedSlugs: ["setup-api-access", "webhook-quickstart", "billing-faq"],
    sections: [
      {
        id: "least-privilege",
        title: "Use Least Privilege",
        paragraphs: [
          "Issue keys with minimal scopes for each service.",
          "Separate keys by environment to prevent accidental cross-environment access.",
        ],
      },
      {
        id: "rotation-policy",
        title: "Apply a Rotation Policy",
        paragraphs: [
          "Rotate keys every 60-90 days and invalidate old keys immediately.",
          "Use dual-key deployment windows to avoid service disruption.",
        ],
        callout: {
          type: "note",
          title: "Note",
          content: "Document ownership and expiry dates for every active key.",
        },
      },
    ],
  },
  {
    slug: "billing-faq",
    title: "Billing FAQ",
    description: "Answers to plan pricing, invoice access, and payment timing.",
    category: "billing",
    relatedSlugs: ["refund-policy", "setup-api-access", "webhook-quickstart"],
    sections: [
      {
        id: "invoice-timing",
        title: "When Are Invoices Issued?",
        paragraphs: [
          "Invoices are generated after successful payment capture.",
          "You can find invoice metadata in your order history.",
        ],
      },
      {
        id: "plan-change",
        title: "How Plan Changes Are Prorated",
        paragraphs: [
          "Mid-cycle upgrades can include prorated adjustments based on remaining time.",
          "Downgrade behavior depends on your active billing policy.",
        ],
      },
    ],
  },
  {
    slug: "refund-policy",
    title: "Refund Policy",
    description: "Review refund windows and how to request a refund.",
    category: "billing",
    relatedSlugs: ["billing-faq", "webhook-quickstart", "setup-api-access"],
    sections: [
      {
        id: "eligibility",
        title: "Refund Eligibility",
        paragraphs: [
          "Refund eligibility depends on your plan and purchase date.",
          "Approved refunds are returned to the original payment method.",
        ],
      },
      {
        id: "request-process",
        title: "Request Process",
        paragraphs: [
          "Open a support ticket with order ID and reason for refund.",
          "Our team reviews each request and responds with the decision timeline.",
        ],
        callout: {
          type: "tip",
          title: "Pro Tip",
          content: "Include screenshots or error logs to accelerate review.",
        },
      },
    ],
  },
];

export const popularSearches = ["Installation", "Webhooks", "Refund Policy", "API", "Billing"];
