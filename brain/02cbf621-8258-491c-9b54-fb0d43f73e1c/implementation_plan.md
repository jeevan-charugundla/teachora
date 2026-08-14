# Implementation Plan: Teachora Diagram Rendering & PDF Export Complete Fix

Fix the process/flowchart diagram preview rendering in `DiagramPreview.tsx` and ensure PDF/PNG/SVG exports generate the **actual rendered visual diagram** as a professional educational document instead of dumping raw internal JSON.

## User Review Required

> [!IMPORTANT]
> **Key Architecture Decisions**:
> 1. **Visual Diagram Export vs JSON Dump**: Diagrams will export the **exact visual diagram** rendered on screen (via SVG-to-Canvas high-res rasterization & vector SVG embedding into PDF) formatted alongside Teachora headers and formatted Key Concepts descriptions. Raw JSON arrays (`NODES`, `CONNECTIONS`) will never be exported into PDFs.
> 2. **Responsive Node Sizing & No Truncation**: Diagram nodes will dynamically scale to fit complete titles (e.g., `First Law (Inertia)`), wrapping lines naturally with readable font sizes and generous padding.
> 3. **Orientation Awareness**: Landscape diagrams will render Left-to-Right wide process flows utilizing 80–90% of the canvas; Portrait diagrams will render Top-to-Bottom vertical flows with 90–120px node gaps.
> 4. **Connection Labels**: Edge connection labels (`builds upon`, `complements`, `enables`, `informs`) will render over SVG background pills positioned at midpoint vectors so text never collides with arrowheads or node rects.

---

## Proposed Changes

### 1. Diagram Preview & Renderer Enhancements

#### [MODIFY] [DiagramPreview.tsx](file:///c:/Users/jeeva/TechAuro/src/features/create/components/previews/DiagramPreview.tsx)
- **Node Sizing & Text Wrapping**: Replace fixed 130x44px node dimensions with dynamic node sizing (`NODE_W` ~ 180px–300px based on title length and orientation). Implement multi-line SVG text wrapping so no node title is truncated.
- **Orientation & Canvas Layout**:
  - Implement orientation-aware layout in `autoLayout()`:
    - `landscape` orientation: Horizontal Left-to-Right node flow with smart vertical offsets for branches.
    - `portrait` orientation: Generously spaced vertical Top-to-Bottom node flow.
  - Scale viewBox to 900x480px (landscape) or 750x600px (portrait) using **70–90% of canvas space**.
- **Connector Line Anchoring & Collision Prevention**:
  - Calculate exact edge intersection coordinates (e.g., right edge to left edge for L-R flow, bottom edge to top edge for T-B flow).
  - Render connection labels (`builds upon`, `complements`, `enables`, `informs`) with `<rect>` background pills centered on lines to prevent text/arrow overlap.
- **Key Concepts Panel**:
  - Underneath the diagram canvas, render a clean, human-readable **Key Concepts** text section with full node titles and descriptions.

---

### 2. Diagram Exporter Engine

#### [NEW] [diagramExporter.ts](file:///c:/Users/jeeva/TechAuro/src/services/export/diagramExporter.ts)
- Create specialized exporter utility for Diagram creations:
  - `exportDiagramToPDF({ data, svgElement, title, subject, grade })`:
    - Renders the Teachora educational header (Subject • Grade • Diagram Type).
    - Captures high-DPI (300 DPI) crisp image of rendered SVG canvas and embeds into A4 PDF (Landscape or Portrait matching orientation).
    - Formats readable **Key Concepts** section below the visual diagram.
    - Includes visual legend and supporting AI visual image if present.
    - Saves clean human-readable filename (e.g., `Newton_Laws_Process_Diagram_Teachora.pdf`).
  - `exportDiagramToPNG({ svgElement, title })`: Exports high-resolution PNG file.
  - `exportDiagramToSVG({ svgElement, title })`: Exports raw scalable SVG vector file.

---

### 3. Save Export Modal & Creation Editor Integration

#### [MODIFY] [SaveExportModal.tsx](file:///c:/Users/jeeva/TechAuro/src/features/assistant/components/SaveExportModal.tsx)
- Accept optional `diagramData` and `svgRef` props.
- Add **PNG** and **SVG** format options alongside **PDF**, **Word**, **Text**, and **Print**.
- When exporting PDF/PNG/SVG for a Diagram, delegate execution to `diagramExporter.ts`.

#### [MODIFY] [CreationResultEditor.tsx](file:///c:/Users/jeeva/TechAuro/src/features/create/components/CreationResultEditor.tsx)
- Pass diagram preview data and SVG canvas reference into `SaveExportModal` so the exporter can access the actual visual DOM element for crisp PDF/PNG export.

---

## Verification Plan

### Automated Verification
- Run `npx tsc --noEmit` to verify type safety across all updated components.
- Run `npm run build` to confirm production bundle builds without errors.

### Manual Verification
- Test exact prompt scenario:
  - **Subject**: Science | **Grade**: Grade 8 | **Topic**: Newton's Law | **Type**: Process Diagram | **Orientation**: Landscape
- Verify:
  1. On-Screen Preview displays full un-truncated titles (`First Law (Inertia)`), clean arrow connections, midpoint labels with background pills, and wide landscape layout taking 80%+ of canvas.
  2. PDF Export generates `Newton_Laws_Process_Diagram_Teachora.pdf` containing Teachora header, actual rendered visual diagram, and formatted Key Concepts text section. ZERO JSON or raw arrays in PDF!
  3. PNG and SVG downloads work cleanly and match on-screen diagram.
