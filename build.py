#!/usr/bin/env python3
"""Assemble docs/index.html (the GitHub Pages site) from src/page.html, src/core.js and src/ui.js."""
from pathlib import Path

root = Path(__file__).parent
page = (root / "src/page.html").read_text()
core = (root / "src/core.js").read_text()
ui = (root / "src/ui.js").read_text()
body = page.replace("/*CORE*/", core).replace("/*UI*/", ui)
head_end = body.index("</style>") + len("</style>")
html = (
    "<!doctype html>\n<html lang=\"en\">\n<head>\n<meta charset=\"utf-8\">\n"
    "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
    + body[:head_end] + "\n</head>\n<body>\n" + body[head_end:] + "\n</body>\n</html>\n"
)
(root / "docs/index.html").write_text(html)
print("wrote docs/index.html", len(html), "bytes")
