# ExporterPlansTravail.jsx — Export par lot des plans de travail (Illustrator)

**v1.0.0** · Adobe Illustrator **CC 2018 – 2026** · ExtendScript (ES3) · Licence MIT · FR / EN

> **Statut de test : non testé dans Illustrator.** La syntaxe a été vérifiée avec
> [acorn](https://github.com/acornjs/acorn) (ECMAScript 3 et 5) et la logique
> (plages, nommage, ordre des exports, renommage SVG, réouverture après PDF) a été
> exercée dans Node.js avec des objets Illustrator simulés. Merci de signaler tout
> problème via les *Issues*.
>
> **Test status: not tested in Illustrator.** Syntax checked with acorn (ES3/ES5);
> logic exercised in Node.js against mocked Illustrator objects only.

---

## 🇫🇷 Français

Exporte en une fois chaque plan de travail — ou seulement ceux que vous choisissez —
en **PNG-24**, **JPEG**, **SVG** et/ou **PDF**, avec un modèle de nom de fichier,
une résolution au choix et un résumé à la fin.

### Fonctionnalités

- **Plans de travail** : tous, le plan actif, une sélection dans la liste
  (multi-sélection) ou une plage par numéro (`1-3, 5, 8-10`).
- **Formats** (cumulables en un seul passage) :
  - **PNG-24** — fond transparent en option ;
  - **JPEG** — qualité 0–100 (curseur + champ) ;
  - **SVG** — texte vectorisé et images incorporées en option ;
  - **PDF** — un fichier par plan ou un seul PDF multipage, avec choix du
    paramètre prédéfini PDF installé (ex. « Qualité supérieure »).
- **Résolution raster** : 72, 150, 300 ppp ou personnalisée (max 558 ppp, limite
  d'échelle d'`exportFile` ≈ 776 %). Aperçu de la taille en pixels du 1er plan.
- **Fond** : couleur hexadécimale (par défaut `FFFFFF`) pour le JPEG et le PNG non
  transparent ; lissage (anticrénelage) activable.
- **Modèle de nom** avec balises :

  | Balise | Remplacée par |
  |---|---|
  | `{doc}` | nom du document sans extension |
  | `{artboard}` | nom du plan de travail |
  | `{n}` / `{nn}` / `{nnn}` | numéro du plan (1, 01, 001) |
  | `{i}` | rang dans l'export (1, 2, 3…) |
  | `{dpi}` | résolution choisie |
  | `{date}` | date du jour `AAAA-MM-JJ` |

  Exemple par défaut : `{doc}_{artboard}_{nn}` → `Brochure_Couverture_01.png`.
  Les caractères interdits (`\ / : * ? " < > | %`) sont remplacés par `_`.
  Le PDF multipage est nommé `{doc}.pdf`.
- **Dossier de sortie** (dialogue de choix de dossier), sous-dossier par format en
  option (`PNG/`, `JPG/`, `SVG/`, `PDF/`), ouverture du dossier à la fin en option.
- **Fichiers existants** : conservés par défaut (suffixe `-2`, `-3`…), ou écrasés si
  l'option est cochée. Le fichier source n'est jamais écrasé.
- **Résumé final** : nombre de fichiers exportés, dossier, liste des erreurs
  éventuelles (un plan en erreur n'interrompt pas les autres).
- **Interface FR / EN** : langue détectée automatiquement, commutable dans le
  dialogue (les réglages sont conservés).

### Ce que le script modifie (ou pas)

- **L'illustration n'est jamais modifiée** : rien à annuler (`Ctrl/Cmd + Z`).
- Le **plan de travail actif** change pendant l'export, puis est restauré.
- **PDF** : Illustrator n'exporte le PDF que par « Enregistrer sous », ce qui
  rattache le document au PDF créé. Le script exige donc un document **déjà
  enregistré et sans modifications en attente** ; à la fin, il le ferme sans
  enregistrer puis **rouvre le fichier d'origine** (la vue et la sélection sont
  réinitialisées). Par prudence, travaillez sur une copie si vous avez un doute.
- Pour le SVG, un dossier temporaire `_tmp_ExporterPlansTravail_…` est créé dans le
  dossier de sortie puis supprimé (Illustrator ajoute le nom du plan aux fichiers
  SVG ; le script les renomme selon votre modèle).

### Installation

1. Téléchargez `ExporterPlansTravail.jsx` (bouton **Code > Download ZIP** ou
   fichier brut).
2. **Usage ponctuel** : dans Illustrator, **Fichier > Scripts > Autre script…**
   (`Ctrl/Cmd + F12`) puis choisissez le fichier.
3. **Installation permanente** : copiez le fichier dans le dossier
   `Presets/<langue>/Scripts` d'Illustrator, puis redémarrez Illustrator :
   - Windows : `C:\Program Files\Adobe\Adobe Illustrator <version>\Presets\fr_FR\Scripts\`
   - macOS : `/Applications/Adobe Illustrator <version>/Presets.localized/fr_FR/Scripts/`

   Le script apparaît alors dans **Fichier > Scripts**.

### Utilisation

1. Ouvrez le document (enregistrez-le d'abord si vous voulez du PDF).
2. Lancez le script, choisissez les plans de travail, les formats, la résolution,
   le modèle de nom et le dossier de sortie (l'aperçu montre le premier nom).
3. Cliquez sur **Exporter** : une barre de progression s'affiche, puis le résumé.

Si aucun document n'est ouvert, le script l'indique et s'arrête.

### Limites connues

- Résolution raster maximale : 558 ppp (limite d'échelle d'Illustrator).
- Le PNG/JPEG utilise l'export « hérité » (`exportFile`), pas « Exporter pour les
  écrans » : les objets masqués ne sont pas exportés, comme dans Illustrator.
- Un plan de travail vide peut produire une erreur d'export : elle est listée dans
  le résumé.
- Le nom des paramètres prédéfinis PDF dépend de la langue d'Illustrator.

---

## 🇬🇧 English

Exports every artboard — or only the ones you pick — to **PNG-24**, **JPEG**,
**SVG** and/or **PDF** in one pass, with a file-name template, a chosen resolution
and a final summary.

### Features

- **Artboards**: all, active, multi-selection in a list, or a number range
  (`1-3, 5, 8-10`).
- **Formats** (combinable): PNG-24 (optional transparency), JPEG (quality 0–100),
  SVG (outline text / embed images options), PDF (one file per artboard or a single
  multipage PDF, with any installed PDF preset).
- **Raster resolution**: 72 / 150 / 300 ppi or custom (max 558 ppi), live pixel-size
  preview, background colour (hex) for JPEG and opaque PNG, anti-aliasing toggle.
- **Naming template** tokens: `{doc}`, `{artboard}`, `{n}`, `{nn}`, `{nnn}`, `{i}`,
  `{dpi}`, `{date}` (see the table above). Default: `{doc}_{artboard}_{nn}`.
  Multipage PDF is named `{doc}.pdf`.
- **Output folder** picker, optional per-format subfolders, optional “open folder
  when done”. Existing files are kept (`-2`, `-3` suffix) unless *Overwrite* is ticked;
  the source file is never overwritten.
- **Summary**: number of exported files, folder, and any errors (one failing artboard
  does not stop the others).
- **FR / EN UI**, auto-detected and switchable in the dialog.

### What the script changes

- **Artwork is never modified**, so there is nothing to undo.
- The active artboard is changed during export and restored afterwards.
- **PDF** uses “Save As”, which rebinds the document to the PDF. The document must
  therefore be **saved with no pending changes**; at the end it is closed without
  saving and the **original file is reopened** (view and selection are reset). Work on
  a copy if in doubt.
- SVG export uses a temporary `_tmp_ExporterPlansTravail_…` folder inside the output
  folder, removed at the end.

### Installation

- One-off: **File > Scripts > Other Script…** (`Ctrl/Cmd + F12`) and pick
  `ExporterPlansTravail.jsx`.
- Permanent: copy it to Illustrator's `Presets/<locale>/Scripts` folder and restart
  Illustrator; it then appears under **File > Scripts**.

### Target version & test status

- Target: Adobe Illustrator CC 2018 – 2026 (Windows & macOS).
- **Not tested in Illustrator.** Syntax checked with acorn (ES3/ES5); logic run only
  against mocked Illustrator objects in Node.js.

---

## Confidentialité / Privacy

Aucun appel réseau, aucune collecte de données, aucun fichier de préférences.
No network access, no data collection, no preference file.

## Licence / License

[MIT](LICENSE) © 2026 Amirouche Amwanes
