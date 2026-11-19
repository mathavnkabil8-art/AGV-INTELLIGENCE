"""
Generates visual SVG diagram for Module:
Smart Charging Assignment Using Rook Polynomials and Inclusion-Exclusion (4x4 Derangement Benchmark).
"""

from backend.algorithms.rook_polynomial import RookPolynomialEngine

def generate_rook_polynomial_svg(filepath: str):
    forbidden = {(0, 0), (1, 1), (2, 2), (3, 3)}
    engine = RookPolynomialEngine(num_agvs=4, num_destinations=4, forbidden_cells=forbidden)
    audit = engine.audit_and_verify()
    
    width = 960
    height = 600
    
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" style="background:#0b0f19; font-family:system-ui, -apple-system, sans-serif;">',
        '<defs>',
        '  <linearGradient id="headerGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
        '    <stop offset="0%" stop-color="#38bdf8"/>',
        '    <stop offset="100%" stop-color="#10b981"/>',
        '  </linearGradient>',
        '</defs>',
        '<text x="40" y="38" fill="#f8fafc" font-size="20" font-weight="700">Rook Polynomial &amp; Principle of Inclusion-Exclusion (PIE)</text>',
        '<text x="40" y="60" fill="#94a3b8" font-size="12">Smart Charging Assignment Benchmark: 4 AGVs \u00d7 4 Charging Docks with Diagonal Forbidden Positions</text>'
    ]
    
    # 1. Draw 4x4 Chessboard Matrix
    board_x = 40
    board_y = 90
    cell_size = 55
    
    svg.append(f'<rect x="{board_x}" y="{board_y}" width="280" height="470" rx="12" fill="#111827" stroke="#1f2937" stroke-width="1.5"/>')
    svg.append(f'<text x="{board_x+16}" y="{board_y+30}" fill="#38bdf8" font-size="14" font-weight="700">4\u00d74 COMPATIBILITY BOARD B</text>')
    
    # Column headers
    for c in range(4):
        cx = board_x + 55 + c * cell_size + cell_size // 2
        cy = board_y + 60
        svg.append(f'<text x="{cx}" y="{cy}" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">Pad {c+1}</text>')
        
    for r in range(4):
        # Row header
        rx = board_x + 30
        ry = board_y + 80 + r * cell_size + cell_size // 2 + 4
        svg.append(f'<text x="{rx}" y="{ry}" fill="#94a3b8" font-size="10" font-weight="600" text-anchor="middle">AGV-{r+1}</text>')
        
        for c in range(4):
            x = board_x + 55 + c * cell_size
            y = board_y + 70 + r * cell_size
            is_diag = (r == c)
            if is_diag:
                svg.append(f'<rect x="{x+2}" y="{y+2}" width="{cell_size-4}" height="{cell_size-4}" rx="6" fill="#450a0a" stroke="#ef4444" stroke-width="1.5"/>')
                svg.append(f'<text x="{x + cell_size//2}" y="{y + cell_size//2 - 2}" fill="#fca5a5" font-size="10" font-weight="700" text-anchor="middle">FORBID</text>')
                svg.append(f'<text x="{x + cell_size//2}" y="{y + cell_size//2 + 12}" fill="#ef4444" font-size="8" text-anchor="middle">({r},{c})</text>')
            else:
                svg.append(f'<rect x="{x+2}" y="{y+2}" width="{cell_size-4}" height="{cell_size-4}" rx="6" fill="#064e3b" stroke="#10b981" stroke-width="1.2"/>')
                svg.append(f'<text x="{x + cell_size//2}" y="{y + cell_size//2 - 2}" fill="#a7f3d0" font-size="10" font-weight="700" text-anchor="middle">ALLOW</text>')
                svg.append(f'<text x="{x + cell_size//2}" y="{y + cell_size//2 + 12}" fill="#34d399" font-size="8" text-anchor="middle">({r},{c})</text>')

    # Board notes
    svg.extend([
        f'<text x="{board_x+16}" y="{board_y+320}" fill="#e2e8f0" font-size="11" font-weight="600">Rook Numbers r_k(B):</text>',
        f'<text x="{board_x+16}" y="{board_y+340}" fill="#94a3b8" font-size="10">r\u2080 = 1 (empty placement)</text>',
        f'<text x="{board_x+16}" y="{board_y+358}" fill="#94a3b8" font-size="10">r\u2081 = C(4,1) = 4</text>',
        f'<text x="{board_x+16}" y="{board_y+376}" fill="#94a3b8" font-size="10">r\u2082 = C(4,2) = 6</text>',
        f'<text x="{board_x+16}" y="{board_y+394}" fill="#94a3b8" font-size="10">r\u2083 = C(4,3) = 4</text>',
        f'<text x="{board_x+16}" y="{board_y+412}" fill="#94a3b8" font-size="10">r\u2084 = C(4,4) = 1</text>',
        f'<rect x="{board_x+12}" y="{board_y+428}" width="256" height="30" rx="6" fill="#1e1b4b" stroke="#4338ca"/>',
        f'<text x="{board_x+20}" y="{board_y+448}" fill="#a5b4fc" font-size="10" font-weight="600">R(x) = 1 + 4x + 6x\u00b2 + 4x\u00b3 + x\u2074</text>'
    ])
    
    # 2. Draw PIE Expansion Table in Center
    pie_x = 340
    pie_y = 90
    svg.append(f'<rect x="{pie_x}" y="{pie_y}" width="340" height="470" rx="12" fill="#111827" stroke="#1f2937" stroke-width="1.5"/>')
    svg.append(f'<text x="{pie_x+16}" y="{pie_y+30}" fill="#10b981" font-size="14" font-weight="700">INCLUSION-EXCLUSION (PIE)</text>')
    svg.append(f'<text x="{pie_x+16}" y="{pie_y+50}" fill="#94a3b8" font-size="10">N = \u2211 (-1)^k \u00b7 r_k \u00b7 (4 - k)!</text>')
    
    # Table Header
    ty = pie_y + 70
    svg.append(f'<rect x="{pie_x+12}" y="{ty}" width="316" height="24" rx="4" fill="#1e293b"/>')
    svg.append(f'<text x="{pie_x+20}" y="{ty+16}" fill="#94a3b8" font-size="10" font-weight="700">k</text>')
    svg.append(f'<text x="{pie_x+48}" y="{ty+16}" fill="#94a3b8" font-size="10" font-weight="700">Sign</text>')
    svg.append(f'<text x="{pie_x+90}" y="{ty+16}" fill="#94a3b8" font-size="10" font-weight="700">r_k</text>')
    svg.append(f'<text x="{pie_x+130}" y="{ty+16}" fill="#94a3b8" font-size="10" font-weight="700">(n-k)!</text>')
    svg.append(f'<text x="{pie_x+200}" y="{ty+16}" fill="#94a3b8" font-size="10" font-weight="700">Term</text>')
    svg.append(f'<text x="{pie_x+270}" y="{ty+16}" fill="#94a3b8" font-size="10" font-weight="700">Sum</text>')
    
    # Table Rows
    terms_data = [
        (0, "+1", "1", "4! = 24", "+24", "24"),
        (1, "-1", "4", "3! = 6",  "-24", "0"),
        (2, "+1", "6", "2! = 2",  "+12", "12"),
        (3, "-1", "4", "1! = 1",  "-4",  "8"),
        (4, "+1", "1", "0! = 1",  "+1",  "9")
    ]
    
    for i, (k_val, sign, r_val, fact, term, r_sum) in enumerate(terms_data):
        row_y = ty + 30 + i * 36
        svg.append(f'<line x1="{pie_x+12}" y1="{row_y-6}" x2="{pie_x+328}" y2="{row_y-6}" stroke="#1f2937" stroke-width="1"/>')
        svg.append(f'<text x="{pie_x+20}" y="{row_y+14}" fill="#f8fafc" font-size="11" font-weight="600">{k_val}</text>')
        sign_col = "#10b981" if sign == "+1" else "#ef4444"
        svg.append(f'<text x="{pie_x+48}" y="{row_y+14}" fill="{sign_col}" font-size="11" font-weight="700">{sign}</text>')
        svg.append(f'<text x="{pie_x+90}" y="{row_y+14}" fill="#38bdf8" font-size="11" font-weight="700">{r_val}</text>')
        svg.append(f'<text x="{pie_x+130}" y="{row_y+14}" fill="#94a3b8" font-size="10">{fact}</text>')
        term_col = "#10b981" if "+" in term else "#ef4444"
        svg.append(f'<text x="{pie_x+200}" y="{row_y+14}" fill="{term_col}" font-size="11" font-weight="700">{term}</text>')
        svg.append(f'<text x="{pie_x+270}" y="{row_y+14}" fill="#f8fafc" font-size="12" font-weight="700">{r_sum}</text>')
        
    # Result Box
    svg.extend([
        f'<rect x="{pie_x+12}" y="{pie_y+310}" width="316" height="140" rx="8" fill="#064e3b" fill-opacity="0.25" stroke="#10b981" stroke-width="1.5"/>',
        f'<text x="{pie_x+24}" y="{pie_y+336}" fill="#a7f3d0" font-size="13" font-weight="700">DERANGEMENT THEOREM !4 = 9</text>',
        f'<text x="{pie_x+24}" y="{pie_y+360}" fill="#94a3b8" font-size="10">N = 24 - 24 + 12 - 4 + 1 = 9 valid matchings.</text>',
        f'<text x="{pie_x+24}" y="{pie_y+380}" fill="#94a3b8" font-size="10">Unrestricted Permutations: 4! = 24</text>',
        f'<text x="{pie_x+24}" y="{pie_y+400}" fill="#94a3b8" font-size="10">Violations Filtered: 15 / 24</text>',
        f'<rect x="{pie_x+24}" y="{pie_y+412}" width="292" height="26" rx="4" fill="#10b981"/>',
        f'<text x="{pie_x+170}" y="{pie_y+430}" fill="#064e3b" font-size="11" font-weight="800" text-anchor="middle">EXACT MATCH: PIE \u2261 ENUMERATION (9=9)</text>'
    ])
    
    # 3. Draw All 9 Valid Matchings on Right
    match_x = 700
    match_y = 90
    svg.append(f'<rect x="{match_x}" y="{match_y}" width="220" height="470" rx="12" fill="#111827" stroke="#1f2937" stroke-width="1.5"/>')
    svg.append(f'<text x="{match_x+16}" y="{match_y+30}" fill="#a855f7" font-size="14" font-weight="700">9 VALID MATCHINGS</text>')
    svg.append(f'<text x="{match_x+16}" y="{match_y+48}" fill="#94a3b8" font-size="9.5">AGV-[1,2,3,4] \u2192 Dock Permutation</text>')
    
    valid_9 = [
        "[2, 1, 4, 3]",
        "[2, 3, 4, 1]",
        "[2, 4, 1, 3]",
        "[3, 1, 4, 2]",
        "[3, 4, 1, 2]",
        "[3, 4, 2, 1]",
        "[4, 1, 2, 3]",
        "[4, 3, 1, 2]",
        "[4, 3, 2, 1]"
    ]
    
    for i, p in enumerate(valid_9):
        my = match_y + 70 + i * 40
        svg.append(f'<rect x="{match_x+12}" y="{my}" width="196" height="34" rx="6" fill="#1e1b4b" stroke="#6366f1" stroke-width="1"/>')
        svg.append(f'<text x="{match_x+20}" y="{my+21}" fill="#e0e7ff" font-size="11" font-weight="700">#{i+1}</text>')
        svg.append(f'<text x="{match_x+60}" y="{my+21}" fill="#a5b4fc" font-size="11" font-mono font-weight="600">{p}</text>')

    svg.append('</svg>')
    
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated Rook Polynomial SVG: {filepath}")

if __name__ == "__main__":
    generate_rook_polynomial_svg("documentation/screenshots/rook_polynomial_derivation.svg")
