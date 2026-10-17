import type { Metadata } from "next";
import { draftMode } from "next/headers";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { cachedSanity, getDynamicFetchOptions, type DynamicFetchOptions } from "@/sanity/live";
import { PAGE_PATHS_QUERY, PAGE_QUERY, SETTINGS_QUERY } from "@/sanity/queries";
import { urlFor } from "@/sanity/image";
import { isIndexable } from "@/lib/site";
import { Sections } from "@/components/Sections";
import { DisclaimerGate } from "@/components/DisclaimerGate";
import type { Disclaimer, SanityImage, Section, SiteSettings } from "@/sanity/types";

type Props = { params: Promise<{ path?: string[] }> };

type PageData = {
  _id: string;
  title?: string;
  path: string;
  seo?: { title?: string; description?: string; noindex?: boolean; ogImage?: SanityImage };
  gate?: Disclaimer | null;
  sections?: Section[];
} | null;

const toPath = (segments?: string[]) => "/" + (segments ?? []).join("/");

export async function generateStaticParams() {
  const { data } = await cachedSanity({ query: PAGE_PATHS_QUERY, perspective: "published", stega: false });
  const params = ((data ?? []) as { path: string }[]).map((p) => ({
    path: p.path === "/" ? [] : p.path.slice(1).split("/"),
  }));
  // Cache Components requires at least one param; the home page always exists.
  return params.length ? params : [{ path: [] }];
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const { path } = await props.params;
  const { data } = await cachedSanity({
    query: PAGE_QUERY,
    params: { path: toPath(path) },
    perspective: "published",
    stega: false,
  });
  const page = data as PageData;
  if (!page) return {};
  const og = page.seo?.ogImage?.asset ? urlFor(page.seo.ogImage).width(1200).height(630).url() : undefined;
  return {
    title: page.seo?.title ?? page.title,
    description: page.seo?.description ?? undefined,
    alternates: { canonical: page.path },
    robots: !isIndexable
      ? { index: false, follow: false }
      : page.seo?.noindex
        ? { index: false, follow: true }
        : undefined,
    openGraph: {
      title: page.seo?.title ?? page.title ?? undefined,
      description: page.seo?.description ?? undefined,
      url: page.path,
      images: og ? [og] : undefined,
    },
  };
}

export default async function Page(props: Props) {
  const { isEnabled: isDraftMode } = await draftMode();
  if (isDraftMode) {
    return (
      <Suspense fallback={null}>
        <DraftPage params={props.params} />
      </Suspense>
    );
  }
  const { path } = await props.params;
  return <CachedPage path={toPath(path)} perspective="published" stega={false} />;
}

async function DraftPage({ params }: Pick<Props, "params">) {
  const { path } = await params;
  const opts = await getDynamicFetchOptions();
  return <CachedPage path={toPath(path)} {...opts} />;
}

async function CachedPage({ path, perspective, variant, stega }: { path: string } & DynamicFetchOptions) {
  const [{ data: pageData }, { data: settingsData }] = await Promise.all([
    cachedSanity({ query: PAGE_QUERY, params: { path }, perspective, variant, stega }),
    cachedSanity({ query: SETTINGS_QUERY, perspective: "published", stega: false }),
  ]);
  const page = pageData as PageData;
  const settings = settingsData as SiteSettings;
  if (!page) notFound();
  return (
    <>
      {page.gate && <DisclaimerGate disclaimer={page.gate} />}
      <Sections sections={page.sections ?? []} settings={settings} />
    </>
  );
}
