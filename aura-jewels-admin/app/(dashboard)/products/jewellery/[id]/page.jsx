"use client";

import React, { useCallback, useEffect, useState, useRef } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import * as Yup from "yup";
import { toast } from "sonner";
import { Plus, Trash2, Check, X, ArrowLeft, Star, ChevronDown, ChevronUp } from "lucide-react";

import { API_URL, JEWELLERY_IMAGE_PATH, JEWELLERY_VIDEO_PATH, PREFIX } from "@/lib/APIUrl";
import { getToken } from "@/lib/auth";
import { callApi } from "@/lib/callApi";
import { DIAMOND_TYPES, STATUS_CODE, GEM_TYPES, GENDER_OPTIONS } from "@/lib/Constant";
import { M } from "@/lib/messages";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import QuillEditor from "@/components/textEditor";

import ItemCodePicker from "../_component/ItemCodePicker";

// ---------------------------------------------------------------------------
// Production-ready Jewellery insert/update/view form.
//
// Schema authority is the canonical import controller — every field the
// import sheet writes is editable here under the same backend key. The
// previous 1325-line iteration of this file used a separate metalType +
// metalStamp pair (deprecated), wrong detail-fetch URL, and a tangled
// FIELD_MAP to translate state→payload. This rewrite stores state under
// the canonical names so submit is a straight pass-through.
//
// Sections in render order:
//   1. Identity        — designNumber, itemCode, parentItemCode, title,
//                        slug, gender
//   2. Catalog         — category, subcategory, collections, tags, status
//   3. Metal & Charges — single Metal dropdown, labour & other charge
//                        codes, appxMetalWgt, isEngraving, shipmentDays
//   4. Dimensions      — qty, height, width, length
//   5. Chain (toggle)  — cMetalId, cWgt, cLength
//   6. Diamonds        — Centers + Siders arrays (shape/color/clarity from
//                        Parameter, size/pieces/weight numeric)
//   7. Cross-sell      — similarProducts + combineWith (item-code strings,
//                        ONE list per SKU — not per diamond row)
//   8. Description     — Quill rich text
//   9. Media           — up to 5 product images + 1 video filename
//  10. SEO             — metaTitle, metaKeyword, metaDescription, seoSlug
// ---------------------------------------------------------------------------

const EMPTY_FORM = {
    designNumber: "",
    itemCode: "",
    parentItemCode: "",
    productTitle: "",
    slug: "",
    gender: "",

    categoryId: "",
    subCategoryId: [],
    collectionId: [],
    tags: [],
    status: "available",

    metalId: "",
    labourCode: "",
    otherChargeCode: "",
    appxMetalWgt: "",
    isEngraving: false,
    shipmentDays: "",

    qty: "",
    height: "",
    width: "",
    length: "",

    haveChain: "No",
    cMetalId: "",
    cWgt: "",
    cLength: "",

    similarProducts: [],
    combineWith: [],

    productDesc: "",
    videoUrl: "",

    metaTitle: "",
    metaKeyword: "",
    metaDescription: "",
    seoSlug: "",

    centerStones: [],
    sideStones: [],
};

const emptyStone = (type) => ({
    type,
    stoneType: "DIAMOND",
    gemType: "",
    shape: "",
    color: "",
    clarity: "",
    size: "",
    pieces: "",
    weight: "",
    totalCarat: "",
});

// Validator. Required set matches the import controller's REQUIRED_HEADERS
// (the columns it refuses to import without) — anything optional in the
// sheet is optional in the form.
const schema = Yup.object().shape({
    itemCode: Yup.string().trim().required("Item Code is required"),
    productTitle: Yup.string().trim().required("Product Title is required"),
    categoryId: Yup.string().required("Category is required"),
    metalId: Yup.string().required("Metal is required"),
    appxMetalWgt: Yup.number()
        .typeError("Approx Metal Weight must be a number")
        .min(0, "Must be >= 0")
        .required("Approx Metal Weight is required"),
    qty: Yup.number().typeError("Qty must be a number").min(0, "Must be >= 0").nullable(),
    status: Yup.string().oneOf(["available", "hold"]).required(),
    labourCode: Yup.string().required("Labour Charge is required"),
    gender: Yup.string().required("Gender is required"),
    centerStones: Yup.array().of(
        Yup.object().shape({
            stoneType: Yup.string().required("Stone Type is required"),
            gemType: Yup.string().when("stoneType", {
                is: "COLOR STONE",
                then: () => Yup.string().required("Gem Type is required"),
                otherwise: () => Yup.string().nullable().notRequired()
            }),
            shape: Yup.string().required("Shape is required"),
            color: Yup.string().when("stoneType", {
                is: (val) => val?.toLowerCase() !== "diamond",
                then: () => Yup.string().required("Color is required"),
                otherwise: () => Yup.string().nullable().notRequired()
            }),
            clarity: Yup.string().nullable().notRequired(),
        })
    ),
    sideStones: Yup.array().of(
        Yup.object().shape({
            stoneType: Yup.string().required("Stone Type is required"),
            gemType: Yup.string().when("stoneType", {
                is: "COLOR STONE",
                then: () => Yup.string().required("Gem Type is required"),
                otherwise: () => Yup.string().nullable().notRequired()
            }),
            shape: Yup.string().required("Shape is required"),
            color: Yup.string().when("stoneType", {
                is: (val) => val?.toLowerCase() !== "diamond",
                then: () => Yup.string().required("Color is required"),
                otherwise: () => Yup.string().nullable().notRequired()
            }),
            clarity: Yup.string().nullable().notRequired(),
        })
    ),
});
// const MemoQuill = React.memo(QuillEditor);

const FormContext = React.createContext(null);

const SectionHeader = ({ title, hint, rightContent }) => (
    <div className="bg-[#515151] px-6 py-3 rounded-t-sm flex items-center justify-between">
        <h3 className="text-white uppercase font-bold text-sm tracking-wider">
            {title}
            {hint && <span className="ml-2 text-xs font-normal text-gray-300 normal-case tracking-normal">— {hint}</span>}
        </h3>
        {rightContent && <div className="text-white text-xs font-bold uppercase tracking-wider">{rightContent}</div>}
    </div>
);

const Section = ({ title, hint, rightContent, children }) => (
    <section className="bg-white rounded-sm shadow-sm border border-[#E4E8EE]">
        <SectionHeader title={title} hint={hint} rightContent={rightContent} />
        <div className="p-6 space-y-5">{children}</div>
    </section>
);

const ChipMultiSelect = ({ label, value, options, onChange, optionLabel, optionValue, placeholder, error }) => {
    const ctx = React.useContext(FormContext);
    const isViewMode = ctx ? ctx.isViewMode : false;
    const ids = value || [];
    const labelFor = (o) => o?.[optionLabel] || o?.name || o?.categoryName || o?.collectionName || o?.title || "";
    const valFor = (o) => o?.[optionValue] || o?._id;
    const selectedItems = options.filter((o) => ids.includes(valFor(o)));
    const toggle = (val) => {
        const next = ids.includes(val) ? ids.filter((x) => x !== val) : [...ids, val];
        onChange(next);
    };

    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (containerRef.current && !containerRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className={`space-y-1 relative ${isOpen ? "z-50" : "z-0"}`} ref={containerRef}>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">{label}</label>
            <div
                onClick={() => { if (!isViewMode) setIsOpen(!isOpen); }}
                className={`min-h-[42px] flex items-center justify-between gap-1.5 p-2 border rounded-md bg-white cursor-pointer select-none ${error ? "border-red-500" : "border-gray-300"}`}
            >
                <div className="flex-1 flex items-center gap-1.5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden py-0.5">
                    {selectedItems.length === 0 && (
                        <span className="text-xs text-gray-400 px-1 py-1 whitespace-nowrap">{placeholder || "Select"}</span>
                    )}
                    {selectedItems.map((o) => (
                        <span
                            key={valFor(o)}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-zinc-100 text-xs whitespace-nowrap flex-shrink-0"
                            onClick={(e) => {
                                // Prevent toggling dropdown when clicking the chip area itself
                                e.stopPropagation();
                            }}
                        >
                            {labelFor(o)}
                            {!isViewMode && (
                                <button
                                    type="button"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        toggle(valFor(o));
                                    }}
                                    className="text-zinc-500 hover:text-red-600 ml-1"
                                >
                                    <X size={10} />
                                </button>
                            )}
                        </span>
                    ))}
                </div>
                {!isViewMode && (
                    <div className="text-gray-400 pr-1 flex-shrink-0">
                        {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                    </div>
                )}
            </div>
            {isOpen && !isViewMode && (
                <div className="absolute z-50 left-0 right-0 mt-1 max-h-40 overflow-y-auto border border-gray-200 rounded-md bg-white shadow-lg">
                    {options.length === 0 && (
                        <div className="px-3 py-2 text-xs text-gray-400">No options</div>
                    )}
                    {options.map((o) => {
                        const v = valFor(o);
                        const selected = ids.includes(v);
                        return (
                            <button
                                type="button"
                                key={v}
                                onClick={() => toggle(v)}
                                className={`flex items-center justify-between w-full px-3 py-1.5 text-xs text-left border-b last:border-b-0 border-zinc-50 hover:bg-zinc-50 ${selected ? "bg-zinc-50 font-medium text-zinc-900" : "text-zinc-700"}`}
                            >
                                <span>{labelFor(o)}</span>
                                {selected && <Check size={14} className="text-green-600" />}
                            </button>
                        );
                    })}
                </div>
            )}
            {error && <p className="text-[10px] text-red-500 mt-0.5">{error}</p>}
        </div>
    );
};

const Field = ({ label, name, type = "text", required, placeholder, value, onChange, options, error, ...rest }) => {
    const ctx = React.useContext(FormContext);
    const err = error || (ctx ? ctx.errors[name] : undefined);
    const isViewMode = ctx ? ctx.isViewMode : false;
    const baseCls = `w-full p-2 border rounded-md text-sm bg-white focus:outline-none focus:ring-1 focus:ring-black ${err ? "border-red-500" : "border-gray-300"}`;
    return (
        <div className="space-y-1">
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-600">
                {label}{required && <span className="text-red-500 ml-1">*</span>}
            </label>
            {type === "select" ? (
                <select name={name} value={value || ""} onChange={onChange} disabled={isViewMode} className={baseCls} {...rest}>
                    <option value="">{placeholder || "Select"}</option>
                    {(options || []).map((o) => (
                        <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                </select>
            ) : type === "textarea" ? (
                <textarea name={name} value={value || ""} onChange={onChange} disabled={isViewMode} placeholder={placeholder} className={`${baseCls} min-h-[80px]`} {...rest} />
            ) : (
                <input
                    type={type}
                    name={name}
                    value={value ?? ""}
                    onChange={onChange}
                    onWheel={(e) => type === "number" && e.target.blur()}
                    disabled={isViewMode}
                    placeholder={placeholder}
                    className={baseCls}
                    {...rest}
                />
            )}
            {err && <p className="text-[10px] text-red-500 mt-0.5">{err}</p>}
        </div>
    );
};

const StoneRow = ({ stone, group, idx }) => {
    console.log("hehehehehehehehehhehe", stone, group)
    const ctx = React.useContext(FormContext);
    if (!ctx) return null;
    const { isViewMode, setStone, removeStone, shapeList, colorList, clarityList, errors } = ctx;
    const onF = (field) => (e) => setStone(group, idx, field, e?.target ? e.target.value : e);
    const fieldShow = stone?.stoneType?.toLowerCase() === DIAMOND_TYPES?.DIAMOND?.toLowerCase() ? false : true;
    return (
        <div className="border border-[#E4E8EE] rounded-md p-3 bg-zinc-50/40 mb-3">
            <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase text-zinc-600">{stone.type} #{idx + 1}</span>
                {!isViewMode && (
                    <button type="button" onClick={() => removeStone(group, idx)} className="text-red-500 hover:bg-red-50 p-1 rounded">
                        <Trash2 size={14} />
                    </button>
                )}
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <Field
                    label="Stone Type"
                    name="stoneType"
                    type="select"
                    value={stone.stoneType}
                    onChange={onF("stoneType")}
                    options={DIAMOND_TYPES.ALL_TYPES.map((p) => ({ value: p.toUpperCase(), label: `${p?.charAt(0)?.toUpperCase() + p?.slice(1)}` }))}
                    error={errors?.[`${group}[${idx}].stoneType`]}
                />
                {stone.stoneType === "COLOR STONE" && (
                    <Field
                        label="Gem Type"
                        name="gemType"
                        type="select"
                        required
                        value={stone.gemType}
                        onChange={onF("gemType")}
                        options={GEM_TYPES.ALL_TYPES.map((p) => ({ value: p, label: `${p?.charAt(0)?.toUpperCase() + p?.slice(1)}` }))}
                        error={errors?.[`${group}[${idx}].gemType`]}
                    />
                )}
                <Field
                    label="Shape"
                    name="shape"
                    type="select"
                    required
                    value={stone.shape}
                    onChange={onF("shape")}
                    options={shapeList.map((p) => ({ value: p._id, label: p.name || p.code }))}
                    error={errors?.[`${group}[${idx}].shape`]}
                />
                {
                    fieldShow && (
                        <>
                            <Field
                                label="Color"
                                name="color"
                                required
                                value={stone.color}
                                onChange={onF("color")}
                                placeholder="e.g. EF"
                                error={errors?.[`${group}[${idx}].color`]}
                            />
                            <Field
                                label="Clarity"
                                name="clarity"
                                value={stone.clarity}
                                onChange={onF("clarity")}
                                placeholder="e.g. VVS"
                                error={errors?.[`${group}[${idx}].clarity`]}
                            />
                        </>
                    )
                }
                <Field label="Size" name="size" value={stone.size} onChange={onF("size")} error={errors?.[`${group}[${idx}].size`]} />
                <Field label="Pieces" name="pieces" type="number" value={stone.pieces} onChange={onF("pieces")} error={errors?.[`${group}[${idx}].pieces`]} />
                <Field label="Wgt" name="weight" type="number" value={stone.weight} onChange={onF("weight")} error={errors?.[`${group}[${idx}].weight`]} />
            </div>
        </div>
    );
};

export default function JewelleryFormPage() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const id = params?.id;
    const isAdd = !id || id === "add-product";
    const isViewMode = searchParams.get("mode") === "view";
    const token = getToken();

    const [form, setForm] = useState(EMPTY_FORM);
    const [errors, setErrors] = useState({});
    const [saving, setSaving] = useState(false);
    const [loading, setLoading] = useState(false);

    // Image grid mirrors the export sheet: up to 5 slots with a "default"
    // flag that maps to IsMainMedia on persistence.
    const [imageNames, setImageNames] = useState(() =>
        Array.from({ length: 5 }, (_, i) => ({
            MediaLocation: "",
            IsMainMedia: i === 0,
            MediaSeqNo: i + 1,
        })),
    );
    const [defaultImageIndex, setDefaultImageIndex] = useState(0);

    // ---- Dropdown lists ----------------------------------------------------
    const [categoryList, setCategoryList] = useState([]);
    const [subCategoryList, setSubCategoryList] = useState([]);
    const [collectionList, setCollectionList] = useState([]);
    const [tagList, setTagList] = useState([]);
    const [metalList, setMetalList] = useState([]);
    const [labourList, setLabourList] = useState([]);
    const [otherChargeList, setOtherChargeList] = useState([]);
    const [shapeList, setShapeList] = useState([]);
    const [colorList, setColorList] = useState([]);
    const [clarityList, setClarityList] = useState([]);
    // ---- Helpers -----------------------------------------------------------
    const update = (patch) => setForm((prev) => ({ ...prev, ...patch }));
    const setField = (k, v) => {
        update({ [k]: v });
        if (errors[k]) {
            setErrors((e) => {
                const { [k]: _, ...rest } = e;
                return rest;
            });
        }
    };

    const setStone = (group, idx, k, v) => {
        setForm((prev) => {
            const arr = (prev[group] || []).slice();
            const stone = { ...arr[idx], [k]: v };
            const pieces = parseFloat(stone.pieces) || 0;
            const weight = parseFloat(stone.weight) || 0;
            const tc = pieces * weight;
            stone.totalCarat = tc > 0 ? parseFloat(tc.toFixed(3)) : "";
            arr[idx] = stone;
            return { ...prev, [group]: arr };
        });
    };
    const addStone = (group) => {
        const type = group === "centerStones" ? "CENTER" : "SIDE";
        setForm((prev) => ({
            ...prev,
            [group]: [...(prev[group] || []), emptyStone(type)],
        }));
    };
    const removeStone = (group, idx) => {
        setForm((prev) => ({
            ...prev,
            [group]: (prev[group] || []).filter((_, i) => i !== idx),
        }));
    };

    // const handleDescriptionChange = useCallback((html) => {
    //     setField("productDesc", html);
    // }, []);

    // ---- Initial dropdown loads -------------------------------------------
    useEffect(() => {
        const callList = async (url, method = "GET", body = null) => {
            try {
                const res = await callApi(url, method, body, token);
                return res?.errorCode === STATUS_CODE.OK ? res.data || [] : [];
            } catch (err) {
                console.error("List fetch error", url, err);
                return [];
            }
        };

        (async () => {
            const [cats, cols, tagsRes, metals, labour, other] = await Promise.all([
                callList(API_URL.GET_JEWELLERY_CATEGORY),
                callList(API_URL.COLLECTIONS_LIST, "POST", { page: 1, limit: 500 }),
                callList(API_URL.GET_TAGS, "GET"),
                callList(API_URL.GET_METAL_LIST, "GET"),
                // Charges live in a unified collection with a `type` field.
                // The legacy `/labourCharges/*` and `/otherCharges/*`
                // mounts no longer exist — fetch from /charges with a
                // type filter so the dropdowns aren't permanently empty.
                callList(API_URL.GET_CHARGES_LIST, "POST", { page: 1, limit: 500, type: "making" }),
                callList(API_URL.GET_CHARGES_LIST, "POST", { page: 1, limit: 500, type: "other" }),
            ]);
            setCategoryList(Array.isArray(cats) ? cats : []);
            // Collection list response can be either the array directly
            // or wrapped in a list/data sub-key depending on the route.
            setCollectionList(Array.isArray(cols) ? cols : (cols?.data || cols?.list || []));
            setTagList(Array.isArray(tagsRes) ? tagsRes : []);
            setMetalList(Array.isArray(metals) ? metals : []);
            setLabourList(Array.isArray(labour) ? labour : []);
            setOtherChargeList(Array.isArray(other) ? other : []);
        })();

        // Shape/Color/Clarity (Parameter type filter). limit=500 so all
        // values come back — the default 10 wasn't enough for shape (12+
        // entries typical) and the dropdown silently missed options.
        const fetchParams = async (type, setter) => {
            try {
                const res = await callApi(
                    API_URL.PARAMETER_LIST,
                    "POST",
                    { type, status: "ACTIVE", page: 1, limit: 500 },
                    token,
                );
                if (res?.errorCode === STATUS_CODE.OK) setter(res.data || []);
            } catch (err) {
                console.error("Parameter fetch error", type, err);
            }
        };
        fetchParams("shape", setShapeList);
        fetchParams("color", setColorList);
        fetchParams("clarity", setClarityList);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Older records (and any cached responses created before the detail
    // projection started preserving ObjectIds) may carry `shape/color/
    // clarity` as Parameter `code` strings (e.g. "RD"). Once the
    // parameter lists arrive, re-resolve any code-string stones back to
    // an ObjectId so the dropdowns pre-select correctly. New records
    // already store the ObjectId so this is a no-op for them.
    useEffect(() => {
        const codeToId = (list, value) => {
            if (!value || typeof value !== "string") return value;
            if (/^[0-9a-fA-F]{24}$/.test(value)) return value;
            const match = list.find(
                (p) => p.code === value || p.name === value,
            );
            return match?._id || value;
        };
        const normalizeStone = (s) => ({
            ...s,
            shape: codeToId(shapeList, s.shape),
            color: s.color || "",
            clarity: s.clarity || "",
        });
        setForm((prev) => {
            const nextCenters = (prev.centerStones || []).map(normalizeStone);
            const nextSiders = (prev.sideStones || []).map(normalizeStone);
            // Skip the state update when nothing actually changed —
            // prevents an infinite loop with the dep array below.
            const sameC = nextCenters.every((s, i) =>
                s.shape === prev.centerStones[i]?.shape
                && s.color === prev.centerStones[i]?.color
                && s.clarity === prev.centerStones[i]?.clarity,
            );
            const sameS = nextSiders.every((s, i) =>
                s.shape === prev.sideStones[i]?.shape
                && s.color === prev.sideStones[i]?.color
                && s.clarity === prev.sideStones[i]?.clarity,
            );
            if (sameC && sameS) return prev;
            return { ...prev, centerStones: nextCenters, sideStones: nextSiders };
        });
    }, [shapeList, colorList, clarityList]);

    // Subcategories load when category changes.
    useEffect(() => {
        if (!form.categoryId) {
            setSubCategoryList([]);
            return;
        }
        (async () => {
            try {
                const res = await callApi(
                    `${API_URL.GET_JEWELLERY_SUBCATEGORY}/${form.categoryId}`,
                    "GET",
                    null,
                    token,
                );
                if (res?.errorCode === STATUS_CODE.OK) {
                    setSubCategoryList(res.data || []);
                } else {
                    setSubCategoryList([]);
                }
            } catch (err) {
                console.error("Subcategory fetch error", err);
                setSubCategoryList([]);
            }
        })();
    }, [form.categoryId, token]);

    // ---- Detail hydration (edit + view) ------------------------------------
    useEffect(() => {
        if (isAdd) return;
        (async () => {
            try {
                setLoading(true);
                const res = await callApi(
                    `${API_URL.GET_JEWELLERY_DETAIL}/${id}`,
                    "GET",
                    null,
                    token,
                );
                if (res?.errorCode !== STATUS_CODE.OK || !res?.data) {
                    toast.error(res?.message || M.product.listFetchFailed);
                    return;
                }
                const d = res.data;

                // Map populated `categoryDetails` back to plain id so the
                // select binds correctly; same for arrays.
                const subIds = Array.isArray(d.subCategoryId)
                    ? d.subCategoryId.map((s) => (typeof s === "object" ? s._id : s))
                    : [];
                const colIds = Array.isArray(d.collectionId)
                    ? d.collectionId.map((c) => (typeof c === "object" ? c._id : c))
                    : Array.isArray(d.collectionDetails)
                        ? d.collectionDetails.map((c) => c._id)
                        : [];
                const tagIds = Array.isArray(d.tags)
                    ? d.tags.map((t) => (typeof t === "object" ? t._id : t))
                    : Array.isArray(d.tagDetails)
                        ? d.tagDetails.map((t) => t._id)
                        : [];

                // Stones come back with `shape/color/clarity` as the raw
                // ObjectId (current projection), with a sibling
                // `shapeDetails/colorDetails/clarityDetails` carrying
                // {_id, code, name} for display. Older responses (cached
                // before the projection fix) might collapse them to a
                // Parameter `code` string — the effect below re-resolves
                // those once the param lists arrive.
                const stones = Array.isArray(d.stones) ? d.stones.filter(Boolean) : [];
                const pickId = (raw, details) => {
                    if (details && typeof details === "object" && details._id) return details._id;
                    if (raw && typeof raw === "object" && raw._id) return raw._id;
                    return raw || "";
                };
                const toStone = (s) => {
                    const pieces = s.pieces ?? "";
                    const weight = s.weight ?? s.wgt ?? "";
                    const calculatedTotal = (parseFloat(pieces) || 0) * (parseFloat(weight) || 0);
                    return {
                        type: (s.type || "SIDE").toUpperCase(),
                        stoneType: (s.stoneType || s.stoneGroupDetails?.stoneType || s.stoneGroup?.stoneType || "diamond").toUpperCase(),
                        gemType: s.gemType || s.stoneGroupDetails?.type || s.stoneGroup?.type || "",
                        shape: pickId(s.shape, s.shapeDetails),
                        color: s.color || s.gemColor || "",
                        clarity: s.clarity || s.gemClarity || "",
                        size: s.size ?? "",
                        pieces,
                        weight,
                        totalCarat: calculatedTotal > 0 ? parseFloat(calculatedTotal.toFixed(3)) : (s.totalCarat || ""),
                        stoneGroup:
                            typeof s.stoneGroup === "object"
                                ? s.stoneGroup?._id
                                : s.stoneGroup || s.stoneGroupDetails?._id || "",
                    };
                };
                const centerStones = stones.filter((s) => (s.type || "").toUpperCase() === "CENTER").map(toStone);
                const sideStones = stones.filter((s) => (s.type || "").toUpperCase() !== "CENTER").map(toStone);

                const seo = d.SEODetails || {};

                setForm({
                    designNumber: d.designNumber || "",
                    itemCode: d.itemCode || "",
                    parentItemCode: d.parentItemCode || "",
                    productTitle: (d.productTitle || "").replace(/<[^>]*>?/g, ""),
                    slug: d.slug || "",
                    gender: (() => {
                        const g = d.gender || "";
                        const match = GENDER_OPTIONS.find((opt) => opt.value.toLowerCase() === g.toLowerCase());
                        return match ? match.value : g;
                    })(),

                    categoryId:
                        d.categoryId ||
                        d.categoryDetails?._id ||
                        "",
                    subCategoryId: subIds,
                    collectionId: colIds,
                    tags: tagIds,
                    status: d.status || "available",

                    metalId: d.metalId || d.metalDetails?._id || "",
                    labourCode: d.labourCode || d.labourDetails?._id || "",
                    otherChargeCode: d.otherChargeCode || d.otherChargeDetails?._id || "",
                    appxMetalWgt: d.appxMetalWgt ?? "",
                    isEngraving: !!d.isEngraving,
                    shipmentDays: d.shipmentDays ?? "",

                    qty: d.qty ?? "",
                    height: d.height ?? "",
                    width: d.width ?? "",
                    length: d.length ?? "",

                    haveChain: d.haveChain || "No",
                    cMetalId: d.cMetalId || d.cMetalDetails?._id || "",
                    cWgt: d.cWgt ?? "",
                    cLength: d.cLength ?? "",

                    similarProducts: Array.isArray(d.similarProducts) ? d.similarProducts : [],
                    combineWith: Array.isArray(d.combineWith) ? d.combineWith : [],

                    productDesc: d.productDesc || "",
                    videoUrl:
                        Array.isArray(d.videos) && d.videos[0]?.MediaLocation
                            ? d.videos[0].MediaLocation
                            : "",

                    metaTitle: seo.metaTitle || "",
                    metaKeyword: seo.metaKeyword || "",
                    metaDescription: seo.metaDescription || "",
                    seoSlug: seo.slug || "",

                    centerStones,
                    sideStones,
                });

                // Hydrate images grid + default index.
                if (Array.isArray(d.images) && d.images.length) {
                    const next = Array.from({ length: 5 }, (_, i) => ({
                        MediaLocation: "",
                        IsMainMedia: false,
                        MediaSeqNo: i + 1,
                    }));
                    let defaultIdx = 0;
                    d.images.slice(0, 5).forEach((img, i) => {
                        next[i] = {
                            MediaLocation: img.MediaLocation || "",
                            IsMainMedia: !!img.IsMainMedia,
                            MediaSeqNo: img.MediaSeqNo || i + 1,
                        };
                        if (img.IsMainMedia) defaultIdx = i;
                    });
                    setImageNames(next);
                    setDefaultImageIndex(defaultIdx);
                }
            } catch (err) {
                console.error("Detail fetch error", err);
                toast.error(M.common.somethingWentWrong);
            } finally {
                setLoading(false);
            }
        })();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // Resolve a stored Parameter code (e.g. "RD" for Round) back to the
    // Parameter _id at submit time. We accept either an ObjectId already
    // selected from the dropdown, OR a code string that came down from
    // the detail endpoint's collapsed projection.
    const resolveParam = (list, value) => {
        if (!value) return "";
        if (typeof value !== "string") return value;
        if (/^[0-9a-fA-F]{24}$/.test(value)) return value;
        const match = list.find(
            (p) => p.code === value || p.name === value || p._id === value,
        );
        return match?._id || value;
    };

    // ---- Submit ------------------------------------------------------------
    const handleSubmit = async () => {
        if (isViewMode) return;
        try {
            await schema.validate(form, { abortEarly: false });
            setErrors({});
        } catch (err) {
            const next = {};
            if (err.inner) for (const e of err.inner) next[e.path] = e.message;
            setErrors(next);
            toast.error(M.validation.required);
            return;
        }
        console.log("formData =>", form);
        const validImages = imageNames.filter(
            (img) => img?.MediaLocation && img.MediaLocation.trim() !== "",
        );
        if (validImages.length === 0) {
            setErrors((e) => ({ ...e, images: "At least one image is required." }));
            toast.error("At least one image is required");
            return;
        }

        setSaving(true);
        try {
            const fd = new FormData();
            // Identity
            fd.append("designNumber", form.designNumber || "");
            fd.append("itemCode", form.itemCode || "");
            fd.append("parentItemCode", form.parentItemCode || "");
            fd.append("productTitle", form.productTitle || "");
            fd.append("slug", form.slug || "");
            fd.append("gender", form.gender || "");

            // Catalog
            fd.append("categoryId", form.categoryId || "");
            fd.append("subCategoryId", form.subCategoryId || "");
            fd.append("collectionId", form.collectionId || "");
            fd.append("tags", form.tags || "");
            // if (form.subCategoryId.length) fd.append("subCategoryId", form.subCategoryId.join(","));
            // if (form.collectionId.length) fd.append("collectionId", form.collectionId.join(","));
            // if (form.tags.length) fd.append("tags", form.tags.join(","));
            fd.append("status", form.status || "available");

            // Metal & Charges
            fd.append("metalId", form.metalId || "");
            fd.append("labourCode", form.labourCode || "");
            fd.append("otherChargeCode", form.otherChargeCode || "");
            fd.append("appxMetalWgt", form.appxMetalWgt || "");
            fd.append("isEngraving", form.isEngraving ? "true" : "false");
            fd.append("shipmentDays", form.shipmentDays || "");

            // Dimensions
            fd.append("qty", form.qty || "");
            fd.append("height", form.height || "");
            fd.append("width", form.width || "");
            fd.append("length", form.length || "");

            // Chain
            fd.append("haveChain", form.haveChain || "No");
            if (form.haveChain === "Yes") {
                fd.append("cMetalId", form.cMetalId || "");
                fd.append("cWgt", form.cWgt || "");
                fd.append("cLength", form.cLength || "");
            }

            // Cross-sell + bundles (SKU-level, one list per product — NOT
            // per stone. Stored on the product itself as String[]).
            if (form.similarProducts.length) {
                fd.append("similarProducts", form.similarProducts.join(","));
            }
            if (form.combineWith.length) {
                fd.append("combineWith", form.combineWith.join(","));
            }

            // Description (Quill html)
            fd.append("productDesc", form.productDesc || "");

            // SEO
            fd.append("metaTitle", form.metaTitle || "");
            fd.append("metaKeyword", form.metaKeyword || "");
            fd.append("metaDescription", form.metaDescription || "");
            fd.append("seoSlug", form.seoSlug || "");

            // Video — bare filename (export sheet's VideoUrl convention).
            fd.append(
                "videoUrl",
                typeof form.videoUrl === "string"
                    ? form.videoUrl.replace(JEWELLERY_VIDEO_PATH || "", "")
                    : "",
            );

            // Images — strip CDN prefix if the user typed full URLs, mark
            // the chosen default as IsMainMedia.
            const cleanImages = imageNames
                .filter((img) => img?.MediaLocation && img.MediaLocation.trim() !== "")
                .map((img, i) => ({
                    MediaLocation: img.MediaLocation.replace(JEWELLERY_IMAGE_PATH || "", ""),
                    IsMainMedia: i === defaultImageIndex,
                    MediaSeqNo: i + 1,
                }));
            fd.append("images", JSON.stringify(cleanImages));

            // Stones — uppercase type per the ProductStone schema enum.
            // Resolve any code-string shape/color/clarity back to a real
            // ObjectId from the Parameter lists before sending.
            /* ORIGINAL allStones mapping:
            const allStones = [
                ...form.centerStones.map((s) => ({ ...s, type: "CENTER" })),
                ...form.sideStones.map((s) => ({ ...s, type: "SIDE" })),
            ].map((s) => {
                const shapeId = resolveParam(shapeList, s.shape)
                const shapeObj = shapeList.find((x) => x._id === shapeId);
                return {
                    ...s,
                    shape: {
                        _id: shapeId,
                        name: shapeObj?.name || shapeObj?.code || ""
                    },
                    color: s.color || "",
                    clarity: s.clarity || "",
                    pieces: Number(s.pieces) || 0,
                    weight: Number(s.weight) || 0,
                    totalCarat: Number(s.totalCarat) || 0,
                }
            });
            */
            const allStones = [
                ...form.centerStones.map((s) => ({ ...s, type: "CENTER" })),
                ...form.sideStones.map((s) => ({ ...s, type: "SIDE" })),
            ].map((s) => {
                const shapeId = resolveParam(shapeList, s.shape)
                const shapeObj = shapeList.find((x) => x._id === shapeId);
                const isColorStone = s.stoneType?.toUpperCase() === "COLOR STONE";
                return {
                    type: s.type,
                    stoneType: isColorStone ? "color stone" : "diamond",
                    shape: {
                        _id: shapeId,
                        name: shapeObj?.name || shapeObj?.code || ""
                    },
                    ...(isColorStone ? {
                        gemType: s.gemType?.toLowerCase() || "",
                        gemColor: s.color || "",
                        gemClarity: s.clarity || "",
                    } : {}),
                    size: s.size || "",
                    pieces: Number(s.pieces) || 0,
                    weight: Number(s.weight) || 0,
                    totalCarat: Number(s.totalCarat) || 0,
                };
            });
            fd.append("stones", JSON.stringify(allStones));

            const url = isAdd ? API_URL.CREATE_JEWELLERY : `${API_URL.UPDATE_JEWELLERY}/${id}`;
            const method = isAdd ? "POST" : "PUT";
            const res = await callApi(url, method, fd, token);
            if (res?.errorCode === STATUS_CODE.OK) {
                toast.success(res?.message || (isAdd ? M.product.created : M.product.updated));
                router.push("/products/jewellery");
            } else {
                toast.error(res?.message || M.common.somethingWentWrong);
            }
        } catch (err) {
            console.error("Submit error", err);
            toast.error(M.common.somethingWentWrong);
        } finally {
            setSaving(false);
        }
    };

    // Helpers extracted to file level to prevent component re-creation and focus loss during re-render

    // ---- Image grid --------------------------------------------------------
    const onImageChange = (idx, location) => {
        setImageNames((arr) => {
            const next = arr.slice();
            next[idx] = { ...next[idx], MediaLocation: location };
            return next;
        });
    };

    // ---------------------------------------------------------------------
    // Render
    // ---------------------------------------------------------------------
    return (
        <FormContext.Provider value={{
            errors,
            isViewMode,
            setStone,
            removeStone,
            shapeList,
            colorList,
            clarityList
        }}>
            <div className="bg-[#F5F5F5] min-h-screen pb-20">
                <div className="bg-white border-b border-[#E4E8EE] px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <button onClick={() => router.push("/products/jewellery")} className="text-gray-600 hover:text-black p-1">
                            <ArrowLeft size={18} />
                        </button>
                        <h1 className="text-lg font-semibold">
                            {isAdd ? "Create" : isViewMode ? "View" : "Edit"} Jewellery
                            {form.itemCode && <span className="text-gray-400 ml-2 text-sm font-normal">— {form.itemCode}</span>}
                        </h1>
                    </div>
                    {!isViewMode && (
                        <Button onClick={handleSubmit} disabled={saving || loading} className="bg-black text-white hover:bg-gray-800">
                            {saving ? "Saving..." : isAdd ? "Create Product" : "Save Changes"}
                        </Button>
                    )}
                </div>

                {loading && (
                    <div className="px-6 py-3 text-xs text-gray-500">Loading product details…</div>
                )}

                <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
                    {/* 1. Identity */}
                    <Section title="Identity" hint="Item code is unique and immutable once products reference it">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="Design Number" name="designNumber" value={form.designNumber} onChange={(e) => setField("designNumber", e.target.value)} placeholder="MainDesignNumber" />
                            <Field label="Item Code (SKU)" name="itemCode" required value={form.itemCode} onChange={(e) => setField("itemCode", e.target.value)} placeholder="Unique SKU" />
                            <Field label="Parent Item Code" name="parentItemCode" value={form.parentItemCode} onChange={(e) => setField("parentItemCode", e.target.value)} placeholder="Parent SKU for variants" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="Product Title" name="productTitle" required value={form.productTitle} onChange={(e) => setField("productTitle", e.target.value)} />
                            <Field label="Slug" name="slug" value={form.slug} onChange={(e) => setField("slug", e.target.value)} placeholder="Auto-generated on import; editable" />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field
                                label="Gender"
                                name="gender"
                                type="select"
                                required
                                value={form.gender}
                                onChange={(e) => setField("gender", e.target.value)}
                                options={GENDER_OPTIONS}
                            />
                            <Field
                                label="Status"
                                name="status"
                                type="select"
                                value={form.status}
                                onChange={(e) => setField("status", e.target.value)}
                                required
                                options={[
                                    { value: "available", label: "Available" },
                                    { value: "hold", label: "Hold" },
                                ]}
                            />
                            <div className="flex items-end pb-1">
                                <label className="inline-flex items-center gap-2 text-xs font-medium text-gray-700">
                                    <Checkbox
                                        checked={form.isEngraving}
                                        onCheckedChange={(v) => setField("isEngraving", !!v)}
                                        disabled={isViewMode}
                                    />
                                    Engraving available
                                </label>
                            </div>
                        </div>
                    </Section>

                    {/* 2. Catalog */}
                    <Section title="Catalog" hint="Top-level category is required; subcategory + collections + tags are optional groupings">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field
                                label="Category"
                                name="categoryId"
                                type="select"
                                required
                                value={form.categoryId}
                                onChange={(e) => {
                                    setField("categoryId", e.target.value);
                                    setField("subCategoryId", []);
                                }}
                                options={categoryList.map((c) => ({ value: c._id, label: c.categoryName }))}
                            />
                            <ChipMultiSelect
                                label="Subcategory (Style)"
                                value={form.subCategoryId}
                                options={subCategoryList}
                                onChange={(v) => setField("subCategoryId", v)}
                                optionLabel="categoryName"
                                optionValue="_id"
                                placeholder="Select styles"
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <ChipMultiSelect
                                label="Collections"
                                value={form.collectionId}
                                options={collectionList}
                                onChange={(v) => setField("collectionId", v)}
                                optionLabel="collectionName"
                                optionValue="_id"
                                placeholder="Select collections"
                            />
                            <ChipMultiSelect
                                label="Tags"
                                value={form.tags}
                                options={tagList}
                                onChange={(v) => setField("tags", v)}
                                optionLabel="name"
                                optionValue="_id"
                                placeholder="Select tags"
                            />
                        </div>
                    </Section>

                    {/* 3. Metal & Charges */}
                    <Section title="Metal & Charges" hint="Unified Metal collection (type + stamp combined into one record)">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field
                                label="Metal"
                                name="metalId"
                                type="select"
                                required
                                value={form.metalId}
                                onChange={(e) => setField("metalId", e.target.value)}
                                options={metalList.map((m) => ({
                                    value: m._id,
                                    label: m.name || `${m.type || ""} ${m.stamp || ""}`.trim(),
                                }))}
                            />
                            <Field
                                label="Labour Charge"
                                name="labourCode"
                                type="select"
                                required
                                value={form.labourCode}
                                onChange={(e) => setField("labourCode", e.target.value)}
                                options={labourList.map((l) => ({ value: l._id, label: `${l.name || l.code} (₹${l.amount_per_gm}/gm)` }))}
                            />
                            <Field
                                label="Other Charge"
                                name="otherChargeCode"
                                type="select"
                                value={form.otherChargeCode}
                                onChange={(e) => setField("otherChargeCode", e.target.value)}
                                options={otherChargeList.map((o) => ({ value: o._id, label: `${o.name || o.code} (₹${o.amount_per_gm}/gm)` }))}
                            />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="Approx Metal Weight" name="appxMetalWgt" type="number" required value={form.appxMetalWgt} onChange={(e) => setField("appxMetalWgt", e.target.value)} placeholder="grams" />
                            <Field label="Shipment Days" name="shipmentDays" type="number" value={form.shipmentDays} onChange={(e) => setField("shipmentDays", e.target.value)} />
                            <Field label="Qty" name="qty" type="number" required value={form.qty} onChange={(e) => setField("qty", e.target.value)} />
                        </div>
                    </Section>

                    {/* 4. Dimensions */}
                    <Section title="Dimensions" hint="Free-form text or numeric — matches import sheet's Width/Height/Length columns">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Field label="Width" name="width" value={form.width} onChange={(e) => setField("width", e.target.value)} />
                            <Field label="Height" name="height" value={form.height} onChange={(e) => setField("height", e.target.value)} />
                            <Field label="Length" name="length" value={form.length} onChange={(e) => setField("length", e.target.value)} />
                        </div>
                    </Section>

                    {/* 5. Chain */}
                    <Section title="Chain" hint="Toggle Yes when the product includes a chain — additional metal/length fields unlock">
                        <div className="space-y-3">
                            <RadioGroup
                                value={form.haveChain}
                                onValueChange={(v) => setField("haveChain", v)}
                                className="flex gap-6"
                                disabled={isViewMode}
                            >
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <RadioGroupItem value="Yes" id="chain-yes" />
                                    Yes
                                </label>
                                <label className="inline-flex items-center gap-2 text-sm">
                                    <RadioGroupItem value="No" id="chain-no" />
                                    No
                                </label>
                            </RadioGroup>
                            {form.haveChain === "Yes" && (
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                                    <Field
                                        label="Chain Metal"
                                        name="cMetalId"
                                        type="select"
                                        value={form.cMetalId}
                                        onChange={(e) => setField("cMetalId", e.target.value)}
                                        options={metalList.map((m) => ({
                                            value: m._id,
                                            label: m.name || `${m.type || ""} ${m.stamp || ""}`.trim(),
                                        }))}
                                    />
                                    <Field label="Chain Weight" name="cWgt" type="number" value={form.cWgt} onChange={(e) => setField("cWgt", e.target.value)} />
                                    <Field label="Chain Length" name="cLength" value={form.cLength} onChange={(e) => setField("cLength", e.target.value)} />
                                </div>
                            )}
                        </div>
                    </Section>

                    {/* 6. Diamonds */}
                    <Section
                        title="Center Stones"
                        hint="Set the main stone(s). Type = CENTER"
                        rightContent={`Total Carat: ${(form.centerStones || []).reduce((acc, curr) => acc + (parseFloat(curr.totalCarat) || 0), 0).toFixed(3)} ct`}
                    >
                        {(form.centerStones || []).map((stone, i) => (
                            <StoneRow key={`c-${i}`} stone={stone} group="centerStones" idx={i} />
                        ))}
                        {!isViewMode && (
                            <button
                                type="button"
                                onClick={() => addStone("centerStones")}
                                className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md bg-black text-white hover:bg-gray-800"
                            >
                                <Plus size={14} /> Add Center Stone
                            </button>
                        )}
                    </Section>

                    <Section
                        title="Side Stones"
                        hint="Accent stones. Type = SIDE"
                        rightContent={`Total Carat: ${(form.sideStones || []).reduce((acc, curr) => acc + (parseFloat(curr.totalCarat) || 0), 0).toFixed(3)} ct`}
                    >
                        {(form.sideStones || []).map((stone, i) => (
                            <StoneRow key={`s-${i}`} stone={stone} group="sideStones" idx={i} />
                        ))}
                        {!isViewMode && (
                            <button
                                type="button"
                                onClick={() => addStone("sideStones")}
                                className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-md bg-black text-white hover:bg-gray-800"
                            >
                                <Plus size={14} /> Add Side Stone
                            </button>
                        )}
                    </Section>

                    {/* 7. Cross-sell + Bundles */}
                    <Section title="Cross-sell & Bundles" hint="ONE list per SKU (not per stone). Stored as item codes — exactly matches the import sheet">
                        <ItemCodePicker
                            label="Similar Products"
                            placeholder="Search by item code or title"
                            value={form.similarProducts}
                            onChange={(v) => setField("similarProducts", v)}
                            excludeItemCode={form.itemCode}
                        />
                        <ItemCodePicker
                            label="Combine With"
                            placeholder="Search by item code or title"
                            value={form.combineWith}
                            onChange={(v) => setField("combineWith", v)}
                            excludeItemCode={form.itemCode}
                        />
                    </Section>

                    {/* 8. Description */}
                    <Section title="Product Description">
                        <div className={`rounded-md border overflow-hidden ${errors.productDesc ? "border-red-500" : "border-[#E4E8EE]"}`}>
                            <QuillEditor readOnly={isViewMode} value={form.productDesc} onChange={(html) => setField("productDesc", html)} />
                        </div>
                    </Section>

                    {/* 9. Media */}
                    <Section title="Media" hint="Up to 5 images. Click the star to mark the default thumbnail">
                        {errors.images && <p className="text-xs text-red-500">{errors.images}</p>}
                        <div className="space-y-2">
                            {imageNames.map((img, i) => (
                                <div key={i} className="flex items-center gap-3 border border-[#E4E8EE] rounded-md p-2 bg-white">
                                    <button
                                        type="button"
                                        onClick={() => setDefaultImageIndex(i)}
                                        disabled={isViewMode}
                                        title="Mark as default"
                                        className={`p-1.5 rounded ${i === defaultImageIndex ? "text-yellow-500" : "text-gray-300 hover:text-gray-500"}`}
                                    >
                                        <Star size={16} fill={i === defaultImageIndex ? "currentColor" : "none"} />
                                    </button>
                                    <div className="h-16 w-16 flex-shrink-0 border border-gray-100 rounded bg-gray-50 overflow-hidden flex items-center justify-center">
                                        {img.MediaLocation ? (
                                            <img
                                                src={img.MediaLocation.startsWith("http") ? img.MediaLocation : `${JEWELLERY_IMAGE_PATH || ""}${img.MediaLocation}`}
                                                alt="preview"
                                                className="object-cover h-full w-full"
                                                onError={(e) => {
                                                    if (!e.currentTarget.dataset.fallback) {
                                                        e.currentTarget.dataset.fallback = "1";
                                                        e.currentTarget.src = `${PREFIX || ""}/noImage.png`;
                                                    }
                                                }}
                                            />
                                        ) : (
                                            <span className="text-[10px] text-gray-400">empty</span>
                                        )}
                                    </div>
                                    <input
                                        type="text"
                                        placeholder={`Image #${i + 1} filename or URL`}
                                        value={img.MediaLocation}
                                        onChange={(e) => onImageChange(i, e.target.value)}
                                        disabled={isViewMode}
                                        className="flex-1 p-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-1 focus:ring-black"
                                    />
                                    {!isViewMode && img.MediaLocation && (
                                        <button
                                            type="button"
                                            onClick={() => onImageChange(i, "")}
                                            className="text-red-500 p-1 rounded hover:bg-red-50"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    )}
                                </div>
                            ))}
                        </div>
                        <div className="pt-2">
                            <Field
                                label="Video Filename / URL"
                                name="videoUrl"
                                value={form.videoUrl}
                                onChange={(e) => setField("videoUrl", e.target.value)}
                                placeholder="optional"
                            />
                        </div>
                    </Section>

                    {/* 10. SEO */}
                    <Section title="SEO" hint="Optional. Used by the storefront for meta tags and the canonical URL">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Field label="SEO Title" name="metaTitle" value={form.metaTitle} onChange={(e) => setField("metaTitle", e.target.value)} />
                            <Field label="SEO Slug" name="seoSlug" value={form.seoSlug} onChange={(e) => setField("seoSlug", e.target.value)} />
                        </div>
                        <Field label="SEO Keywords" name="metaKeyword" value={form.metaKeyword} onChange={(e) => setField("metaKeyword", e.target.value)} placeholder="Comma separated" />
                        <Field label="SEO Description" name="metaDescription" type="textarea" value={form.metaDescription} onChange={(e) => setField("metaDescription", e.target.value)} />
                    </Section>

                    {!isViewMode && (
                        <div className="flex justify-end gap-3 pt-2">
                            <Button variant="outline" onClick={() => router.push("/products/jewellery")} disabled={saving}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={saving || loading} className="bg-black text-white hover:bg-gray-800">
                                {saving ? "Saving..." : isAdd ? "Create Product" : "Save Changes"}
                            </Button>
                        </div>
                    )}
                </div>
            </div>
        </FormContext.Provider>
    );
}
