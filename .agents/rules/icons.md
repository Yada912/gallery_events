# Workspace Rule: Google Material Symbols for All Icons

## Rule Definition
1. **Google Material Symbols Only**: Any UI elements, buttons, badges, indicators, or decorations involving icons across this entire codebase MUST use Google Material Symbols (`material-symbols-outlined`).
2. **Standard Implementation**:
   ```jsx
   <span className="material-symbols-outlined" style={{ fontSize: 18 }}>icon_name</span>
   ```
3. **No External Icon Libraries**:
   - Do NOT install or import `lucide-react`, `react-icons`, `font-awesome`, or any other icon packages.
   - Do NOT use raw unicode emojis for functional UI icons or action buttons.
4. **Consistency**:
   - The Google Material Symbols font is loaded centrally in `index.html`.
   - Maintain consistent font size, vertical alignment, and colors across all components.
