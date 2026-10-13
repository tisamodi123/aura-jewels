import type { Metadata } from "next";
import HomeComponents from "@/components/home/HomePage";
import { ENABLE_SCRIPT, ENDPOINTS } from "@/lib/Api_Url";
import callApi from "@/lib/commonApi";

export default async function Home() {
    const res = await callApi(ENDPOINTS?.HOME?.GET_HOME_SCREEN_DATA, "GET");
    return (
        <>
            {/* {
                ENABLE_SCRIPT && (
                    <meta name="google-site-verification" content="yj3wrelQ-3_88Agki-l746sOH_FEV_zSNKtYjuIVQak" />
                )
            } */}
            {/* <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify(breadcrumbSchema, null, 2),
                }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteSchema) }}
            />

            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusinessSchema) }}
            /> */}
            <HomeComponents homeOrder={res?.data?.order} homeSections={res?.data?.sections} />
        </>
    );
}
