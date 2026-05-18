#!/usr/bin/env python3
"""
╔══════════════════════════════════════════════════════════════════════╗
║              codeClean — Universal Code Analysis Engine              ║
║   Detectează cod mort, duplicate, erori, smells și le curăță        ║
║   Rulează: python codeClean.py [--fix] [--report] [--path ./src]    ║
╚══════════════════════════════════════════════════════════════════════╝
"""

import os
import re
import sys
import json
import hashlib
import argparse
from pathlib import Path
from datetime import datetime
from collections import defaultdict
from typing import Optional

# ─── CULORI TERMINAL ──────────────────────────────────────────────────────────

RESET  = "\033[0m"
BOLD   = "\033[1m"
RED    = "\033[91m"
YELLOW = "\033[93m"
GREEN  = "\033[92m"
CYAN   = "\033[96m"
DIM    = "\033[2m"
BLUE   = "\033[94m"
WHITE  = "\033[97m"

def c(text, color): return f"{color}{text}{RESET}"

# ─── CONFIGURARE ──────────────────────────────────────────────────────────────

IGNORE_DIRS = {
    "node_modules", ".next", ".git", "dist", "build",
    ".turbo", ".vercel", "coverage", "__pycache__", ".cache",
    ".mypy_cache", ".pytest_cache", "venv", ".venv", "env",
}

IGNORE_EXTS = {
    ".lock", ".png", ".jpg", ".jpeg", ".svg", ".ico",
    ".woff", ".woff2", ".ttf", ".eot", ".map", ".min.js",
}

# Extensii suportate cu limba lor
LANG_MAP = {
    ".ts": "TypeScript", ".tsx": "TypeScript/React",
    ".js": "JavaScript", ".jsx": "JavaScript/React",
    ".py": "Python", ".css": "CSS", ".scss": "SCSS",
    ".json": "JSON", ".md": "Markdown",
}

TS_JS_EXTS   = {".ts", ".tsx", ".js", ".jsx"}
PYTHON_EXTS  = {".py"}
STYLE_EXTS   = {".css", ".scss"}
ALL_CODE_EXTS = set(LANG_MAP.keys())

# ─── PATTERN-URI CODE SMELLS ─────────────────────────────────────────────────

TS_JS_SMELLS = [
    # TypeScript
    (r"\bany\b",                      "ERR",  "TypeScript 'any' — folosește un tip concret"),
    (r"\bas any\b",                   "ERR",  "Cast 'as any' — nesigur, poate ascunde erori"),
    (r"@ts-ignore",                   "ERR",  "@ts-ignore — rezolvă eroarea în loc să o ignori"),
    (r"@ts-nocheck",                  "ERR",  "@ts-nocheck — activează type checking"),
    # Logging
    (r"console\.log\(",               "WARN", "console.log rămas în cod — șterge sau folosește un logger"),
    (r"console\.error\(",             "INFO", "console.error — ok în catch, verifică dacă e intenționat"),
    (r"debugger;",                    "ERR",  "debugger statement rămas în cod"),
    # Next.js 15
    (r"searchParams\.",               "ERR",  "Next.js 15: searchParams e Promise — folosește await"),
    (r"params\.",                     "ERR",  "Next.js 15: params e Promise — folosește await"),
    (r"useSearchParams\(\)",          "WARN", "useSearchParams() — asigură-te că e în <Suspense>"),
    # React
    (r'key=\{index\}',                "WARN", "key={index} în map() — folosește un ID unic"),
    (r"dangerouslySetInnerHTML",       "ERR",  "dangerouslySetInnerHTML — risc XSS"),
    # Browser APIs în SSR
    (r"localStorage\.",               "WARN", "localStorage — poate crasha în SSR (Next.js)"),
    (r"sessionStorage\.",             "WARN", "sessionStorage — poate crasha în SSR"),
    (r"window\.",                     "WARN", "window access — verifică dacă ești în client component"),
    (r"document\.",                   "WARN", "document access — verifică dacă ești în client component"),
    # Async
    (r"fetch\([^)]+\)\s*(?!\s*\.)",   "WARN", "fetch() fără .catch() — lipsă error handling"),
    (r"setTimeout\s*\(.*,\s*0\)",     "WARN", "setTimeout(fn, 0) — posibil anti-pattern"),
    (r"new Promise\(",                "INFO", "new Promise() — preferă async/await"),
    # Code quality
    (r"TODO|FIXME|HACK|XXX",          "WARN", "TODO/FIXME nerezolvat"),
    (r"eslint-disable",               "WARN", "eslint-disable — rezolvă regula în loc să o ignori"),
    (r"require\(",                    "WARN", "require() în TypeScript — folosește import"),
    (r"!\.",                          "INFO", "Non-null assertion '!' — poate cauza runtime errors"),
    (r"== null",                      "INFO", "== null (loose) — preferă === null sau nullish coalescing"),
    (r"var ",                         "INFO", "'var' detectat — folosește const sau let"),
]

PYTHON_SMELLS = [
    (r"print\(",                      "WARN", "print() rămas în cod — folosește logging"),
    (r"import \*",                    "WARN", "Wildcard import — importă explicit"),
    (r"except:",                      "ERR",  "Bare except — prinde o excepție specifică"),
    (r"except Exception:",            "WARN", "except Exception prea broad — fii mai specific"),
    (r"# TODO|# FIXME|# HACK",        "WARN", "TODO/FIXME nerezolvat"),
    (r"pass$",                        "INFO", "pass gol — asigură-te că e intenționat"),
    (r"global ",                      "WARN", "Variabilă global — evită state global"),
    (r"eval\(",                       "ERR",  "eval() — periculos, nu folosi"),
    (r"exec\(",                       "ERR",  "exec() — periculos, verifică"),
    (r"__import__",                   "ERR",  "__import__ dinamic — posibil risc de securitate"),
    (r"time\.sleep\(",                "INFO", "time.sleep() — blochează thread-ul"),
    (r"assert ",                      "INFO", "assert — nu folosi pentru validare în producție"),
]

CSS_SMELLS = [
    (r"!important",                   "WARN", "!important — evită, poate cauza probleme de specificitate"),
    (r"#[0-9A-Fa-f]{3,6}(?![0-9A-Fa-f])", "INFO", "Culoare hardcodată — folosește CSS variables"),
    (r"z-index:\s*9{3,}",             "WARN", "z-index extrem (999+) — revizuiește stacking context"),
    (r"position:\s*fixed",            "INFO", "position: fixed — verifică comportamentul pe mobile"),
    (r"@import url",                  "WARN", "@import url() — încetinește loading, folosește <link>"),
]

# ─── UTILITIES ────────────────────────────────────────────────────────────────

def get_files(root: Path, extensions: set) -> list[Path]:
    files = []
    for path in root.rglob("*"):
        if any(part in IGNORE_DIRS for part in path.parts):
            continue
        if path.suffix in IGNORE_EXTS:
            continue
        if path.suffix in extensions and path.is_file():
            files.append(path)
    return sorted(files)

def read_file(path: Path) -> Optional[str]:
    try:
        return path.read_text(encoding="utf-8")
    except Exception:
        return None

def write_file(path: Path, content: str) -> bool:
    try:
        path.write_text(content, encoding="utf-8")
        return True
    except Exception:
        return False

def rel(path: Path, root: Path) -> str:
    try:
        return str(path.relative_to(root))
    except ValueError:
        return str(path)

def severity_color(sev: str) -> str:
    return {
        "ERR":  RED,
        "WARN": YELLOW,
        "INFO": BLUE,
    }.get(sev, WHITE)

def severity_icon(sev: str) -> str:
    return {
        "ERR":  "✗",
        "WARN": "⚠",
        "INFO": "·",
    }.get(sev, "?")

def print_header():
    width = 70
    print(f"\n{c('═' * width, CYAN)}")
    print(c("  codeClean — Universal Code Analysis Engine", BOLD + WHITE))
    print(c("  Detectează cod mort · duplicate · erori · smells", DIM))
    print(f"{c('═' * width, CYAN)}\n")

def print_section(title: str):
    print(f"\n  {c('▸', CYAN)} {c(title, BOLD + WHITE)}")
    print(f"  {c('─' * 60, DIM)}")

def print_issue(sev: str, filepath: str, line: int, message: str):
    icon  = severity_icon(sev)
    color = severity_color(sev)
    loc   = f"{filepath}:{line}" if line > 0 else filepath
    print(f"    {c(icon, color)} {c(loc, DIM)}  {message}")

def print_ok(message: str):
    print(f"    {c('✓', GREEN)} {message}")

def print_fix(filepath: str, message: str):
    print(f"    {c('→', CYAN)} {c('FIXED', BOLD + GREEN)} {filepath} — {message}")

# ─── RAPORT ───────────────────────────────────────────────────────────────────

class Report:
    def __init__(self, root: Path):
        self.root       = root
        self.issues     : list[dict] = []
        self.fixes      : list[dict] = []
        self.duplicates : list[dict] = []
        self.dead_code  : list[dict] = []
        self.stats      : dict = defaultdict(int)
        self.start      = datetime.now()

    def add_issue(self, file: str, line: int, sev: str, kind: str, message: str):
        self.issues.append({"file": file, "line": line, "sev": sev, "kind": kind, "message": message})
        self.stats[f"sev_{sev}"] += 1
        self.stats[f"kind_{kind}"] += 1

    def add_fix(self, file: str, desc: str):
        self.fixes.append({"file": file, "desc": desc})
        self.stats["fixes"] += 1

    def add_duplicate(self, hash_: str, files: list[str]):
        self.duplicates.append({"hash": hash_[:8], "files": files, "count": len(files)})
        self.stats["duplicates"] += 1

    def add_dead(self, file: str, symbol: str, kind: str):
        self.dead_code.append({"file": file, "symbol": symbol, "kind": kind})
        self.stats["dead_code"] += 1

    def elapsed(self) -> float:
        return round((datetime.now() - self.start).total_seconds(), 2)

    def as_dict(self) -> dict:
        return {
            "generated_at": self.start.isoformat(),
            "elapsed_seconds": self.elapsed(),
            "root": str(self.root),
            "summary": dict(self.stats),
            "issues": self.issues,
            "fixes": self.fixes,
            "duplicates": self.duplicates,
            "dead_code": self.dead_code,
        }

# ─── ANALIZE ──────────────────────────────────────────────────────────────────

def analyze_smells(files: list[Path], root: Path, report: Report):
    """Detectează pattern-uri problematice per limbaj."""
    print_section("CODE SMELLS & ANTI-PATTERNS")

    total = 0
    shown = 0
    MAX_SHOWN = 30

    for path in files:
        content = read_file(path)
        if not content:
            continue

        if path.suffix in TS_JS_EXTS:
            patterns = TS_JS_SMELLS
        elif path.suffix in PYTHON_EXTS:
            patterns = PYTHON_SMELLS
        elif path.suffix in STYLE_EXTS:
            patterns = CSS_SMELLS
        else:
            continue

        lines = content.splitlines()
        for i, line in enumerate(lines, 1):
            # Sări peste linii comentate
            stripped = line.strip()
            if stripped.startswith("//") or stripped.startswith("#") or stripped.startswith("*"):
                continue
            for pattern, sev, message in patterns:
                if re.search(pattern, line):
                    file_rel = rel(path, root)
                    report.add_issue(file_rel, i, sev, "smell", message)
                    total += 1
                    if shown < MAX_SHOWN:
                        print_issue(sev, file_rel, i, message)
                        shown += 1

    if total > MAX_SHOWN:
        remaining = total - MAX_SHOWN
        print(f"\n    {c(f'  ... și încă {remaining} probleme similare', DIM)}")
    if total == 0:
        print_ok("Niciun code smell detectat!")

    report.stats["total_smells"] = total


def analyze_duplicates(files: list[Path], root: Path, report: Report, min_lines: int = 6):
    """Detectează blocuri de cod duplicate (hash-based)."""
    print_section("COD DUPLICAT")

    # Hash per bloc de N linii consecutive
    block_map: dict[str, list[tuple[str, int]]] = defaultdict(list)

    for path in files:
        if path.suffix not in (TS_JS_EXTS | PYTHON_EXTS):
            continue
        content = read_file(path)
        if not content:
            continue

        lines = [l.strip() for l in content.splitlines()]
        # Elimină linii goale și comentarii pentru comparație
        clean = [l for l in lines if l and not l.startswith("//") and not l.startswith("#")]

        for i in range(len(clean) - min_lines + 1):
            block = "\n".join(clean[i:i + min_lines])
            if len(block) < 80:  # bloc prea mic = fals pozitiv
                continue
            h = hashlib.md5(block.encode()).hexdigest()
            block_map[h].append((rel(path, root), i + 1))

    found = 0
    seen_hashes = set()
    for h, locations in block_map.items():
        if len(locations) < 2 or h in seen_hashes:
            continue
        seen_hashes.add(h)
        files_list = [f"{loc[0]}:{loc[1]}" for loc in locations[:4]]
        report.add_duplicate(h, [loc[0] for loc in locations])
        found += 1
        print(f"    {c('≡', YELLOW)} Bloc duplicat [{h[:8]}] în {len(locations)} locuri:")
        for f in files_list:
            print(f"      {c('·', DIM)} {f}")
        if found >= 15:
            remaining = sum(1 for locs in block_map.values() if len(locs) >= 2) - found
            if remaining > 0:
                print(f"\n    {c(f'  ... și încă {remaining} blocuri duplicate', DIM)}")
            break

    if found == 0:
        print_ok("Niciun bloc duplicat detectat!")


def analyze_dead_exports(files: list[Path], root: Path, report: Report):
    """Detectează exporturi care nu sunt importate nicăieri."""
    print_section("COD MORT (exporturi nefolosite)")

    # Colectează toate exporturile
    exports: dict[str, str] = {}  # symbol -> file
    for path in files:
        if path.suffix not in TS_JS_EXTS:
            continue
        content = read_file(path)
        if not content:
            continue
        file_rel = rel(path, root)
        for match in re.finditer(
            r"export\s+(?:default\s+)?(?:function|class|const|let|var|type|interface|enum)\s+(\w+)",
            content
        ):
            symbol = match.group(1)
            if symbol not in ("default",):
                exports[symbol] = file_rel

    # Colectează toate importurile
    all_imports: set[str] = set()
    for path in files:
        if path.suffix not in TS_JS_EXTS:
            continue
        content = read_file(path)
        if not content:
            continue
        for match in re.finditer(r"import\s+(?:type\s+)?\{([^}]+)\}", content):
            for sym in match.group(1).split(","):
                clean = sym.strip().split(" as ")[0].strip()
                if clean:
                    all_imports.add(clean)
        for match in re.finditer(r"import\s+(\w+)\s+from", content):
            all_imports.add(match.group(1))

    # Diferența = posibil cod mort
    dead = {sym: file for sym, file in exports.items() if sym not in all_imports}

    SKIP_SYMBOLS = {"default", "metadata", "generateMetadata", "GET", "POST", "PUT", "DELETE", "PATCH"}
    dead = {s: f for s, f in dead.items() if s not in SKIP_SYMBOLS}

    found = 0
    for symbol, file_rel in list(dead.items())[:20]:
        report.add_dead(file_rel, symbol, "unused_export")
        print_issue("INFO", file_rel, 0, f"Export '{symbol}' nu pare folosit nicăieri")
        found += 1

    if found == 0:
        print_ok("Niciun export neutilizat detectat!")
    elif len(dead) > 20:
        print(f"\n    {c(f'  ... și încă {len(dead) - 20} exporturi posibil nefolosite', DIM)}")


def analyze_large_files(files: list[Path], root: Path, report: Report,
                         warn_lines: int = 300, err_lines: int = 600):
    """Detectează fișiere prea mari — candidați pentru refactoring."""
    print_section("FIȘIERE PREA MARI (candidați refactoring)")

    found = 0
    for path in files:
        if path.suffix not in (TS_JS_EXTS | PYTHON_EXTS):
            continue
        content = read_file(path)
        if not content:
            continue
        lines = content.count("\n")
        file_rel = rel(path, root)
        if lines >= err_lines:
            report.add_issue(file_rel, 0, "ERR", "large_file", f"{lines} linii — prea mare, împarte în module")
            print_issue("ERR", file_rel, 0, f"{lines} linii — prea mare, împarte în module")
            found += 1
        elif lines >= warn_lines:
            report.add_issue(file_rel, 0, "WARN", "large_file", f"{lines} linii — consideră să împarți")
            print_issue("WARN", file_rel, 0, f"{lines} linii — consideră să împarți")
            found += 1

    if found == 0:
        print_ok("Niciun fișier exagerat de mare!")


def analyze_console_cleanup(files: list[Path], root: Path, report: Report, fix: bool = False):
    """Șterge automat console.log din codul TypeScript/JavaScript."""
    if not fix:
        return

    print_section("AUTO-FIX: ȘTERGE console.log")

    pattern = re.compile(r"^\s*console\.log\([^)]*\);\s*\n?", re.MULTILINE)

    for path in files:
        if path.suffix not in TS_JS_EXTS:
            continue
        content = read_file(path)
        if not content or "console.log" not in content:
            continue

        cleaned = pattern.sub("", content)
        count = content.count("console.log(") - cleaned.count("console.log(")

        if count > 0:
            write_file(path, cleaned)
            file_rel = rel(path, root)
            report.add_fix(file_rel, f"Șters {count} console.log")
            print_fix(file_rel, f"{count} console.log eliminate")


def analyze_unused_imports(files: list[Path], root: Path, report: Report):
    """Detectează importuri definite dar nefolosite în același fișier."""
    print_section("IMPORTURI NEFOLOSITE")

    found = 0
    for path in files:
        if path.suffix not in TS_JS_EXTS:
            continue
        content = read_file(path)
        if not content:
            continue

        file_rel = rel(path, root)
        imported_symbols: list[tuple[str, int]] = []

        for i, line in enumerate(content.splitlines(), 1):
            match = re.search(r"import\s+(?:type\s+)?\{([^}]+)\}\s+from", line)
            if match:
                for sym in match.group(1).split(","):
                    clean = sym.strip().split(" as ")[-1].strip()
                    if clean:
                        imported_symbols.append((clean, i))
            match2 = re.search(r"import\s+(\w+)\s+from", line)
            if match2:
                imported_symbols.append((match2.group(1), i))

        # Verifică dacă simbolul apare în restul fișierului (în afara liniei de import)
        body_lines = content.splitlines()
        for symbol, imp_line in imported_symbols:
            body = "\n".join(
                l for j, l in enumerate(body_lines, 1)
                if j != imp_line and not l.strip().startswith("import")
            )
            if not re.search(r"\b" + re.escape(symbol) + r"\b", body):
                report.add_issue(file_rel, imp_line, "WARN", "unused_import", f"Import '{symbol}' nefolosit")
                print_issue("WARN", file_rel, imp_line, f"Import '{symbol}' nefolosit")
                found += 1

    if found == 0:
        print_ok("Niciun import nefolosit detectat!")


def analyze_empty_files(files: list[Path], root: Path, report: Report):
    """Detectează fișiere goale sau aproape goale."""
    print_section("FIȘIERE GOALE / PLACEHOLDER")

    found = 0
    for path in files:
        if path.suffix not in ALL_CODE_EXTS:
            continue
        content = read_file(path)
        if content is None:
            continue
        stripped = content.strip()
        lines = [l for l in stripped.splitlines() if l.strip()]
        file_rel = rel(path, root)

        if len(stripped) == 0:
            report.add_issue(file_rel, 0, "WARN", "empty_file", "Fișier complet gol")
            print_issue("WARN", file_rel, 0, "Fișier complet gol — șterge sau completează")
            found += 1
        elif len(lines) <= 2 and path.suffix in TS_JS_EXTS:
            report.add_issue(file_rel, 0, "INFO", "empty_file", f"Fișier cu doar {len(lines)} linii de cod")
            print_issue("INFO", file_rel, 0, f"Doar {len(lines)} linie(i) — posibil placeholder")
            found += 1

    if found == 0:
        print_ok("Niciun fișier gol detectat!")


# ─── RAPORT HTML ──────────────────────────────────────────────────────────────

def generate_html_report(report: Report, output_path: Path):
    """Generează un raport HTML interactiv."""

    err_count  = report.stats.get("sev_ERR",  0)
    warn_count = report.stats.get("sev_WARN", 0)
    info_count = report.stats.get("sev_INFO", 0)
    dup_count  = len(report.duplicates)
    dead_count = len(report.dead_code)
    fix_count  = len(report.fixes)

    issues_rows = ""
    for issue in report.issues:
        sev = issue["sev"]
        color = {"ERR": "#E24B4A", "WARN": "#EF9F27", "INFO": "#378ADD"}.get(sev, "#888")
        badge_bg = {"ERR": "#FCEBEB", "WARN": "#FAEEDA", "INFO": "#E6F1FB"}.get(sev, "#F1EFE8")
        icon = {"ERR": "✗", "WARN": "⚠", "INFO": "·"}.get(sev, "?")
        loc = f"{issue['file']}:{issue['line']}" if issue["line"] > 0 else issue["file"]
        issues_rows += f"""
        <tr>
          <td><span style="color:{color};font-weight:600;">{icon} {sev}</span></td>
          <td style="font-family:monospace;font-size:12px;color:#888;">{loc}</td>
          <td>{issue['message']}</td>
          <td><span style="background:{badge_bg};color:{color};padding:2px 8px;border-radius:4px;font-size:11px;">{issue['kind']}</span></td>
        </tr>"""

    dup_rows = ""
    for dup in report.duplicates:
        dup_rows += f"""
        <tr>
          <td style="font-family:monospace;color:#854F0B;">[{dup['hash']}]</td>
          <td>{dup['count']} fișiere</td>
          <td style="font-family:monospace;font-size:12px;">{"<br>".join(dup['files'][:3])}</td>
        </tr>"""

    dead_rows = ""
    for d in report.dead_code:
        dead_rows += f"""
        <tr>
          <td style="font-family:monospace;font-size:12px;color:#888;">{d['file']}</td>
          <td style="font-family:monospace;color:#3B6D11;">{d['symbol']}</td>
          <td style="font-size:12px;color:#888;">{d['kind']}</td>
        </tr>"""

    fix_rows = ""
    for fix in report.fixes:
        fix_rows += f"""
        <tr>
          <td style="font-family:monospace;font-size:12px;color:#888;">{fix['file']}</td>
          <td style="color:#3B6D11;">✓ {fix['desc']}</td>
        </tr>"""

    html = f"""<!DOCTYPE html>
<html lang="ro">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>codeClean Report — {datetime.now().strftime('%Y-%m-%d %H:%M')}</title>
<style>
  * {{ box-sizing: border-box; margin: 0; padding: 0; }}
  body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; background: #F8F8F8; color: #1A1A1A; font-size: 14px; line-height: 1.6; }}
  .header {{ background: #1A1A1A; color: #fff; padding: 2rem; }}
  .header h1 {{ font-size: 22px; font-weight: 600; margin-bottom: 4px; }}
  .header p {{ color: #888; font-size: 13px; }}
  .metrics {{ display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 12px; padding: 1.5rem 2rem; }}
  .metric {{ background: #fff; border: 0.5px solid #e5e5e5; border-radius: 8px; padding: 1rem; }}
  .metric-label {{ font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 4px; }}
  .metric-val {{ font-size: 28px; font-weight: 600; }}
  .metric-val.err {{ color: #E24B4A; }}
  .metric-val.warn {{ color: #EF9F27; }}
  .metric-val.info {{ color: #378ADD; }}
  .metric-val.ok {{ color: #3B6D11; }}
  .metric-val.neutral {{ color: #1A1A1A; }}
  section {{ margin: 0 2rem 2rem; background: #fff; border: 0.5px solid #e5e5e5; border-radius: 8px; overflow: hidden; }}
  .section-title {{ padding: 0.85rem 1.25rem; font-weight: 600; font-size: 13px; border-bottom: 0.5px solid #e5e5e5; background: #FAFAFA; display: flex; align-items: center; gap: 8px; }}
  table {{ width: 100%; border-collapse: collapse; }}
  th {{ text-align: left; padding: 8px 16px; font-size: 11px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; border-bottom: 0.5px solid #e5e5e5; }}
  td {{ padding: 8px 16px; border-bottom: 0.5px solid #f0f0f0; vertical-align: top; }}
  tr:last-child td {{ border-bottom: none; }}
  tr:hover td {{ background: #FAFAFA; }}
  .empty-state {{ padding: 2rem; text-align: center; color: #3B6D11; font-size: 13px; }}
  .footer {{ text-align: center; padding: 2rem; color: #888; font-size: 12px; }}
</style>
</head>
<body>
<div class="header">
  <h1>🧹 codeClean — Raport Analiză Cod</h1>
  <p>Generat la {datetime.now().strftime('%d %B %Y, %H:%M')} · Durată: {report.elapsed()}s · Rădăcină: {report.root}</p>
</div>

<div class="metrics">
  <div class="metric"><div class="metric-label">Erori critice</div><div class="metric-val err">{err_count}</div></div>
  <div class="metric"><div class="metric-label">Avertismente</div><div class="metric-val warn">{warn_count}</div></div>
  <div class="metric"><div class="metric-label">Informații</div><div class="metric-val info">{info_count}</div></div>
  <div class="metric"><div class="metric-label">Cod duplicat</div><div class="metric-val neutral">{dup_count}</div></div>
  <div class="metric"><div class="metric-label">Cod mort</div><div class="metric-val neutral">{dead_count}</div></div>
  <div class="metric"><div class="metric-label">Fix-uri aplicate</div><div class="metric-val ok">{fix_count}</div></div>
</div>

<section>
  <div class="section-title">⚠ Issues detectate ({len(report.issues)})</div>
  {"<table><thead><tr><th>Severitate</th><th>Locație</th><th>Mesaj</th><th>Tip</th></tr></thead><tbody>" + issues_rows + "</tbody></table>" if report.issues else '<div class="empty-state">✓ Niciun issue detectat!</div>'}
</section>

<section>
  <div class="section-title">≡ Cod duplicat ({dup_count})</div>
  {"<table><thead><tr><th>Hash</th><th>Apariții</th><th>Fișiere</th></tr></thead><tbody>" + dup_rows + "</tbody></table>" if report.duplicates else '<div class="empty-state">✓ Niciun duplicat detectat!</div>'}
</section>

<section>
  <div class="section-title">○ Cod mort — exporturi nefolosite ({dead_count})</div>
  {"<table><thead><tr><th>Fișier</th><th>Symbol</th><th>Tip</th></tr></thead><tbody>" + dead_rows + "</tbody></table>" if report.dead_code else '<div class="empty-state">✓ Niciun export neutilizat!</div>'}
</section>

{"<section><div class='section-title'>✓ Fix-uri aplicate (" + str(fix_count) + ")</div><table><thead><tr><th>Fișier</th><th>Acțiune</th></tr></thead><tbody>" + fix_rows + "</tbody></table></section>" if report.fixes else ""}

<div class="footer">codeClean · {datetime.now().year}</div>
</body>
</html>"""

    output_path.write_text(html, encoding="utf-8")


# ─── PROMPT AI ────────────────────────────────────────────────────────────────

def generate_ai_prompt(report: Report) -> str:
    """Generează un prompt structurat pentru AI (Claude/Trae/Cursor)."""
    critical = [i for i in report.issues if i["sev"] == "ERR"]
    warnings = [i for i in report.issues if i["sev"] == "WARN"]

    crit_list = "\n".join(f"- {i['file']}:{i['line']}: {i['message']}" for i in critical[:15])
    warn_list = "\n".join(f"- {i['file']}:{i['line']}: {i['message']}" for i in warnings[:15])
    dup_list  = "\n".join(f"- [{d['hash']}] în: {', '.join(d['files'][:2])}" for d in report.duplicates[:5])
    dead_list = "\n".join(f"- {d['file']}: export '{d['symbol']}'" for d in report.dead_code[:10])

    return f"""# codeClean — MISIUNE REFACTORING
Generat la: {datetime.now().strftime('%Y-%m-%d %H:%M')}

## REZUMAT
- Erori critice: {report.stats.get('sev_ERR', 0)}
- Avertismente: {report.stats.get('sev_WARN', 0)}
- Blocuri duplicate: {len(report.duplicates)}
- Exporturi moarte: {len(report.dead_code)}
- Fix-uri deja aplicate: {len(report.fixes)}

## ERORI CRITICE (rezolvă PRIMUL)
{crit_list if crit_list else "— niciuna —"}

## AVERTISMENTE
{warn_list if warn_list else "— niciuna —"}

## COD DUPLICAT (extrage în utilități comune)
{dup_list if dup_list else "— niciuna —"}

## EXPORTURI NEFOLOSITE (verifică și șterge dacă nu sunt necesare)
{dead_list if dead_list else "— niciuna —"}

## REGULI DE URMAT
1. Rezolvă erorile critice (ERR) mai întâi, în ordine.
2. Nu modifica logica de business, doar curăță codul.
3. TypeScript strict — zero `any`, zero `as any`.
4. Elimină toate console.log din producție.
5. Next.js 15: params și searchParams sunt Promise-uri — folosește await.
6. Pentru cod duplicat: extrage în funcții/utilități comune.
7. Șterge exporturile moarte doar după ce verifici că nu sunt folosite dinamic.

Începe cu fișierele care au cele mai multe erori critice.
"""


# ─── MAIN ─────────────────────────────────────────────────────────────────────

def main():
    parser = argparse.ArgumentParser(
        description="codeClean — Universal Code Analysis Engine",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemple:
  python codeClean.py                        # Analiză completă în directorul curent
  python codeClean.py --path ./src           # Analizează doar src/
  python codeClean.py --fix                  # Aplică fix-uri automate (console.log etc.)
  python codeClean.py --report               # Generează HTML + prompt AI
  python codeClean.py --fix --report         # Totul dintr-o dată
  python codeClean.py --path ./src --fix --report --min-lines 8
        """
    )
    parser.add_argument("--path",      default=".", help="Directorul rădăcină de analizat (default: .)")
    parser.add_argument("--fix",       action="store_true", help="Aplică fix-uri automate (console.log, etc.)")
    parser.add_argument("--report",    action="store_true", help="Generează report HTML + prompt AI")
    parser.add_argument("--min-lines", type=int, default=6, help="Linii minime pentru detectare duplicate (default: 6)")
    parser.add_argument("--json",      action="store_true", help="Afișează output JSON în loc de text colorat")
    args = parser.parse_args()

    root = Path(args.path).resolve()
    if not root.exists():
        print(f"{RED}Eroare: directorul '{root}' nu există.{RESET}")
        sys.exit(1)

    print_header()
    print(f"  {c('Rădăcină:', DIM)} {root}")
    print(f"  {c('Mod:', DIM)} {'FIX + ANALIZĂ' if args.fix else 'ANALIZĂ (read-only)'}")
    print(f"  {c('Raport:', DIM)} {'DA — HTML + AI prompt' if args.report else 'NU'}\n")

    report = Report(root)
    all_files = get_files(root, ALL_CODE_EXTS)

    print(f"  {c(f'Fișiere găsite: {len(all_files)}', DIM)}")

    # Rulează toate analizele
    analyze_smells(all_files, root, report)
    analyze_duplicates(all_files, root, report, min_lines=args.min_lines)
    analyze_dead_exports(all_files, root, report)
    analyze_unused_imports(all_files, root, report)
    analyze_large_files(all_files, root, report)
    analyze_empty_files(all_files, root, report)

    # Fix-uri automate (dacă --fix)
    if args.fix:
        analyze_console_cleanup(all_files, root, report, fix=True)

    # Summary
    elapsed = report.elapsed()
    err  = report.stats.get("sev_ERR",  0)
    warn = report.stats.get("sev_WARN", 0)
    info = report.stats.get("sev_INFO", 0)
    dups = len(report.duplicates)
    dead = len(report.dead_code)
    fixes = len(report.fixes)

    print(f"\n{c('═' * 70, CYAN)}")
    print(c("  SUMAR FINAL", BOLD + WHITE))
    print(f"{c('═' * 70, CYAN)}")
    print(f"  {c('✗', RED)}  Erori critice : {c(str(err),  BOLD + RED)}")
    print(f"  {c('⚠', YELLOW)}  Avertismente  : {c(str(warn), BOLD + YELLOW)}")
    print(f"  {c('·', BLUE)}  Informații    : {c(str(info), BOLD + BLUE)}")
    print(f"  {c('≡', YELLOW)}  Duplicate     : {c(str(dups), BOLD + WHITE)}")
    print(f"  {c('○', DIM)}  Cod mort      : {c(str(dead), BOLD + WHITE)}")
    if fixes:
        print(f"  {c('→', CYAN)}  Fix-uri aplicate: {c(str(fixes), BOLD + GREEN)}")
    print(f"\n  {c(f'Timp: {elapsed}s', DIM)}\n")

    if err == 0 and warn == 0:
        print(f"  {c('✓ Codul este curat!', BOLD + GREEN)}\n")
    elif err > 0:
        print(f"  {c(f'⚠ {err} erori critice necesită atenție imediată.', BOLD + RED)}\n")
    else:
        print(f"  {c(f'⚠ {warn} avertismente de rezolvat.', BOLD + YELLOW)}\n")

    # Generează rapoarte (dacă --report)
    if args.report:
        html_path = root / "codeClean_report.html"
        generate_html_report(report, html_path)
        print(f"  {c('→', CYAN)} Raport HTML: {html_path}")

        prompt_path = root / "codeClean_prompt.md"
        prompt_path.write_text(generate_ai_prompt(report), encoding="utf-8")
        print(f"  {c('→', CYAN)} Prompt AI:   {prompt_path}\n")

    # JSON output (dacă --json)
    if args.json:
        print(json.dumps(report.as_dict(), indent=2, ensure_ascii=False))

    # Exit code — util pentru CI/CD
    sys.exit(1 if err > 0 else 0)


if __name__ == "__main__":
    main()
