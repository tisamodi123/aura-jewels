"use client";

import React, { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { toast } from "sonner";
import { ShieldCheck, ShieldAlert, Globe, Search, Loader2 } from "lucide-react";

export default function SeoSettingsPage() {
  const token = getToken();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [searchEngineVisibility, setSearchEngineVisibility] = useState(true);
  const [metaTitle, setMetaTitle] = useState("");
  const [metaDescription, setMetaDescription] = useState("");

  const fetchSeoSettings = async () => {
    setLoading(true);
    try {
      // Try GET SEO_SETTING or SEO_VISIBILITY endpoint
      let res = await callApi(API_URL.SEO_SETTING, "GET", null, token);
      if (res?.errorCode !== 200 && !res?.success) {
        res = await callApi(API_URL.SEO_VISIBILITY, "GET", null, token);
      }

      if (res?.errorCode === 200 || res?.success || res?.data) {
        const data = res?.data || res;
        const isAllowed =
          data?.search_engine_visibility !== undefined
            ? Boolean(data.search_engine_visibility)
            : data?.allow_indexing !== undefined
              ? Boolean(data.allow_indexing)
              : true;

        setSearchEngineVisibility(isAllowed);
        if (data?.meta_title !== undefined) setMetaTitle(data.meta_title || "");
        if (data?.meta_description !== undefined) setMetaDescription(data.meta_description || "");
      }
    } catch (error) {
      console.error("Failed to load SEO settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSeoSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSaveSettings = async () => {
    setSaving(true);
    try {
      const payload = {
        search_engine_visibility: searchEngineVisibility,
        meta_title: metaTitle,
        meta_description: metaDescription,
      };

      let res = await callApi(API_URL.SEO_SETTING, "PUT", payload, token);
      if (res?.errorCode !== 200 && !res?.success) {
        // Fallback to POST or SEO_VISIBILITY endpoint if PUT returns non-200
        res = await callApi(API_URL.SEO_SETTING, "POST", payload, token);
      }

      if (res?.errorCode === 200 || res?.success) {
        toast.success(res?.message || "SEO settings updated successfully");
        fetchSeoSettings();
      } else {
        toast.error(res?.message || "Failed to update SEO settings");
      }
    } catch (error) {
      console.error("Failed to save SEO settings:", error);
      toast.error("An error occurred while saving SEO settings");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-zinc-500">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        <span className="text-sm">Loading SEO configuration…</span>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-10">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-zinc-900 flex items-center gap-2">
            <Search className="w-5 h-5 text-blue-600" />
            SEO & Search Engine Visibility
          </h1>
          <p className="text-xs text-zinc-500 mt-1">
            Configure search engine crawling controls and global metadata for the platform.
          </p>
        </div>
        <Button
          onClick={handleSaveSettings}
          disabled={saving}
          className="bg-black hover:bg-zinc-800 text-white px-5 py-2 text-xs"
        >
          {saving ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin mr-2" />
              Saving…
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </div>

      {/* Main Settings Card */}
      <Card className="border border-zinc-200 shadow-sm bg-white">
        <CardHeader className="border-b border-zinc-100 pb-4">
          <CardTitle className="text-base font-semibold text-zinc-900">
            Search Engine Visibility
          </CardTitle>
          <CardDescription className="text-xs text-zinc-500">
            Control whether search engines can crawl, index, and follow links on this website.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6 space-y-6">
          <div className="flex items-center justify-between py-2 border-b border-zinc-100 pb-5">
            <div className="space-y-1 max-w-xl">
              <Label htmlFor="search-engine-visibility" className="text-sm font-semibold text-zinc-900">
                Allow Search Engine Indexing
              </Label>
              <p className="text-xs text-zinc-500 leading-relaxed">
                {searchEngineVisibility
                  ? "Website is currently indexable by search engines (Production Mode)."
                  : "Search engines are blocked from indexing this site (Staging / QA Mode)."}
              </p>
            </div>
            <Switch
              id="search-engine-visibility"
              checked={searchEngineVisibility}
              onCheckedChange={(val) => setSearchEngineVisibility(val)}
            />
          </div>

          {/* Dynamic Status Banner */}
          <div
            className={`p-4 rounded-lg border text-xs transition-colors ${searchEngineVisibility
              ? "bg-emerald-50/60 border-emerald-200 text-emerald-900"
              : "bg-amber-50/60 border-amber-200 text-amber-900"
              }`}
          >
            <div className="flex items-start gap-3">
              {searchEngineVisibility ? (
                <ShieldCheck className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" />
              ) : (
                <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              )}
              <div className="space-y-1">
                <p className="font-semibold text-sm">
                  {searchEngineVisibility
                    ? "Status: Indexing Enabled (Production)"
                    : "Status: Indexing Disabled (noindex, nofollow)"}
                </p>
                <p className="leading-relaxed opacity-90">
                  {searchEngineVisibility
                    ? "Search engines (Google, Bing, Yahoo) are permitted to crawl pages, generate sitemaps, and rank product catalog content."
                    : "Enforcing <meta name=\"robots\" content=\"noindex, nofollow\" />, X-Robots-Tag HTTP headers, and robots.txt disallow rules across all pages."}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
