# AGENTS.md — Development Rules for Gema Belajar

## Icon Standards (Mandatory)
- **Always use Google Material Symbols**: All icons must use `<span className="material-symbols-outlined">icon_name</span>`.
- **No external icon packages**: Do not import `lucide-react`, `react-icons`, or any other icon libraries.
- **No raw unicode emojis** for action buttons or UI status elements; use official Material Symbols instead.

## Design & Form Guidelines
- When a user uploads a poster file, immediately hide the empty drag-and-drop box and show a clear, reassuring confirmation card displaying the image preview, compression stats, and a "Ganti Gambar Poster" button so the user is 100% confident their file is uploaded.
- All forms must validate required inputs (such as student name, comment author name formatted as `nama-kelas-absen`, group name, title, and poster image).
