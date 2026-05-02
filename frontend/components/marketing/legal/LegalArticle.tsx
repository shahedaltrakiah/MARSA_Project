import { cn } from "@/components/utils"

/** Renders trusted static legal HTML with readable typography (no @tailwindcss/typography). */
export function LegalArticle({
  html,
  className,
  dir = "ltr",
  lang = "en",
}: {
  html: string
  className?: string
  dir?: "ltr" | "rtl"
  lang?: string
}) {
  return (
    <div
      dir={dir}
      lang={lang}
      className={cn(
        "legal-document mx-auto max-w-[62ch] space-y-0 text-[13px] leading-relaxed text-muted-foreground sm:text-[14px] sm:leading-[1.65]",
        dir === "rtl" && "text-right [&_ul]:ps-0 [&_ul]:pe-5",
        "[&_h2]:mt-8 [&_h2]:scroll-mt-24 [&_h2]:border-b [&_h2]:border-border/45 [&_h2]:pb-2 [&_h2]:font-[var(--font-heading)] [&_h2]:text-balance [&_h2]:text-base [&_h2]:font-semibold [&_h2]:tracking-tight [&_h2]:text-foreground sm:[&_h2]:text-lg [&_h2]:first:mt-0",
        "[&_h3]:mt-5 [&_h3]:mb-0.5 [&_h3]:text-sm [&_h3]:font-semibold [&_h3]:text-foreground sm:[&_h3]:text-[15px]",
        "[&_p]:my-3 [&_ul]:my-4 [&_ul]:list-disc [&_ul]:ps-5 [&_li]:my-1 [&_li]:text-[13px] sm:[&_li]:text-[14px]",
        "[&>ul]:rounded-lg [&>ul]:border [&>ul]:border-border/50 [&>ul]:bg-muted/20 [&>ul]:px-3.5 [&>ul]:py-2.5 dark:[&>ul]:bg-muted/15",
        "[&_a]:break-all [&_a]:font-medium [&_a]:text-secondary [&_a]:underline [&_a]:underline-offset-2 hover:[&_a]:text-secondary",
        "[&_strong]:font-semibold [&_strong]:text-foreground",
        className
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  )
}
