"use client";

import { use } from "react";
import { notFound } from "next/navigation";
import { HOME_SECTION_KEYS, HOME_SECTION_LABELS } from "@/lib/Constant";
import HeroEditor from "../_editors/HeroEditor";
import ChaptersOfLightEditor from "../_editors/ChaptersOfLightEditor";
import SignatureShowcaseEditor from "../_editors/SignatureShowcaseEditor";
import TrendingBrillianceEditor from "../_editors/TrendingBrillianceEditor";
import CollectionsOfNoteEditor from "../_editors/CollectionsOfNoteEditor";
import BespokeExperienceEditor from "../_editors/BespokeExperienceEditor";
import ShopByBudgetEditor from "../_editors/ShopByBudgetEditor";
import ShopBySegmentEditor from "../_editors/ShopBySegmentEditor";
import GiftsOccasionEditor from "../_editors/GiftsOccasionEditor";
import InstagramSocialEditor from "../_editors/InstagramSocialEditor";
import DiamondShapesEditor from "../_editors/DiamondShapesEditor";
import CustomerReflectionsEditor from "../_editors/CustomerReflectionsEditor";
import PreciousForeverEditor from "../_editors/PreciousForeverEditor";
import FromTheBlogEditor from "../_editors/FromTheBlogEditor";
import EndlessMemoriesEditor from "../_editors/EndlessMemoriesEditor";

const EDITORS = {
    [HOME_SECTION_KEYS.HERO_SLIDER]: HeroEditor,
    [HOME_SECTION_KEYS.CHAPTERS_OF_LIGHT]: ChaptersOfLightEditor,
    [HOME_SECTION_KEYS.SIGNATURE_SHOWCASE]: SignatureShowcaseEditor,
    [HOME_SECTION_KEYS.TRENDING_BRILLIANCE]: TrendingBrillianceEditor,
    [HOME_SECTION_KEYS.COLLECTIONS_OF_NOTE]: CollectionsOfNoteEditor,
    [HOME_SECTION_KEYS.BESPOKE_EXPERIENCE]: BespokeExperienceEditor,
    [HOME_SECTION_KEYS.SHOP_BY_BUDGET]: ShopByBudgetEditor,
    [HOME_SECTION_KEYS.SHOP_BY_SEGMENT]: ShopBySegmentEditor,
    [HOME_SECTION_KEYS.GIFTS_OCCASION]: GiftsOccasionEditor,
    [HOME_SECTION_KEYS.INSTAGRAM_SOCIAL]: InstagramSocialEditor,
    [HOME_SECTION_KEYS.DIAMOND_SHAPES]: DiamondShapesEditor,
    [HOME_SECTION_KEYS.CUSTOMER_REFLECTIONS]: CustomerReflectionsEditor,
    [HOME_SECTION_KEYS.PRECIOUS_FOREVER]: PreciousForeverEditor,
    [HOME_SECTION_KEYS.FROM_THE_BLOG]: FromTheBlogEditor,
    [HOME_SECTION_KEYS.ENDLESS_MEMORIES]: EndlessMemoriesEditor,
};

export default function HomeSectionEditorPage({ params }) {
    const { key } = use(params);
    const Editor = EDITORS[key];
    if (!Editor) {
        notFound();
    }
    return <Editor sectionKey={key} title={HOME_SECTION_LABELS[key] || key} />;
}
