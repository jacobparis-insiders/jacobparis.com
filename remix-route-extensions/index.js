"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getRouteIdConflictErrorMessage = exports.getRoutePathConflictErrorMessage = exports.createRoutePath = exports.getRouteSegments = exports.routeExtensionsImpl = exports.routeExtensions = void 0;
const node_fs_1 = __importDefault(require("node:fs"));
const fs_extra_1 = __importDefault(require("fs-extra"));
const node_path_1 = __importDefault(require("node:path"));
const glob_to_regexp_1 = __importDefault(require("glob-to-regexp"));
function findConfig(dir, basename, extensions) {
    for (let ext of extensions) {
        let name = basename + ext;
        let file = node_path_1.default.join(dir, name);
        if (fs_extra_1.default.existsSync(file))
            return file;
    }
    return undefined;
}
let paramPrefixChar = "$";
let escapeStart = "[";
let escapeEnd = "]";
let optionalStart = "(";
let optionalEnd = ")";
const routeModuleExts = [".js", ".jsx", ".ts", ".tsx", ".md", ".mdx"];
function isSegmentSeparator(checkChar) {
    if (!checkChar)
        return false;
    return ["/", ".", node_path_1.default.win32.sep].includes(checkChar);
}
function normalizeSlashes(file) {
    return file.split(node_path_1.default.win32.sep).join("/");
}
const PrefixLookupTrieEndSymbol = Symbol("PrefixLookupTrieEndSymbol");
class PrefixLookupTrie {
    root = {
        [PrefixLookupTrieEndSymbol]: false,
    };
    add(value) {
        if (!value)
            throw new Error("Cannot add empty string to PrefixLookupTrie");
        let node = this.root;
        for (let char of value) {
            if (!node[char]) {
                node[char] = {
                    [PrefixLookupTrieEndSymbol]: false,
                };
            }
            node = node[char];
        }
        node[PrefixLookupTrieEndSymbol] = true;
    }
    findAndRemove(prefix, filter) {
        let node = this.root;
        for (let char of prefix) {
            if (!node[char])
                return [];
            node = node[char];
        }
        return this.#findAndRemoveRecursive([], node, prefix, filter);
    }
    #findAndRemoveRecursive(values, node, prefix, filter) {
        for (let char of Object.keys(node)) {
            this.#findAndRemoveRecursive(values, node[char], prefix + char, filter);
        }
        if (node[PrefixLookupTrieEndSymbol] && filter(prefix)) {
            node[PrefixLookupTrieEndSymbol] = false;
            values.push(prefix);
        }
        return values;
    }
}
/**
 * @param appDirectory The base directory of your app
 * @param ignoredFilePatterns An array of glob patterns to ignore
 */
function routeExtensions(appDirectory, ignoredFilePatterns = []) {
    let ignoredFileRegex = ignoredFilePatterns.map((pattern) => {
        return (0, glob_to_regexp_1.default)(pattern);
    });
    let rootRoute = findConfig(appDirectory, "root", routeModuleExts);
    if (!rootRoute) {
        throw new Error(`Could not find a root route module in the app directory: ${appDirectory}`);
    }
    // Only read the routes directory
    let entries = node_fs_1.default.readdirSync(appDirectory, {
        withFileTypes: true,
        encoding: "utf-8",
    });
    let routes = [];
    for (let entry of entries) {
        // If it's a directory, don't recurse into it, instead just look for a route module
        if (entry.isDirectory()) {
            const routesInFolders = findRouteModulesForFolder(appDirectory, entry.name, ignoredFileRegex);
            if (routesInFolders.length) {
                routes.push(...routesInFolders);
            }
        }
        else if (entry.isFile()) {
            const route = findRouteModuleForFile(entry.name, ignoredFileRegex);
            if (route) {
                routes.push(route);
            }
        }
    }
    console.log({ routes });
    let routeManifest = routeExtensionsImpl(appDirectory, routes);
    return routeManifest;
}
exports.routeExtensions = routeExtensions;
function routeExtensionsImpl(appDirectory, routes) {
    let urlConflicts = new Map();
    let routeManifest = {};
    let prefixLookup = new PrefixLookupTrie();
    let uniqueRoutes = new Map();
    let routeIdConflicts = new Map();
    // id -> file
    let routeIds = new Map();
    for (let file of routes) {
        let normalizedFile = normalizeSlashes(file);
        let routeExt = node_path_1.default.extname(normalizedFile);
        let normalizedApp = normalizeSlashes(appDirectory);
        let basename = node_path_1.default.basename(file);
        let routeId = basename.slice(0, 0 - routeExt.length - ".route".length);
        let conflict = routeIds.get(routeId);
        if (conflict) {
            let currentConflicts = routeIdConflicts.get(routeId);
            if (!currentConflicts) {
                currentConflicts = [node_path_1.default.posix.relative(normalizedApp, conflict)];
            }
            currentConflicts.push(node_path_1.default.posix.relative(normalizedApp, normalizedFile));
            routeIdConflicts.set(routeId, currentConflicts);
            continue;
        }
        routeIds.set(routeId, normalizedFile);
    }
    let sortedRouteIds = Array.from(routeIds).sort(([a], [b]) => b.length - a.length);
    for (let [routeId, file] of sortedRouteIds) {
        let routeIdNoFeature = routeId.slice(0);
        let noRouteEnding = routeIdNoFeature.replace(".route", "");
        let isIndex = noRouteEnding.endsWith("_index");
        let [segments, raw] = getRouteSegments(noRouteEnding);
        let pathname = createRoutePath(segments, raw, isIndex);
        routeManifest[routeId] = {
            file,
            id: routeId,
            path: pathname,
        };
        if (isIndex)
            routeManifest[routeId].index = true;
        let childRouteIds = prefixLookup.findAndRemove(routeId, (value) => {
            return [".", "/"].includes(value.slice(routeId.length).charAt(0));
        });
        prefixLookup.add(routeId);
        if (childRouteIds.length > 0) {
            for (let childRouteId of childRouteIds) {
                routeManifest[childRouteId].parentId = routeId;
            }
        }
    }
    // path creation
    let parentChildrenMap = new Map();
    for (let [routeId] of sortedRouteIds) {
        let config = routeManifest[routeId];
        if (!config.parentId)
            continue;
        let existingChildren = parentChildrenMap.get(config.parentId) || [];
        existingChildren.push(config);
        parentChildrenMap.set(config.parentId, existingChildren);
    }
    for (let [routeId] of sortedRouteIds) {
        let config = routeManifest[routeId];
        let originalPathname = config.path || "";
        let pathname = config.path;
        let parentConfig = config.parentId ? routeManifest[config.parentId] : null;
        if (parentConfig?.path && pathname) {
            pathname = pathname
                .slice(parentConfig.path.length)
                .replace(/^\//, "")
                .replace(/\/$/, "");
        }
        let conflictRouteId = originalPathname + (config.index ? "?index" : "");
        let conflict = uniqueRoutes.get(conflictRouteId);
        if (!config.parentId)
            config.parentId = "root";
        config.path = pathname || undefined;
        uniqueRoutes.set(conflictRouteId, config);
        if (conflict && (originalPathname || config.index)) {
            let currentConflicts = urlConflicts.get(originalPathname);
            if (!currentConflicts)
                currentConflicts = [conflict];
            currentConflicts.push(config);
            urlConflicts.set(originalPathname, currentConflicts);
            continue;
        }
    }
    if (routeIdConflicts.size > 0) {
        for (let [routeId, files] of routeIdConflicts.entries()) {
            console.error(getRouteIdConflictErrorMessage(routeId, files));
        }
    }
    // report conflicts
    if (urlConflicts.size > 0) {
        for (let [path, routes] of urlConflicts.entries()) {
            // delete all but the first route from the manifest
            for (let i = 1; i < routes.length; i++) {
                delete routeManifest[routes[i].id];
            }
            let files = routes.map((r) => r.file);
            console.error(getRoutePathConflictErrorMessage(path, files));
        }
    }
    return routeManifest;
}
exports.routeExtensionsImpl = routeExtensionsImpl;
function findRouteModuleForFile(filepath, ignoredFileRegex) {
    let ext = node_path_1.default.extname(filepath);
    let basename = node_path_1.default.basename(filepath, ext);
    if (!basename.endsWith(".route"))
        return null;
    let isIgnored = ignoredFileRegex.some((regex) => regex.test(filepath));
    if (isIgnored)
        return null;
    return filepath;
}
function findRouteModulesForFolder(appDirectory, filepath, ignoredFileRegex) {
    let dirEntries = node_fs_1.default.readdirSync(node_path_1.default.join(appDirectory, filepath), {
        withFileTypes: true,
        encoding: "utf-8",
    });
    let filesOrDirs = dirEntries.filter((e) => {
        if (e.isDirectory())
            return true;
        let ext = node_path_1.default.extname(e.name);
        let base = node_path_1.default.basename(e.name, ext);
        return base.endsWith(".route");
    });
    let routes = [];
    for (let fileOrDir of filesOrDirs) {
        if (!fileOrDir)
            continue;
        let isIgnored = ignoredFileRegex.some((regex) => regex.test(fileOrDir.name));
        if (isIgnored)
            continue;
        if (fileOrDir.isDirectory()) {
            routes.push(...findRouteModulesForFolder(appDirectory, node_path_1.default.join(filepath, fileOrDir.name), ignoredFileRegex));
        }
        else {
            routes.push(node_path_1.default.join(filepath, fileOrDir.name));
        }
    }
    return routes;
}
function getRouteSegments(routeId) {
    let routeSegments = [];
    let rawRouteSegments = [];
    let index = 0;
    let routeSegment = "";
    let rawRouteSegment = "";
    let state = "NORMAL";
    let pushRouteSegment = (segment, rawSegment) => {
        if (!segment)
            return;
        let notSupportedInRR = (segment, char) => {
            throw new Error(`Route segment "${segment}" for "${routeId}" cannot contain "${char}".\n` +
                `If this is something you need, upvote this proposal for React Router https://github.com/remix-run/react-router/discussions/9822.`);
        };
        if (rawSegment.includes("*")) {
            return notSupportedInRR(rawSegment, "*");
        }
        if (rawSegment.includes(":")) {
            return notSupportedInRR(rawSegment, ":");
        }
        if (rawSegment.includes("/")) {
            return notSupportedInRR(segment, "/");
        }
        routeSegments.push(segment);
        rawRouteSegments.push(rawSegment);
    };
    while (index < routeId.length) {
        let char = routeId[index];
        index++; //advance to next char
        switch (state) {
            case "NORMAL": {
                if (isSegmentSeparator(char)) {
                    pushRouteSegment(routeSegment, rawRouteSegment);
                    routeSegment = "";
                    rawRouteSegment = "";
                    state = "NORMAL";
                    break;
                }
                if (char === escapeStart) {
                    state = "ESCAPE";
                    rawRouteSegment += char;
                    break;
                }
                if (char === optionalStart) {
                    state = "OPTIONAL";
                    rawRouteSegment += char;
                    break;
                }
                if (!routeSegment && char == paramPrefixChar) {
                    if (index === routeId.length) {
                        routeSegment += "*";
                        rawRouteSegment += char;
                    }
                    else {
                        routeSegment += ":";
                        rawRouteSegment += char;
                    }
                    break;
                }
                routeSegment += char;
                rawRouteSegment += char;
                break;
            }
            case "ESCAPE": {
                if (char === escapeEnd) {
                    state = "NORMAL";
                    rawRouteSegment += char;
                    break;
                }
                routeSegment += char;
                rawRouteSegment += char;
                break;
            }
            case "OPTIONAL": {
                if (char === optionalEnd) {
                    routeSegment += "?";
                    rawRouteSegment += char;
                    state = "NORMAL";
                    break;
                }
                if (char === escapeStart) {
                    state = "OPTIONAL_ESCAPE";
                    rawRouteSegment += char;
                    break;
                }
                if (!routeSegment && char === paramPrefixChar) {
                    if (index === routeId.length) {
                        routeSegment += "*";
                        rawRouteSegment += char;
                    }
                    else {
                        routeSegment += ":";
                        rawRouteSegment += char;
                    }
                    break;
                }
                routeSegment += char;
                rawRouteSegment += char;
                break;
            }
            case "OPTIONAL_ESCAPE": {
                if (char === escapeEnd) {
                    state = "OPTIONAL";
                    rawRouteSegment += char;
                    break;
                }
                routeSegment += char;
                rawRouteSegment += char;
                break;
            }
        }
    }
    // process remaining segment
    pushRouteSegment(routeSegment, rawRouteSegment);
    return [routeSegments, rawRouteSegments];
}
exports.getRouteSegments = getRouteSegments;
function createRoutePath(routeSegments, rawRouteSegments, isIndex) {
    let result = [];
    if (isIndex) {
        routeSegments = routeSegments.slice(0, -1);
    }
    for (let index = 0; index < routeSegments.length; index++) {
        let segment = routeSegments[index];
        let rawSegment = rawRouteSegments[index];
        // skip pathless layout segments
        if (segment.startsWith("_") && rawSegment.startsWith("_")) {
            continue;
        }
        // remove trailing slash
        if (segment.endsWith("_") && rawSegment.endsWith("_")) {
            segment = segment.slice(0, -1);
        }
        result.push(segment);
    }
    return result.length ? result.join("/") : undefined;
}
exports.createRoutePath = createRoutePath;
function getRoutePathConflictErrorMessage(pathname, routes) {
    let [taken, ...others] = routes;
    if (!pathname.startsWith("/")) {
        pathname = "/" + pathname;
    }
    return (`⚠️ Route Path Collision: "${pathname}"\n\n` +
        `The following routes all define the same URL, only the first one will be used\n\n` +
        `🟢 ${taken}\n` +
        others.map((route) => `⭕️️ ${route}`).join("\n") +
        "\n");
}
exports.getRoutePathConflictErrorMessage = getRoutePathConflictErrorMessage;
function getRouteIdConflictErrorMessage(routeId, files) {
    let [taken, ...others] = files;
    return (`⚠️ Route ID Collision: "${routeId}"\n\n` +
        `The following routes all define the same Route ID, only the first one will be used\n\n` +
        `🟢 ${taken}\n` +
        others.map((route) => `⭕️️ ${route}`).join("\n") +
        "\n");
}
exports.getRouteIdConflictErrorMessage = getRouteIdConflictErrorMessage;
