//@target illustrator
/*
 * ExporterPlansTravail.jsx — v1.0.0
 * ---------------------------------------------------------------------------
 * FR : Export par lot des plans de travail (tous, actif, liste ou plage) en
 *      PNG-24, JPEG, SVG et/ou PDF, avec modèle de nommage, résolution (ppp),
 *      couleur de fond, dossier de sortie et résumé final.
 * EN : Batch export of artboards (all, active, list or range) to PNG-24,
 *      JPEG, SVG and/or PDF, with a file-naming template, resolution (ppi),
 *      background colour, output folder and final summary.
 *
 * Cible / Target : Adobe Illustrator CC 2018 – 2026 (ExtendScript, ES3)
 * Statut / Status : non testé dans Illustrator / not tested in Illustrator
 *                   (syntaxe vérifiée / syntax checked with acorn).
 *
 * Le script ne modifie pas l'illustration. Seul le plan de travail actif est
 * changé pendant l'export puis restauré. L'export PDF passe par
 * « Enregistrer sous » : le document doit donc être enregistré ; il est fermé
 * puis rouvert à la fin.
 * The script never edits the artwork. Only the active artboard is changed
 * during export, then restored. PDF export uses "Save As", so the document
 * must be saved; it is closed and reopened at the end.
 *
 * Aucun appel réseau, aucune collecte de données.
 * No network access, no data collection.
 *
 * © 2026 Amirouche Amwanes — Licence MIT / MIT License
 */

(function () {

    // =====================================================================
    // Constantes / Constants
    // =====================================================================
    var SCRIPT_NAME = "ExporterPlansTravail";
    var SCRIPT_VERSION = "1.0.0";

    // exportFile() accepte une échelle maximale d'environ 776 %.
    // exportFile() accepts a maximum scale of about 776 %.
    var MAX_SCALE = 776;
    var MAX_DPI = Math.floor(MAX_SCALE * 72 / 100); // = 558 ppp / ppi
    var DPI_PRESETS = [72, 150, 300];
    var MAX_ERRORS_SHOWN = 12;

    // =====================================================================
    // Textes FR / EN — UI strings
    // =====================================================================
    var STR = {
        fr: {
            title: "Exporter les plans de travail",
            noDoc: "Aucun document ouvert.\nOuvrez un document Illustrator puis relancez le script.",
            noArtboard: "Le document actif ne contient aucun plan de travail.",
            langLabel: "Langue / Language :",
            pnlArtboards: "Plans de travail",
            scopeAll: "Tous (%1)",
            scopeActive: "Actif : %1",
            scopeList: "Choisis dans la liste :",
            scopeRange: "Plage :",
            rangeHint: "ex. 1-3, 5, 8-10",
            selectedCount: "%1 plan(s) sélectionné(s)",
            pnlFormats: "Formats",
            fmtPng: "PNG-24",
            fmtJpg: "JPEG",
            fmtSvg: "SVG",
            fmtPdf: "PDF",
            pngTransparent: "Fond transparent",
            jpgQuality: "Qualité :",
            svgOutline: "Vectoriser le texte",
            svgEmbed: "Incorporer les images",
            pdfPreset: "Paramètre prédéfini :",
            pdfDefault: "(réglages par défaut)",
            pdfPerArtboard: "Un fichier par plan",
            pdfMultipage: "Un seul PDF multipage",
            pdfNote: "PDF : utilise « Enregistrer sous ». Le document doit être enregistré ; il sera fermé puis rouvert.",
            pnlRaster: "Options raster (PNG / JPEG)",
            dpiLabel: "Résolution :",
            dpiCustom: "Personnalisée",
            dpiUnit: "ppp (max %1)",
            pixelInfo: "1er plan : %1 × %2 px",
            pixelInfoNone: "1er plan : —",
            bgLabel: "Fond (hex) :",
            bgHint: "utilisé si pas de transparence",
            antiAlias: "Lissage (anticrénelage)",
            pnlNaming: "Nommage des fichiers",
            templateLabel: "Modèle :",
            tokens: "{doc} nom du document · {artboard} nom du plan\n{n} numéro · {nn} / {nnn} numéro sur 2 / 3 chiffres\n{i} rang dans l'export · {dpi} résolution · {date} AAAA-MM-JJ",
            previewLabel: "Aperçu : ",
            pdfMultiName: "PDF multipage : {doc}.pdf",
            pnlOutput: "Dossier de sortie",
            browse: "Parcourir…",
            chooseFolder: "Choisissez le dossier de sortie",
            noFolder: "(aucun dossier choisi)",
            subfolders: "Un sous-dossier par format (PNG, JPG, SVG, PDF)",
            overwrite: "Écraser les fichiers existants",
            openFolder: "Ouvrir le dossier à la fin",
            btnExport: "Exporter",
            btnCancel: "Annuler",
            errNoFormat: "Cochez au moins un format d'export.",
            errRange: "Plage invalide : « %1 ».\nUtilisez des numéros entre 1 et %2, par ex. 1-3, 5, 8-10.",
            errList: "Sélectionnez au moins un plan de travail dans la liste.",
            errDpi: "Résolution invalide. Entrez une valeur entre 1 et %1 ppp.",
            errQuality: "Qualité JPEG invalide (0 à 100).",
            errBg: "Couleur de fond invalide. Utilisez 6 chiffres hexadécimaux, par ex. FFFFFF.",
            errTemplate: "Le modèle de nom est vide.",
            errFolder: "Choisissez un dossier de sortie.",
            errFolderCreate: "Impossible de créer le dossier :\n%1",
            errPdfUnsaved: "L'export PDF nécessite un document déjà enregistré, sans modifications en attente.\nEnregistrez le document (Fichier > Enregistrer) puis relancez, ou décochez PDF.",
            errNotCreated: "fichier non créé",
            errSvgMissing: "Illustrator n'a produit aucun fichier SVG",
            errMove: "impossible de déplacer le fichier temporaire",
            progressTitle: "Export en cours…",
            summaryOk: "%1 fichier(s) exporté(s) dans :\n%2",
            summaryNone: "Aucun fichier n'a été exporté.",
            summaryErrors: "%1 erreur(s) :",
            summaryMore: "… et %1 autre(s).",
            reopenFail: "Le document n'a pas pu être rouvert automatiquement (%1). Rouvrez-le depuis : %2",
            fatal: "Erreur inattendue : %1"
        },
        en: {
            title: "Export artboards",
            noDoc: "No document is open.\nOpen an Illustrator document and run the script again.",
            noArtboard: "The active document has no artboard.",
            langLabel: "Langue / Language:",
            pnlArtboards: "Artboards",
            scopeAll: "All (%1)",
            scopeActive: "Active: %1",
            scopeList: "Pick from the list:",
            scopeRange: "Range:",
            rangeHint: "e.g. 1-3, 5, 8-10",
            selectedCount: "%1 artboard(s) selected",
            pnlFormats: "Formats",
            fmtPng: "PNG-24",
            fmtJpg: "JPEG",
            fmtSvg: "SVG",
            fmtPdf: "PDF",
            pngTransparent: "Transparent background",
            jpgQuality: "Quality:",
            svgOutline: "Convert text to outlines",
            svgEmbed: "Embed images",
            pdfPreset: "Preset:",
            pdfDefault: "(default settings)",
            pdfPerArtboard: "One file per artboard",
            pdfMultipage: "Single multipage PDF",
            pdfNote: "PDF uses \"Save As\". The document must be saved; it will be closed and reopened.",
            pnlRaster: "Raster options (PNG / JPEG)",
            dpiLabel: "Resolution:",
            dpiCustom: "Custom",
            dpiUnit: "ppi (max %1)",
            pixelInfo: "1st artboard: %1 × %2 px",
            pixelInfoNone: "1st artboard: —",
            bgLabel: "Background (hex):",
            bgHint: "used when not transparent",
            antiAlias: "Anti-aliasing",
            pnlNaming: "File naming",
            templateLabel: "Template:",
            tokens: "{doc} document name · {artboard} artboard name\n{n} number · {nn} / {nnn} number on 2 / 3 digits\n{i} rank in export · {dpi} resolution · {date} YYYY-MM-DD",
            previewLabel: "Preview: ",
            pdfMultiName: "Multipage PDF: {doc}.pdf",
            pnlOutput: "Output folder",
            browse: "Browse…",
            chooseFolder: "Choose the output folder",
            noFolder: "(no folder selected)",
            subfolders: "One subfolder per format (PNG, JPG, SVG, PDF)",
            overwrite: "Overwrite existing files",
            openFolder: "Open the folder when done",
            btnExport: "Export",
            btnCancel: "Cancel",
            errNoFormat: "Tick at least one export format.",
            errRange: "Invalid range: \"%1\".\nUse numbers between 1 and %2, e.g. 1-3, 5, 8-10.",
            errList: "Select at least one artboard in the list.",
            errDpi: "Invalid resolution. Enter a value between 1 and %1 ppi.",
            errQuality: "Invalid JPEG quality (0 to 100).",
            errBg: "Invalid background colour. Use 6 hexadecimal digits, e.g. FFFFFF.",
            errTemplate: "The file-name template is empty.",
            errFolder: "Choose an output folder.",
            errFolderCreate: "Cannot create the folder:\n%1",
            errPdfUnsaved: "PDF export needs a document that is already saved, with no pending changes.\nSave the document (File > Save) and run again, or untick PDF.",
            errNotCreated: "file not created",
            errSvgMissing: "Illustrator produced no SVG file",
            errMove: "cannot move the temporary file",
            progressTitle: "Exporting…",
            summaryOk: "%1 file(s) exported to:\n%2",
            summaryNone: "No file was exported.",
            summaryErrors: "%1 error(s):",
            summaryMore: "… and %1 more.",
            reopenFail: "The document could not be reopened automatically (%1). Reopen it from: %2",
            fatal: "Unexpected error: %1"
        }
    };

    var lang = detectLang();

    // Détecte la langue d'Illustrator / Detects Illustrator's UI language
    function detectLang() {
        var loc = "";
        try { loc = String(app.locale); } catch (e) { loc = ""; }
        if (loc === "" || loc === "undefined") {
            try { loc = String($.locale); } catch (e2) { loc = ""; }
        }
        return (loc.toLowerCase().indexOf("fr") === 0) ? "fr" : "en";
    }

    // Traduction avec paramètres %1, %2… / Translation with %1, %2… params
    function tr(key) {
        var table = STR[lang] || STR.en;
        var s = table.hasOwnProperty(key) ? table[key] : (STR.en.hasOwnProperty(key) ? STR.en[key] : key);
        for (var a = 1; a < arguments.length; a++) {
            s = s.split("%" + a).join(String(arguments[a]));
        }
        return s;
    }

    // =====================================================================
    // Utilitaires / Utilities
    // =====================================================================
    function trim(s) {
        return String(s).replace(/^\s+/, "").replace(/\s+$/, "");
    }

    function pad(num, width) {
        var s = String(num);
        while (s.length < width) { s = "0" + s; }
        return s;
    }

    function replaceAll(s, find, rep) {
        return String(s).split(find).join(rep);
    }

    function todayString() {
        var d = new Date();
        return d.getFullYear() + "-" + pad(d.getMonth() + 1, 2) + "-" + pad(d.getDate(), 2);
    }

    // Nettoie un nom de fichier (caractères interdits Windows/macOS)
    // Cleans a file name (characters forbidden on Windows/macOS)
    function sanitizeFileName(s) {
        s = String(s).replace(/[\\\/:\*\?"<>\|%]/g, "_");
        s = s.replace(/[\x00-\x1F]/g, "");
        s = trim(s).replace(/[\. ]+$/, "");
        if (s.length > 180) { s = s.substring(0, 180); }
        return s;
    }

    function stripExtension(name) {
        return String(name).replace(/\.[A-Za-z0-9]{1,5}$/, "");
    }

    function isHex6(s) {
        return /^#?[0-9A-Fa-f]{6}$/.test(trim(s));
    }

    function hexToRGB(hex) {
        var h = trim(hex).replace(/^#/, "");
        var c = new RGBColor();
        c.red = parseInt(h.substring(0, 2), 16);
        c.green = parseInt(h.substring(2, 4), 16);
        c.blue = parseInt(h.substring(4, 6), 16);
        return c;
    }

    function numberFrom(s) {
        var t = trim(s).replace(",", ".");
        if (!/^\d+(\.\d+)?$/.test(t)) { return NaN; }
        return parseFloat(t);
    }

    function containsValue(arr, v) {
        for (var i = 0; i < arr.length; i++) { if (arr[i] === v) { return true; } }
        return false;
    }

    // Analyse « 1-3, 5, 8-10 » → [0,1,2,4,7,8,9] (index base 0), null si invalide
    // Parses "1-3, 5, 8-10" → [0,1,2,4,7,8,9] (0-based), null if invalid
    function parseRange(text, count) {
        var parts = trim(text).split(/[,;]+/);
        var out = [];
        var i, p, m, a, b, tmp, k;
        if (trim(text) === "") { return null; }
        for (i = 0; i < parts.length; i++) {
            p = trim(parts[i]);
            if (p === "") { continue; }
            m = p.match(/^(\d+)\s*-\s*(\d+)$/);
            if (m) {
                a = parseInt(m[1], 10);
                b = parseInt(m[2], 10);
                if (a > b) { tmp = a; a = b; b = tmp; }
            } else if (/^\d+$/.test(p)) {
                a = parseInt(p, 10);
                b = a;
            } else {
                return null;
            }
            if (a < 1 || b > count) { return null; }
            for (k = a; k <= b; k++) {
                if (!containsValue(out, k - 1)) { out.push(k - 1); }
            }
        }
        return out.length ? out : null;
    }

    // Transforme une liste d'index (base 0) en chaîne « 1-3,5 » pour Illustrator
    // Turns a 0-based index list into a "1-3,5" string for Illustrator
    function indicesToRangeString(indices) {
        var sorted = indices.slice(0).sort(function (x, y) { return x - y; });
        var out = [];
        var start = sorted[0];
        var prev = sorted[0];
        for (var i = 1; i <= sorted.length; i++) {
            if (i < sorted.length && sorted[i] === prev + 1) {
                prev = sorted[i];
                continue;
            }
            out.push(start === prev ? String(start + 1) : (start + 1) + "-" + (prev + 1));
            if (i < sorted.length) { start = sorted[i]; prev = sorted[i]; }
        }
        return out.join(",");
    }

    function sameFile(f1, f2) {
        if (!f1 || !f2) { return false; }
        try {
            return String(f1.fsName).toLowerCase() === String(f2.fsName).toLowerCase();
        } catch (e) { return false; }
    }

    // Affecte une propriété seulement si l'énumération existe (versions)
    // Sets a property only when the enum exists (version safety)
    function trySet(obj, prop, valueFn) {
        try {
            var v = valueFn();
            if (v !== undefined && v !== null) { obj[prop] = v; }
        } catch (e) { /* ignoré / ignored */ }
    }

    function errText(e) {
        if (!e) { return "?"; }
        return (e.message ? e.message : String(e)) + (e.line ? " (l. " + e.line + ")" : "");
    }

    // =====================================================================
    // Vérifications initiales / Initial checks
    // =====================================================================
    if (app.documents.length === 0) {
        alert(tr("noDoc"), SCRIPT_NAME);
        return;
    }

    var doc = app.activeDocument;
    var abCount = doc.artboards.length;
    if (abCount === 0) {
        alert(tr("noArtboard"), SCRIPT_NAME);
        return;
    }

    // État du document au lancement / Document state at launch
    var docState = (function () {
        var st = { file: null, folder: null, isSavedClean: false, activeIndex: 0, baseName: "" };
        try { st.activeIndex = doc.artboards.getActiveArtboardIndex(); } catch (e) { st.activeIndex = 0; }
        try {
            var f = new File(doc.fullName);
            if (f.exists) { st.file = f; st.folder = f.parent; }
        } catch (e2) { st.file = null; }
        try { st.isSavedClean = (st.file !== null) && (doc.saved === true); } catch (e3) { st.isSavedClean = false; }
        st.baseName = sanitizeFileName(stripExtension(doc.name));
        if (st.baseName === "") { st.baseName = "document"; }
        return st;
    })();

    // Paramètres prédéfinis PDF / PDF presets
    var pdfPresets = [];
    try {
        var pl = app.PDFPresetsList;
        for (var pi = 0; pi < pl.length; pi++) { pdfPresets.push(String(pl[pi])); }
    } catch (ePl) { pdfPresets = []; }

    function defaultPresetIndex() {
        // 0 = réglages par défaut ; sinon on préfère « Qualité supérieure » / « High Quality Print »
        for (var i = 0; i < pdfPresets.length; i++) {
            if (/High Quality|Qualit\u00e9 sup\u00e9rieure/i.test(pdfPresets[i])) { return i + 1; }
        }
        return 0;
    }

    // Réglages (conservés si on change de langue) / Settings (kept on language switch)
    var settings = {
        scope: "all",          // all | active | list | range
        listSel: [docState.activeIndex],
        rangeText: "",
        png: true,
        jpg: false,
        svg: false,
        pdf: false,
        pngTransparent: true,
        jpgQuality: 80,
        svgOutline: false,
        svgEmbed: true,
        pdfPresetIndex: defaultPresetIndex(),
        pdfMultipage: false,
        dpiChoice: 2,          // 0=72, 1=150, 2=300, 3=custom
        dpiCustomText: "200",
        dpi: 300,
        bgHex: "FFFFFF",
        antiAlias: true,
        template: "{doc}_{artboard}_{nn}",
        folder: docState.folder,
        subfolders: false,
        overwrite: false,
        openFolder: false
    };

    // =====================================================================
    // Sélection des plans / Artboard selection
    // =====================================================================
    function resolveIndices(s) {
        var i, out = [];
        if (s.scope === "active") {
            return [docState.activeIndex];
        }
        if (s.scope === "list") {
            for (i = 0; i < s.listSel.length; i++) { out.push(s.listSel[i]); }
            return out.length ? out.sort(function (x, y) { return x - y; }) : null;
        }
        if (s.scope === "range") {
            return parseRange(s.rangeText, abCount);
        }
        for (i = 0; i < abCount; i++) { out.push(i); }
        return out;
    }

    function currentDpi(s) {
        if (s.dpiChoice < DPI_PRESETS.length) { return DPI_PRESETS[s.dpiChoice]; }
        return numberFrom(s.dpiCustomText);
    }

    // Construit le nom de base à partir du modèle / Builds base name from template
    function buildBaseName(template, ctx) {
        var s = String(template);
        s = replaceAll(s, "{doc}", ctx.docName);
        s = replaceAll(s, "{artboard}", ctx.abName);
        s = replaceAll(s, "{nnn}", pad(ctx.n, 3));
        s = replaceAll(s, "{nn}", pad(ctx.n, 2));
        s = replaceAll(s, "{n}", String(ctx.n));
        s = replaceAll(s, "{i}", String(ctx.i));
        s = replaceAll(s, "{dpi}", String(ctx.dpi));
        s = replaceAll(s, "{date}", ctx.date);
        s = sanitizeFileName(s);
        if (s === "") { s = docState.baseName + "_" + pad(ctx.n, 2); }
        return s;
    }

    function makeCtx(index, rank, dpi) {
        var abName = "";
        try { abName = String(doc.artboards[index].name); } catch (e) { abName = "artboard"; }
        return {
            docName: docState.baseName,
            abName: abName,
            n: index + 1,
            i: rank + 1,
            dpi: isNaN(dpi) ? "" : Math.round(dpi),
            date: todayString()
        };
    }

    // Vérifie les réglages ; renvoie "" ou un message / Validates settings
    function validate(s) {
        var dpi;
        if (!s.png && !s.jpg && !s.svg && !s.pdf) { return tr("errNoFormat"); }
        if (s.scope === "range" && resolveIndices(s) === null) { return tr("errRange", s.rangeText, abCount); }
        if (s.scope === "list" && resolveIndices(s) === null) { return tr("errList"); }
        if (s.png || s.jpg) {
            dpi = currentDpi(s);
            if (isNaN(dpi) || dpi < 1 || dpi > MAX_DPI) { return tr("errDpi", MAX_DPI); }
            if (!isHex6(s.bgHex)) { return tr("errBg"); }
        }
        if (s.jpg && (isNaN(s.jpgQuality) || s.jpgQuality < 0 || s.jpgQuality > 100)) { return tr("errQuality"); }
        if (trim(s.template) === "") { return tr("errTemplate"); }
        if (!s.folder) { return tr("errFolder"); }
        if (s.pdf && !docState.isSavedClean) { return tr("errPdfUnsaved"); }
        return "";
    }

    // =====================================================================
    // Dialogue ScriptUI / ScriptUI dialog
    // Renvoie "ok", "cancel" ou "lang" / Returns "ok", "cancel" or "lang"
    // =====================================================================
    function showDialog() {
        var w = new Window("dialog", tr("title") + " — v" + SCRIPT_VERSION);
        w.orientation = "column";
        w.alignChildren = ["fill", "top"];
        w.spacing = 10;
        w.margins = 14;

        // --- Langue / Language ---
        var gLang = w.add("group");
        gLang.alignment = ["right", "top"];
        gLang.add("statictext", undefined, tr("langLabel"));
        var ddLang = gLang.add("dropdownlist", undefined, ["Français", "English"]);
        ddLang.selection = (lang === "fr") ? 0 : 1;

        var gCols = w.add("group");
        gCols.orientation = "row";
        gCols.alignChildren = ["fill", "top"];
        gCols.spacing = 12;

        var colL = gCols.add("group");
        colL.orientation = "column";
        colL.alignChildren = ["fill", "top"];
        colL.preferredSize.width = 330;

        var colR = gCols.add("group");
        colR.orientation = "column";
        colR.alignChildren = ["fill", "top"];
        colR.preferredSize.width = 330;

        // --- Plans de travail / Artboards ---
        var pAb = colL.add("panel", undefined, tr("pnlArtboards"));
        pAb.alignChildren = ["fill", "top"];
        pAb.margins = [12, 16, 12, 10];
        var activeName = "";
        try { activeName = (docState.activeIndex + 1) + " — " + doc.artboards[docState.activeIndex].name; } catch (eA) { activeName = String(docState.activeIndex + 1); }
        var rbAll = pAb.add("radiobutton", undefined, tr("scopeAll", abCount));
        var rbActive = pAb.add("radiobutton", undefined, tr("scopeActive", activeName));
        var rbList = pAb.add("radiobutton", undefined, tr("scopeList"));
        var items = [];
        for (var ai = 0; ai < abCount; ai++) {
            items.push((ai + 1) + " — " + doc.artboards[ai].name);
        }
        var lbAb = pAb.add("listbox", undefined, items, { multiselect: true });
        lbAb.preferredSize = [300, 110];
        var gRange = pAb.add("group");
        var rbRange = gRange.add("radiobutton", undefined, tr("scopeRange"));
        var etRange = gRange.add("edittext", undefined, settings.rangeText);
        etRange.characters = 14;
        gRange.add("statictext", undefined, tr("rangeHint"));
        var stCount = pAb.add("statictext", undefined, "");
        stCount.characters = 34;

        // Les boutons radio ne sont pas dans le même groupe : on gère l'exclusion
        // Radio buttons live in different groups: handle exclusivity manually
        var radios = [rbAll, rbActive, rbList, rbRange];
        var scopes = ["all", "active", "list", "range"];
        function setScope(sc) {
            for (var r = 0; r < radios.length; r++) { radios[r].value = (scopes[r] === sc); }
            lbAb.enabled = (sc === "list");
            etRange.enabled = (sc === "range");
        }
        function bindRadio(rb, sc) {
            rb.onClick = function () { setScope(sc); refresh(); };
        }
        for (var rr = 0; rr < radios.length; rr++) { bindRadio(radios[rr], scopes[rr]); }

        for (var ls = 0; ls < settings.listSel.length; ls++) {
            if (settings.listSel[ls] < lbAb.items.length) { lbAb.items[settings.listSel[ls]].selected = true; }
        }

        // --- Nommage / Naming ---
        var pName = colL.add("panel", undefined, tr("pnlNaming"));
        pName.alignChildren = ["fill", "top"];
        pName.margins = [12, 16, 12, 10];
        var gTpl = pName.add("group");
        gTpl.add("statictext", undefined, tr("templateLabel"));
        var etTpl = gTpl.add("edittext", undefined, settings.template);
        etTpl.characters = 26;
        pName.add("statictext", undefined, tr("tokens"), { multiline: true }).preferredSize = [300, 48];
        var stPreview = pName.add("statictext", undefined, "", { truncate: "middle" });
        stPreview.preferredSize = [300, 18];
        var stPdfName = pName.add("statictext", undefined, "");
        stPdfName.preferredSize = [300, 18];

        // --- Sortie / Output ---
        var pOut = colL.add("panel", undefined, tr("pnlOutput"));
        pOut.alignChildren = ["fill", "top"];
        pOut.margins = [12, 16, 12, 10];
        var gFolder = pOut.add("group");
        var stFolder = gFolder.add("statictext", undefined, "", { truncate: "middle" });
        stFolder.preferredSize = [210, 18];
        var btBrowse = gFolder.add("button", undefined, tr("browse"));
        var cbSub = pOut.add("checkbox", undefined, tr("subfolders"));
        cbSub.value = settings.subfolders;
        var cbOver = pOut.add("checkbox", undefined, tr("overwrite"));
        cbOver.value = settings.overwrite;
        var cbOpen = pOut.add("checkbox", undefined, tr("openFolder"));
        cbOpen.value = settings.openFolder;

        function showFolder() {
            stFolder.text = settings.folder ? settings.folder.fsName : tr("noFolder");
            stFolder.helpTip = stFolder.text;
        }
        btBrowse.onClick = function () {
            var start = settings.folder || Folder.desktop;
            var chosen = null;
            // Folder.selectDlg ouvre le dialogue sur le dossier courant ;
            // repli sur Folder.selectDialog seulement en cas d'erreur.
            // selectDlg opens at the current folder; fall back only on error.
            try { chosen = start.selectDlg(tr("chooseFolder")); }
            catch (eS) { chosen = Folder.selectDialog(tr("chooseFolder")); }
            if (chosen) { settings.folder = chosen; showFolder(); }
        };

        // --- Formats ---
        var pFmt = colR.add("panel", undefined, tr("pnlFormats"));
        pFmt.alignChildren = ["fill", "top"];
        pFmt.margins = [12, 16, 12, 10];

        var gPng = pFmt.add("group");
        var cbPng = gPng.add("checkbox", undefined, tr("fmtPng"));
        cbPng.preferredSize.width = 70;
        var cbTransp = gPng.add("checkbox", undefined, tr("pngTransparent"));
        cbPng.value = settings.png;
        cbTransp.value = settings.pngTransparent;

        var gJpg = pFmt.add("group");
        var cbJpg = gJpg.add("checkbox", undefined, tr("fmtJpg"));
        cbJpg.preferredSize.width = 70;
        gJpg.add("statictext", undefined, tr("jpgQuality"));
        var slQ = gJpg.add("slider", undefined, settings.jpgQuality, 0, 100);
        slQ.preferredSize.width = 110;
        var etQ = gJpg.add("edittext", undefined, String(settings.jpgQuality));
        etQ.characters = 4;
        cbJpg.value = settings.jpg;

        var gSvg = pFmt.add("group");
        var cbSvg = gSvg.add("checkbox", undefined, tr("fmtSvg"));
        cbSvg.preferredSize.width = 70;
        var cbOutline = gSvg.add("checkbox", undefined, tr("svgOutline"));
        var cbEmbed = gSvg.add("checkbox", undefined, tr("svgEmbed"));
        cbSvg.value = settings.svg;
        cbOutline.value = settings.svgOutline;
        cbEmbed.value = settings.svgEmbed;

        var gPdf = pFmt.add("group");
        var cbPdf = gPdf.add("checkbox", undefined, tr("fmtPdf"));
        cbPdf.preferredSize.width = 70;
        gPdf.add("statictext", undefined, tr("pdfPreset"));
        var presetItems = [tr("pdfDefault")];
        for (var pp = 0; pp < pdfPresets.length; pp++) { presetItems.push(pdfPresets[pp]); }
        var ddPreset = gPdf.add("dropdownlist", undefined, presetItems);
        ddPreset.preferredSize.width = 170;
        ddPreset.selection = Math.min(settings.pdfPresetIndex, presetItems.length - 1);
        cbPdf.value = settings.pdf;

        var gPdfMode = pFmt.add("group");
        gPdfMode.margins = [74, 0, 0, 0];
        var rbPdfEach = gPdfMode.add("radiobutton", undefined, tr("pdfPerArtboard"));
        var rbPdfMulti = gPdfMode.add("radiobutton", undefined, tr("pdfMultipage"));
        rbPdfEach.value = !settings.pdfMultipage;
        rbPdfMulti.value = settings.pdfMultipage;
        var stPdfNote = pFmt.add("statictext", undefined, tr("pdfNote"), { multiline: true });
        stPdfNote.preferredSize = [300, 32];

        // --- Raster ---
        var pRas = colR.add("panel", undefined, tr("pnlRaster"));
        pRas.alignChildren = ["fill", "top"];
        pRas.margins = [12, 16, 12, 10];
        var gDpi = pRas.add("group");
        gDpi.add("statictext", undefined, tr("dpiLabel"));
        var ddDpi = gDpi.add("dropdownlist", undefined, ["72", "150", "300", tr("dpiCustom")]);
        ddDpi.selection = settings.dpiChoice;
        var etDpi = gDpi.add("edittext", undefined, settings.dpiCustomText);
        etDpi.characters = 5;
        gDpi.add("statictext", undefined, tr("dpiUnit", MAX_DPI));
        var stPx = pRas.add("statictext", undefined, "");
        stPx.characters = 34;
        var gBg = pRas.add("group");
        gBg.add("statictext", undefined, tr("bgLabel"));
        var etBg = gBg.add("edittext", undefined, settings.bgHex);
        etBg.characters = 8;
        gBg.add("statictext", undefined, tr("bgHint"));
        var cbAA = pRas.add("checkbox", undefined, tr("antiAlias"));
        cbAA.value = settings.antiAlias;

        // --- Boutons / Buttons ---
        var gBtn = w.add("group");
        gBtn.alignment = ["right", "bottom"];
        var btCancel = gBtn.add("button", undefined, tr("btnCancel"), { name: "cancel" });
        var btOk = gBtn.add("button", undefined, tr("btnExport"), { name: "ok" });

        // Lit les contrôles dans settings / Reads controls into settings
        function readControls() {
            var r, sel;
            for (r = 0; r < radios.length; r++) { if (radios[r].value) { settings.scope = scopes[r]; } }
            settings.listSel = [];
            sel = lbAb.selection;
            if (sel) {
                if (!(sel instanceof Array)) { sel = [sel]; }
                for (r = 0; r < sel.length; r++) { settings.listSel.push(sel[r].index); }
            }
            settings.rangeText = etRange.text;
            settings.png = cbPng.value;
            settings.jpg = cbJpg.value;
            settings.svg = cbSvg.value;
            settings.pdf = cbPdf.value;
            settings.pngTransparent = cbTransp.value;
            settings.jpgQuality = numberFrom(etQ.text);
            settings.svgOutline = cbOutline.value;
            settings.svgEmbed = cbEmbed.value;
            settings.pdfPresetIndex = ddPreset.selection ? ddPreset.selection.index : 0;
            settings.pdfMultipage = rbPdfMulti.value;
            settings.dpiChoice = ddDpi.selection ? ddDpi.selection.index : 2;
            settings.dpiCustomText = etDpi.text;
            settings.dpi = currentDpi(settings);
            settings.bgHex = trim(etBg.text).replace(/^#/, "").toUpperCase();
            settings.antiAlias = cbAA.value;
            settings.template = etTpl.text;
            settings.subfolders = cbSub.value;
            settings.overwrite = cbOver.value;
            settings.openFolder = cbOpen.value;
        }

        // Met à jour états et aperçus / Refreshes states and previews
        function refresh() {
            readControls();
            var raster = settings.png || settings.jpg;
            cbTransp.enabled = settings.png;
            slQ.enabled = etQ.enabled = settings.jpg;
            cbOutline.enabled = cbEmbed.enabled = settings.svg;
            ddPreset.enabled = rbPdfEach.enabled = rbPdfMulti.enabled = settings.pdf;
            stPdfNote.enabled = settings.pdf;
            pRas.enabled = raster;
            etDpi.enabled = raster && settings.dpiChoice === DPI_PRESETS.length;

            var idx = resolveIndices(settings);
            stCount.text = idx ? tr("selectedCount", idx.length) : tr("selectedCount", 0);

            if (idx && idx.length) {
                var ext = settings.png ? ".png" : (settings.jpg ? ".jpg" : (settings.svg ? ".svg" : ".pdf"));
                stPreview.text = tr("previewLabel") + buildBaseName(settings.template, makeCtx(idx[0], 0, settings.dpi)) + ext;
                try {
                    var rect = doc.artboards[idx[0]].artboardRect;
                    var dpi = settings.dpi;
                    if (!isNaN(dpi) && dpi > 0) {
                        stPx.text = tr("pixelInfo", Math.round((rect[2] - rect[0]) * dpi / 72), Math.round((rect[1] - rect[3]) * dpi / 72));
                    } else {
                        stPx.text = tr("pixelInfoNone");
                    }
                } catch (eR) { stPx.text = tr("pixelInfoNone"); }
            } else {
                stPreview.text = tr("previewLabel") + "—";
                stPx.text = tr("pixelInfoNone");
            }
            stPdfName.text = (settings.pdf && settings.pdfMultipage) ? replaceAll(tr("pdfMultiName"), "{doc}", docState.baseName) : "";
            stPreview.helpTip = stPreview.text;
        }

        // Événements / Events
        var refreshers = [cbPng, cbJpg, cbSvg, cbPdf, cbTransp, cbOutline, cbEmbed, rbPdfEach, rbPdfMulti, cbAA];
        for (var ci = 0; ci < refreshers.length; ci++) { refreshers[ci].onClick = refresh; }
        ddDpi.onChange = refresh;
        ddPreset.onChange = refresh;
        lbAb.onChange = refresh;
        etRange.onChanging = refresh;
        etTpl.onChanging = refresh;
        etDpi.onChanging = refresh;
        slQ.onChanging = function () { etQ.text = String(Math.round(slQ.value)); };
        etQ.onChange = function () {
            var q = numberFrom(etQ.text);
            if (!isNaN(q) && q >= 0 && q <= 100) { slQ.value = q; }
        };

        var outcome = "cancel";
        ddLang.onChange = function () {
            var newLang = (ddLang.selection && ddLang.selection.index === 0) ? "fr" : "en";
            if (newLang !== lang) {
                readControls();
                lang = newLang;
                outcome = "lang";
                w.close(3);
            }
        };
        btCancel.onClick = function () { outcome = "cancel"; w.close(2); };
        btOk.onClick = function () {
            readControls();
            var msg = validate(settings);
            if (msg !== "") { alert(msg, SCRIPT_NAME); return; }
            outcome = "ok";
            w.close(1);
        };

        setScope(settings.scope);
        showFolder();
        refresh();
        w.show();
        return outcome;
    }

    // =====================================================================
    // Fenêtre de progression / Progress window
    // =====================================================================
    function createProgress(total) {
        var p = { win: null, bar: null, label: null };
        try {
            p.win = new Window("palette", SCRIPT_NAME + " — " + tr("progressTitle"));
            p.win.alignChildren = ["fill", "top"];
            p.bar = p.win.add("progressbar", undefined, 0, Math.max(total, 1));
            p.bar.preferredSize = [380, 12];
            p.label = p.win.add("statictext", undefined, "", { truncate: "middle" });
            p.label.preferredSize = [380, 18];
            p.win.show();
        } catch (e) { p.win = null; }
        p.step = function (value, text) {
            if (!p.win) { return; }
            try {
                p.bar.value = value;
                p.label.text = text;
                p.win.update();
            } catch (e2) { /* ignoré / ignored */ }
        };
        p.close = function () {
            if (p.win) { try { p.win.close(); } catch (e3) { /* ignoré */ } }
        };
        return p;
    }

    // =====================================================================
    // Export
    // =====================================================================
    function ensureFolder(f) {
        if (f.exists) { return true; }
        return f.create();
    }

    // Choisit un fichier cible libre / Picks a free target file
    function uniqueTarget(folder, base, ext, used) {
        var k = 2;
        var f = new File(folder.fsName + "/" + base + "." + ext);
        while (used[String(f.fsName).toLowerCase()] === true ||
               (!settings.overwrite && f.exists) ||
               sameFile(f, docState.file)) {
            f = new File(folder.fsName + "/" + base + "-" + k + "." + ext);
            k++;
        }
        used[String(f.fsName).toLowerCase()] = true;
        return f;
    }

    function exportRaster(index, file, kind) {
        var scale = settings.dpi / 72 * 100;
        var opts, type;
        doc.artboards.setActiveArtboardIndex(index);
        if (kind === "png") {
            opts = new ExportOptionsPNG24();
            opts.transparency = settings.pngTransparent;
            opts.matte = !settings.pngTransparent;
            type = ExportType.PNG24;
        } else {
            opts = new ExportOptionsJPEG();
            opts.qualitySetting = Math.round(settings.jpgQuality);
            opts.matte = true;
            type = ExportType.JPEG;
        }
        opts.matteColor = hexToRGB(settings.bgHex);
        opts.antiAliasing = settings.antiAlias;
        opts.artBoardClipping = true;
        opts.horizontalScale = scale;
        opts.verticalScale = scale;
        opts.saveAsHTML = false;
        if (file.exists && settings.overwrite) { file.remove(); }
        doc.exportFile(file, type, opts);
    }

    function clearFolder(folder) {
        var list = folder.getFiles();
        for (var i = 0; i < list.length; i++) {
            if (list[i] instanceof File) { list[i].remove(); }
        }
    }

    function moveFile(src, dest) {
        if (dest.exists) { dest.remove(); }
        if (!src.copy(dest.fsName)) { return false; }
        src.remove();
        return true;
    }

    // SVG : Illustrator ajoute le nom du plan au fichier ; on exporte dans un
    // dossier temporaire puis on renomme selon le modèle.
    // SVG: Illustrator appends the artboard name; export into a temp folder,
    // then rename according to the template.
    function exportSvg(index, target, tmpFolder) {
        var opts = new ExportOptionsSVG();
        var i, produced, src, rest, dest, abName;
        opts.embedRasterImages = settings.svgEmbed;
        opts.coordinatePrecision = 3;
        opts.preserveEditability = false;
        opts.includeFileInfo = false;
        opts.saveMultipleArtboards = true;
        opts.artboardRange = String(index + 1);
        if (settings.svgOutline) {
            trySet(opts, "fontType", function () { return SVGFontType.OUTLINEFONT; });
        } else {
            trySet(opts, "fontType", function () { return SVGFontType.SVGFONT; });
            trySet(opts, "fontSubsetting", function () { return SVGFontSubsetting.None; });
        }
        trySet(opts, "cssProperties", function () { return SVGCSSPropertyLocation.STYLEELEMENTS; });
        trySet(opts, "documentEncoding", function () { return SVGDocumentEncoding.UTF8; });
        trySet(opts, "DTD", function () { return SVGDTDVersion.SVG1_1; });

        clearFolder(tmpFolder);
        doc.exportFile(new File(tmpFolder.fsName + "/export.svg"), ExportType.SVG, opts);

        produced = tmpFolder.getFiles("*.svg");
        if (!produced || produced.length === 0) { throw new Error(tr("errSvgMissing")); }
        src = produced[0];
        abName = String(doc.artboards[index].name);
        for (i = 0; i < produced.length; i++) {
            if (decodeURI(produced[i].name).indexOf(abName) !== -1) { src = produced[i]; break; }
        }
        if (!moveFile(src, target)) { throw new Error(tr("errMove")); }

        // Fichiers annexes éventuels (images liées) / Possible side files (linked images)
        rest = tmpFolder.getFiles();
        for (i = 0; i < rest.length; i++) {
            if (!(rest[i] instanceof File)) { continue; }
            dest = new File(target.parent.fsName + "/" + rest[i].name);
            if (!dest.exists && /\.svg$/i.test(rest[i].name) === false) { moveFile(rest[i], dest); }
            else { rest[i].remove(); }
        }
    }

    function exportPdf(rangeString, file) {
        var opts = new PDFSaveOptions();
        if (settings.pdfPresetIndex > 0 && settings.pdfPresetIndex <= pdfPresets.length) {
            opts.pDFPreset = pdfPresets[settings.pdfPresetIndex - 1];
        }
        opts.artboardRange = rangeString;
        opts.preserveEditability = false;
        opts.viewAfterSaving = false;
        if (file.exists && settings.overwrite) { file.remove(); }
        doc.saveAs(file, opts);
    }

    function formatFolder(root, sub) {
        if (!settings.subfolders) { return root; }
        var f = new Folder(root.fsName + "/" + sub);
        if (!ensureFolder(f)) { throw new Error(tr("errFolderCreate", f.fsName)); }
        return f;
    }

    function runExport(indices) {
        var report = { files: [], errors: [], pdfDone: false };
        var used = {};
        var root = settings.folder;
        var formats = [];
        var total, done = 0, f, k, idx, ctx, target, folder, tmpFolder = null, label;
        var oldLevel = null;

        if (!ensureFolder(root)) {
            report.errors.push(tr("errFolderCreate", root.fsName));
            return report;
        }
        if (settings.png) { formats.push({ kind: "png", ext: "png", sub: "PNG" }); }
        if (settings.jpg) { formats.push({ kind: "jpg", ext: "jpg", sub: "JPG" }); }
        if (settings.svg) { formats.push({ kind: "svg", ext: "svg", sub: "SVG" }); }

        total = formats.length * indices.length;
        if (settings.pdf) { total += settings.pdfMultipage ? 1 : indices.length; }
        var progress = createProgress(total);

        try { oldLevel = app.userInteractionLevel; app.userInteractionLevel = UserInteractionLevel.DONTDISPLAYALERTS; } catch (eL) { oldLevel = null; }

        try {
            // 1) PNG / JPEG / SVG — sans modifier le document / without editing the document
            for (f = 0; f < formats.length; f++) {
                folder = formatFolder(root, formats[f].sub);
                if (formats[f].kind === "svg" && tmpFolder === null) {
                    tmpFolder = new Folder(root.fsName + "/_tmp_" + SCRIPT_NAME + "_" + (new Date().getTime()));
                    if (!ensureFolder(tmpFolder)) { throw new Error(tr("errFolderCreate", tmpFolder.fsName)); }
                }
                for (k = 0; k < indices.length; k++) {
                    idx = indices[k];
                    ctx = makeCtx(idx, k, settings.dpi);
                    target = uniqueTarget(folder, buildBaseName(settings.template, ctx), formats[f].ext, used);
                    label = decodeURI(target.name);
                    progress.step(done, label);
                    try {
                        if (formats[f].kind === "svg") {
                            exportSvg(idx, target, tmpFolder);
                        } else {
                            exportRaster(idx, target, formats[f].kind);
                        }
                        if (target.exists) { report.files.push(target.fsName); }
                        else { report.errors.push(label + " : " + tr("errNotCreated")); }
                    } catch (eX) {
                        report.errors.push(label + " : " + errText(eX));
                    }
                    done++;
                }
            }

            // 2) PDF en dernier (Enregistrer sous) / PDF last (Save As)
            if (settings.pdf) {
                folder = formatFolder(root, "PDF");
                if (settings.pdfMultipage) {
                    target = uniqueTarget(folder, docState.baseName, "pdf", used);
                    label = decodeURI(target.name);
                    progress.step(done, label);
                    try {
                        exportPdf(indicesToRangeString(indices), target);
                        report.pdfDone = true;
                        if (target.exists) { report.files.push(target.fsName); }
                        else { report.errors.push(label + " : " + tr("errNotCreated")); }
                    } catch (eP) {
                        report.errors.push(label + " : " + errText(eP));
                    }
                    done++;
                } else {
                    for (k = 0; k < indices.length; k++) {
                        idx = indices[k];
                        ctx = makeCtx(idx, k, settings.dpi);
                        target = uniqueTarget(folder, buildBaseName(settings.template, ctx), "pdf", used);
                        label = decodeURI(target.name);
                        progress.step(done, label);
                        try {
                            exportPdf(String(idx + 1), target);
                            report.pdfDone = true;
                            if (target.exists) { report.files.push(target.fsName); }
                            else { report.errors.push(label + " : " + tr("errNotCreated")); }
                        } catch (eP2) {
                            report.errors.push(label + " : " + errText(eP2));
                        }
                        done++;
                    }
                }
            }
            progress.step(total, "");
        } catch (eFatal) {
            report.errors.push(tr("fatal", errText(eFatal)));
        } finally {
            if (oldLevel !== null) { try { app.userInteractionLevel = oldLevel; } catch (eL2) { /* ignoré */ } }
            if (tmpFolder !== null) {
                try { clearFolder(tmpFolder); tmpFolder.remove(); } catch (eT) { /* ignoré */ }
            }
            // Restaure le plan actif / Restores the active artboard
            if (!report.pdfDone) {
                try { doc.artboards.setActiveArtboardIndex(docState.activeIndex); } catch (eAb) { /* ignoré */ }
            }
            progress.close();
        }

        // Après « Enregistrer sous » PDF, le document pointe vers le PDF :
        // on le ferme sans enregistrer et on rouvre le fichier d'origine.
        // After PDF "Save As" the document points to the PDF: close it without
        // saving and reopen the original file.
        if (report.pdfDone && docState.file) {
            try {
                doc.close(SaveOptions.DONOTSAVECHANGES);
                var reopened = app.open(docState.file);
                try { reopened.artboards.setActiveArtboardIndex(docState.activeIndex); } catch (eAb2) { /* ignoré */ }
            } catch (eO) {
                report.errors.push(tr("reopenFail", errText(eO), docState.file.fsName));
            }
        }
        return report;
    }

    function showSummary(report) {
        var msg = report.files.length > 0 ?
            tr("summaryOk", report.files.length, settings.folder.fsName) :
            tr("summaryNone");
        var n = report.errors.length;
        if (n > 0) {
            msg += "\n\n" + tr("summaryErrors", n);
            for (var i = 0; i < n && i < MAX_ERRORS_SHOWN; i++) { msg += "\n• " + report.errors[i]; }
            if (n > MAX_ERRORS_SHOWN) { msg += "\n" + tr("summaryMore", n - MAX_ERRORS_SHOWN); }
        }
        alert(msg, SCRIPT_NAME + " v" + SCRIPT_VERSION);
    }

    // =====================================================================
    // Programme principal / Main
    // =====================================================================
    var outcome = showDialog();
    while (outcome === "lang") { outcome = showDialog(); }
    if (outcome !== "ok") { return; }

    var indices = resolveIndices(settings);
    if (!indices || indices.length === 0) { return; }

    var report = runExport(indices);
    showSummary(report);
    if (settings.openFolder && report.files.length > 0) {
        try { settings.folder.execute(); } catch (eOpen) { /* ignoré / ignored */ }
    }

})();
