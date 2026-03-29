import { ENV } from "@/config/env";
import { OrganizationJsonLd } from "next-seo";

const ORGANIZATION_LOGO = new URL("/images/logo/logo.png", ENV.APP_BASE_URL).toString();

export default function GlobalStructuredData() {
  return (
    <OrganizationJsonLd
      type="Organization"
      name="MigaProxy"
      url={ENV.APP_BASE_URL}
      logo={ORGANIZATION_LOGO}
      email="support@migaproxy.com"
    />
  );
}
