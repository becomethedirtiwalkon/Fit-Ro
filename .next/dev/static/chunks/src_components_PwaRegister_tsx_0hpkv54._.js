(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push([typeof document === "object" ? document.currentScript : undefined,
"[project]/src/components/PwaRegister.tsx [app-client] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "default",
    ()=>PwaRegister
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var _s = __turbopack_context__.k.signature();
"use client";
;
function PwaRegister() {
    _s();
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "PwaRegister.useEffect": ()=>{
            if ("TURBOPACK compile-time falsy", 0) //TURBOPACK unreachable
            ;
            if (!("serviceWorker" in navigator)) return;
            const register = {
                "PwaRegister.useEffect.register": ()=>{
                    navigator.serviceWorker.register("/sw.js").catch({
                        "PwaRegister.useEffect.register": ()=>undefined
                    }["PwaRegister.useEffect.register"]);
                }
            }["PwaRegister.useEffect.register"];
            if (document.readyState === "complete") register();
            else window.addEventListener("load", register);
            return ({
                "PwaRegister.useEffect": ()=>window.removeEventListener("load", register)
            })["PwaRegister.useEffect"];
        }
    }["PwaRegister.useEffect"], []);
    return null;
}
_s(PwaRegister, "OD7bBpZva5O2jO+Puf00hKivP7c=");
_c = PwaRegister;
var _c;
__turbopack_context__.k.register(_c, "PwaRegister");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_context__.k.registerExports(__turbopack_context__.m, globalThis.$RefreshHelpers$);
}
}),
]);

//# sourceMappingURL=src_components_PwaRegister_tsx_0hpkv54._.js.map