import Link from "next/link";

const REDIRECT_SOURCES = new Set<string>(JSON.parse(process.env.NEXT_PUBLIC_REDIRECT_SOURCES || "[]"));

/** Internal paths use next/link; external links open safely in a new tab. */
export function SmartLink({
  href,
  children,
  className,
  ...rest
}: { href: string; children: React.ReactNode; className?: string } & Omit<
  React.AnchorHTMLAttributes<HTMLAnchorElement>,
  "href"
>) {
  if (href.startsWith("/") && !href.startsWith("//")) {
    return (
      <Link href={href} className={className} prefetch={REDIRECT_SOURCES.has(href) ? false : undefined} {...rest}>
        {children}
      </Link>
    );
  }
  const external = /^https?:\/\//.test(href);
  return (
    <a
      href={href}
      className={className}
      {...(external ? { target: "_blank", rel: "noopener noreferrer" } : {})}
      {...rest}
    >
      {children}
      {external && <span className="sr-only"> (opens in a new tab)</span>}
    </a>
  );
}
