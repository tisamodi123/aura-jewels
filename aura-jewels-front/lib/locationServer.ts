import { headers, cookies } from "next/headers";
import { DEFAULT_COUNTRY } from "./Api_Url";

export type SearchParams = Promise<{
  country?: string;
}> | { country?: string } | URLSearchParams;

export async function getCountry(searchParams?: SearchParams): Promise<string | null> {
  const hdrs = await headers();
  const cks = await cookies();
  
  let countryFromParams: string | undefined;
  if (searchParams) {
    const resolvedSp = await searchParams;
    if (resolvedSp instanceof URLSearchParams) {
      countryFromParams = resolvedSp.get("country") || undefined;
    } else if (typeof resolvedSp === "object" && resolvedSp !== null) {
      countryFromParams = (resolvedSp as { country?: string }).country;
    }
  }

  const cookieCountry = cks.get("x-country-code")?.value;

  const detected =
    countryFromParams ??
    hdrs.get("x-vercel-ip-country") ??
    hdrs.get("cf-ipcountry") ??
    hdrs.get("x-country-code") ??
    hdrs.get("fastly-geo-country") ??
    cookieCountry;

  if (!detected || detected === "XX") {
    return (DEFAULT_COUNTRY || "IN").toUpperCase();
  }

  return detected.toUpperCase();
}
