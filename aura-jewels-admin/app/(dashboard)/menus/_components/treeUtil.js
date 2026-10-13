// Small helpers for the menu builder tree.

let _counter = 0;
// Stable-ish client id for React keys (never persisted — stripped on save).
export const uid = () => `u${(_counter++).toString(36)}${Math.random().toString(36).slice(2, 7)}`;

// Assigns a `_uid` to every node inside any array (items, columns, links,
// groups, options, featuredCards) so React can key by a stable identity instead
// of the array index. Idempotent: keeps an existing `_uid`. Run once on load
// and via the node factories.
export const ensureUids = (value) => {
    if (Array.isArray(value)) {
        return value.map((v) =>
            v && typeof v === "object" && !Array.isArray(v)
                ? ensureUids({ ...v, _uid: v._uid || uid() })
                : ensureUids(v)
        );
    }
    if (value && typeof value === "object" && Object.getPrototypeOf(value) === Object.prototype) {
        const out = {};
        for (const [k, val] of Object.entries(value)) out[k] = ensureUids(val);
        return out;
    }
    return value;
};

// Move an array element (matched by _uid) up/down.
export const moveByUid = (arr, id, dir) => {
    const i = arr.findIndex((x) => x._uid === id);
    const j = i + dir;
    if (i < 0 || j < 0 || j >= arr.length) return arr;
    const next = arr.slice();
    [next[i], next[j]] = [next[j], next[i]];
    return next;
};
