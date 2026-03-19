import { apiGet } from "@/lib/api"

const CMS_PAGES_API_ENDPOINT = "/api/v1/cms-pages"

type CmsPageSeo = {
  title?: string | null
  description?: string | null
} | null

export type CmsPage = {
  id: number
  title: string
  slug: string
  content: string
  content_html: string
  seo?: CmsPageSeo
}

type CmsPageResponse = {
  data: CmsPage
}

export async function getCmsPageBySlug(slug: string): Promise<CmsPage | null> {
  return apiGet<CmsPageResponse>(
    `${CMS_PAGES_API_ENDPOINT}/${encodeURIComponent(slug)}`,
  )
    .then((response) => response.data)
    .catch(() => null)
}
