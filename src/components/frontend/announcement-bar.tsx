import homePageData from "@/data/home-page.json"

export function AnnouncementBar() {
  const announcementData = homePageData.announcementBar

  return (
    <div className="w-full bg-primary text-primary-foreground">
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex h-8 items-center justify-center text-xs font-medium sm:text-sm">
          {announcementData.message}
        </div>
      </div>
    </div>
  )
}
