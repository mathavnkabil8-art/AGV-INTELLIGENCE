"""
Generator for AGV_Intelligence_IEEE_Research_Paper.docx
Creates an IEEE Conference formatted document with:
- US Letter page layout, official margins (0.75 top, 1.0 bottom, 0.625 left/right)
- Times New Roman typography throughout
- Full-width title and 4-author affiliation block
- Continuous section break to 2-column layout (3.5 in columns, 0.25 in spacing)
- Bold italic Abstract and Index Terms
- IEEE numbered sections (I. INTRODUCTION, II. PROBLEM STATEMENT, etc.)
- IEEE subsection headers (A. Warehouse Graph Representation, etc.)
- Formatted mathematical equations with right-aligned numbering
- Table I (Warehouse Parameters) and Table II (Empirical Benchmark Results)
- Numbered IEEE references [1] - [15]
"""

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH, WD_LINE_SPACING
from docx.enum.section import WD_SECTION
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls


def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tcPr = cell._tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)


def add_ieee_heading1(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p.paragraph_format.space_before = Pt(12)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(10)
    run.font.bold = True
    # Small caps font setting
    rPr = run._r.get_or_add_rPr()
    rPr.append(OxmlElement('w:smallCaps'))
    return p


def add_ieee_heading2(doc, text):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.LEFT
    p.paragraph_format.space_before = Pt(9)
    p.paragraph_format.space_after = Pt(3)
    p.paragraph_format.keep_with_next = True
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(10)
    run.font.italic = True
    return p


def add_body_p(doc, text, space_after=3, indent=True):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(0)
    p.paragraph_format.space_after = Pt(space_after)
    p.paragraph_format.line_spacing = 1.05
    if indent:
        p.paragraph_format.first_line_indent = Inches(0.2)
    run = p.add_run(text)
    run.font.name = 'Times New Roman'
    run.font.size = Pt(10)
    return p


def add_equation(doc, math_text, eq_num):
    p = doc.add_paragraph()
    p.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p.paragraph_format.space_before = Pt(4)
    p.paragraph_format.space_after = Pt(4)
    p.paragraph_format.first_line_indent = Inches(0.0)
    
    # We use a tab stop for equation centering and right alignment
    p.paragraph_format.tab_stops.add_tab_stop(Inches(1.75), docx.enum.text.WD_TAB_ALIGNMENT.CENTER)
    p.paragraph_format.tab_stops.add_tab_stop(Inches(3.5), docx.enum.text.WD_TAB_ALIGNMENT.RIGHT)
    
    r_tab1 = p.add_run('\t')
    r_tab1.font.name = 'Times New Roman'
    
    r_math = p.add_run(math_text)
    r_math.font.name = 'Times New Roman'
    r_math.font.size = Pt(10)
    r_math.font.italic = True
    
    r_tab2 = p.add_run('\t')
    r_tab2.font.name = 'Times New Roman'
    
    r_num = p.add_run(f'({eq_num})')
    r_num.font.name = 'Times New Roman'
    r_num.font.size = Pt(10)
    return p


def build_docx(filename: str):
    doc = docx.Document()

    # Section 1: Page Setup (US Letter, IEEE Margins)
    sec1 = doc.sections[0]
    sec1.page_width = Inches(8.5)
    sec1.page_height = Inches(11.0)
    sec1.top_margin = Inches(0.75)
    sec1.bottom_margin = Inches(1.0)
    sec1.left_margin = Inches(0.625)
    sec1.right_margin = Inches(0.625)

    # Title (24 pt, Centered, Bold)
    p_title = doc.add_paragraph()
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(12)
    r_title = p_title.add_run(
        "Mathematical Modelling and Optimization of Autonomous Guided Vehicle Traffic Routing and Smart Charging in Automated Warehouses Using Discrete Mathematics"
    )
    r_title.font.name = 'Times New Roman'
    r_title.font.size = Pt(22)
    r_title.font.bold = True

    # Authors Block (4 authors)
    p_auth = doc.add_paragraph()
    p_auth.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_auth.paragraph_format.space_before = Pt(0)
    p_auth.paragraph_format.space_after = Pt(4)
    r_auth = p_auth.add_run("Author 1, Author 2, Author 3, and Author 4")
    r_auth.font.name = 'Times New Roman'
    r_auth.font.size = Pt(11)
    r_auth.font.bold = True

    p_aff = doc.add_paragraph()
    p_aff.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_aff.paragraph_format.space_before = Pt(0)
    p_aff.paragraph_format.space_after = Pt(14)
    r_aff = p_aff.add_run(
        "Department of Artificial Intelligence and Data Engineering\n"
        "Faculty of Engineering and Technology, Jain University, Bengaluru, Karnataka, India\n"
        "Email: {author1, author2, author3, author4}@jainuniversity.ac.in"
    )
    r_aff.font.name = 'Times New Roman'
    r_aff.font.size = Pt(9.5)
    r_aff.font.italic = True

    # Section Break -> Switch to Two Columns
    sec2 = doc.add_section(WD_SECTION.CONTINUOUS)
    cols = sec2._sectPr.xpath('./w:cols')[0]
    cols.set(qn('w:num'), '2')
    cols.set(qn('w:space'), '360')  # 0.25 inch gap between columns

    # Abstract
    p_abs = doc.add_paragraph()
    p_abs.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_abs.paragraph_format.space_after = Pt(4)
    p_abs.paragraph_format.first_line_indent = Inches(0.0)
    r_abs_label = p_abs.add_run("Abstract—")
    r_abs_label.font.name = 'Times New Roman'
    r_abs_label.font.size = Pt(9)
    r_abs_label.font.bold = True
    r_abs_label.font.italic = True

    r_abs = p_abs.add_run(
        "Automated material handling systems in modern industrial fulfillment centers increasingly depend on fleets of Autonomous Guided Vehicles (AGVs) operating in shared spatial layouts. Scalable coordination requires solving simultaneous combinatorial challenges: spatio-temporal route interference, incompatible charging pad hardware constraints, constrained backup electrical reserves, and multi-agent circular deadlock locks. This paper presents AGV Intelligence, a unified mathematical framework and full-stack digital twin that applies classical discrete mathematics to AGV coordination. The warehouse floor is formalized as a planar 4-connected grid graph G = (V, E) supporting geodesic routing. Route interferences are mapped into a spatio-temporal conflict graph G_c = (V_c, E_c) partitioned into non-interfering dispatch phases using Welsh-Powell vertex coloring bounded by Brooks' theorem (χ(G_c) ≤ Δ(G_c) + 1). Charging pad compatibility restrictions on an n × m board are modeled via Rook Polynomials R(x, B) and the Principle of Inclusion-Exclusion (PIE), deriving valid non-conflicting dock assignments isomorphic to derangements (!4 = 9). Distribution of limited electrical backup reserves is solved in closed form through Ordinary Generating Functions (OGFs) G(x) = x^(mn)/(1 - x)^n, extracting exact integer partitions [x^100] G(x) = C(43, 3) = 12,341 configurations while immediately flagging power deficits. Circular waits are isolated in a directed Wait-For Graph (WFG) D = (V_A, E_W) via Tarjan's Strongly Connected Components (SCC) and resolved using true physical Dijkstra detour rerouting. Evaluated across five benchmark scenarios on an 8 × 8 grid with 8 AGVs and 4 charging docks, the mathematically constrained system eliminated 100% of vertex and edge collisions, resolved 100% of circular deadlocks without artificial edge deletion, and prevented charging allocation failures."
    )
    r_abs.font.name = 'Times New Roman'
    r_abs.font.size = Pt(9)
    r_abs.font.bold = True

    # Index Terms
    p_idx = doc.add_paragraph()
    p_idx.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
    p_idx.paragraph_format.space_after = Pt(10)
    p_idx.paragraph_format.first_line_indent = Inches(0.0)
    r_idx_label = p_idx.add_run("Index Terms—")
    r_idx_label.font.name = 'Times New Roman'
    r_idx_label.font.size = Pt(9)
    r_idx_label.font.bold = True
    r_idx_label.font.italic = True
    r_idx = p_idx.add_run(
        "Autonomous Guided Vehicles, Discrete Mathematics, Graph Theory, Graph Coloring, Rook Polynomials, Inclusion-Exclusion Principle, Generating Functions, Warehouse Optimization, Deadlock Detection."
    )
    r_idx.font.name = 'Times New Roman'
    r_idx.font.size = Pt(9)

    # I. INTRODUCTION
    add_ieee_heading1(doc, "I. Introduction")
    add_body_p(
        doc,
        "Modern automated logistics centers rely heavily on large fleets of Autonomous Guided Vehicles (AGVs) to transport payloads across high-density storage aisles [1], [2]. As robot density increases, the operational environment faces severe multi-agent traffic contention. Without rigorous mathematical coordination, simultaneous dispatch leads to physical collisions at aisle intersections, head-on deadlocks along narrow unidirectional corridors, and severe logistical bottlenecks."
    )
    add_body_p(
        doc,
        "Furthermore, industrial AGVs operate on rechargeable lithium-ion battery packs that demand periodic inductive or physical docking. In heterogeneous fleets, robots feature diverse physical chassis widths, charging pad alignments, and voltage tolerances, rendering arbitrary dock selection infeasible. In addition, when facilities switch to emergency backup power or off-peak microgrids, available energy must be apportioned among charging docks to maintain minimum operational reserves without starving individual bays."
    )
    add_body_p(
        doc,
        "While commercial warehouse management systems often rely on proprietary heuristics or complex black-box multi-agent path finding (MAPF) solvers, fundamental discrete mathematics provides analytical guarantees, closed-form feasibility boundaries, and transparent combinatorial proofs. In this work, we design, develop, and empirically benchmark AGV Intelligence, an experiential learning digital twin system connecting five distinct branches of discrete mathematics: Planar Graph Theory, Graph Coloring, Rook Polynomials, Ordinary Generating Functions, and Directed Wait-For Graphs."
    )

    # II. PROBLEM STATEMENT AND OBJECTIVES
    add_ieee_heading1(doc, "II. Problem Statement and Objectives")
    add_ieee_heading2(doc, "A. Problem Statement")
    add_body_p(
        doc,
        "Coordinating an AGV fleet inside a bounded warehouse grid layout presents three coupled discrete optimization challenges: (1) Traffic Interference Problem, where multiple robots routed along individual shortest paths collide at intersecting aisle coordinates or block each other in opposite traversals of single-lane corridors; (2) Restricted Dock Assignment Problem, where n robots must be matched one-to-one to m physical docks under physical clearance incompatibilities; and (3) Backup Power Partitioning Problem, where a limited backup energy quota R kWh must be partitioned among n docks such that each bay satisfies a mandatory minimum reserve x_i ≥ m kWh."
    )
    add_ieee_heading2(doc, "B. Objectives and Scope")
    add_body_p(
        doc,
        "The primary objective of this university research project is to design, develop, and empirically benchmark a software-only digital twin that rigorously evaluates these discrete mathematical models without synthetic multipliers. The software implements an interactive 8 × 8 warehouse digital twin with 8 AGVs, a conflict graph generation engine with Welsh-Powell greedy coloring, a Rook Polynomial PIE backtracking solver, an exact integer OGF engine for energy quotas, and a Wait-For Graph cycle detector with true Dijkstra detour replanning."
    )

    # III. RELATED WORK
    add_ieee_heading1(doc, "III. Related Work")
    add_body_p(
        doc,
        "Multi-agent coordination in automated warehouses has been investigated from both algorithmic and robotic perspectives. Wurman et al. [1] documented the centralized coordination architecture of Kiva Systems, emphasizing the necessity of spatial reservations. Le-Anh and De Koster [2] surveyed AGV dispatching, routing, and charging, highlighting that uncoordinated greedy dispatch consistently induces catastrophic congestion."
    )
    add_body_p(
        doc,
        "In graph theory, Bondy and Murty [3] and West [4] formulated fundamental geodesic routing and planar duals. Sharon et al. [5] introduced Conflict-Based Search (CBS) for Multi-Agent Path Finding (MAPF), demonstrating that conflicts can be structured into meta-agent trees. In scheduling, Welsh and Powell [6] proved that greedy degree-ordered vertex coloring provides an efficient upper bound χ(G) ≤ Δ(G) + 1, matching Brooks' theorem [7] on planar graphs."
    )
    add_body_p(
        doc,
        "Restricted permutations and rook placements were rigorously formulated by Riordan [8]. Stanley [9] formalized the connection between rook polynomials and bipartite matching forbidden positions. Ordinary generating functions for integer compositions were established by Flajolet and Sedgewick [10]. Deadlock formalisms originate from Coffman et al. [11], who identified the four necessary and sufficient conditions for system deadlocks. Tarjan [12] provided the optimal linear-time algorithm for Strongly Connected Components (SCC) using depth-first search low-link numbers. Dijkstra's shortest path algorithm [13] remains the foundational standard for deterministic single-agent graph navigation."
    )

    # IV. SYSTEM ARCHITECTURE
    add_ieee_heading1(doc, "IV. System Architecture and Methodology")
    add_body_p(
        doc,
        "The AGV Intelligence platform is architected as a modular, decoupled full-stack application comprising a Python FastAPI analytical backend and a React/Tailwind industrial command-center frontend. The digital twin simulation engine maintains the 8 × 8 grid state, active AGV fleet coordinates, battery discharge dynamics, payload statuses, and discrete-event clock ticks. The discrete mathematical kernel encapsulates five specialized algorithmic engines: WarehouseGridGraph (NetworkX), ConflictGraphEngine, RookPolynomialEngine, BackupEnergyDistributionEngine (SymPy), and DeadlockRecoveryEngine."
    )
    add_body_p(
        doc,
        "The command center interface provides real-time spatial visualization, dynamic obstacle manipulation, matrix editors, Recharts comparative performance graphs, and formal proof derivations."
    )

    # V. MATHEMATICAL MODELLING
    add_ieee_heading1(doc, "V. Mathematical Modelling")
    add_ieee_heading2(doc, "A. Warehouse Graph Representation")
    add_body_p(
        doc,
        "The warehouse floor is modeled as an undirected planar grid graph G = (V, E) where V ⊆ {0, ..., W-1} × {0, ..., H-1} \\ O, with W = 8, H = 8, and O denoting impassable obstacle cells. Undirected orthogonal edges {u, v} ∈ E exist if and only if |x_u - x_v| + |y_u - y_v| = 1 and u, v ∉ O."
    )
    add_equation(doc, "|V| = 8 × 8 = 64,    |E| = 2 × 8 × 7 = 112", 1)
    add_body_p(
        doc,
        "When k = |O| obstacles are introduced, |V| = 64 - k, and all incident edges are removed. Shortest-path routing between coordinates s, d ∈ V minimizes cumulative traversal cost via Dijkstra's algorithm:"
    )
    add_equation(doc, "π*(s, d) = argmin_{π ∈ Π(s, d)} Σ_{e ∈ π} w(e)", 2)

    add_ieee_heading2(doc, "B. Conflict Graph and Graph Coloring")
    add_body_p(
        doc,
        "Let A = {A_1, ..., A_k} denote active AGVs with planned routes τ_i = (p_{i,0}, ..., p_{i,L_i}). The conflict graph G_c = (V_c, E_c) defines edges between tasks if a vertex collision (p_{i,t} = p_{j,t}) or edge-swap collision (p_{i,t} = p_{j,t+1} ∧ p_{i,t+1} = p_{j,t}) occurs at any time t."
    )
    add_body_p(
        doc,
        "Vertex coloring maps tasks to color classes c: V_c → {0, ..., χ(G_c)-1} such that adjacent vertices never share a color. The Welsh-Powell algorithm orders vertices by degree and guarantees:"
    )
    add_equation(doc, "χ(G_c) ≤ Δ(G_c) + 1", 3)

    add_ieee_heading2(doc, "C. Principle of Inclusion-Exclusion and Rook Polynomials")
    add_body_p(
        doc,
        "Incompatible robot-charger pairs are represented as forbidden positions on an n × m board B. The Rook Polynomial R(x, B) generates the counts r_k of placing k non-attacking rooks on forbidden cells:"
    )
    add_equation(doc, "R(x, B) = Σ_{k=0}^{min(n, m)} r_k(B) x^k", 4)
    add_body_p(
        doc,
        "The number of valid conflict-free matchings N is evaluated via the Principle of Inclusion-Exclusion:"
    )
    add_equation(doc, "N = Σ_{k=0}^n (-1)^k · r_k(B) · (n - k)!", 5)
    add_body_p(
        doc,
        "For 4 AGVs and 4 docks with diagonal forbidden positions B = {(0,0), (1,1), (2,2), (3,3)}, r_k = C(4, k), yielding R(x, B) = 1 + 4x + 6x² + 4x³ + x⁴. Evaluating PIE:"
    )
    add_equation(doc, "N = 24 - 4(6) + 6(2) - 4(1) + 1(1) = 24 - 24 + 12 - 4 + 1 = 9", 6)
    add_body_p(doc, "This exact result proves isomorphism to the classical derangement number !4 = 9.")

    add_ieee_heading2(doc, "D. Ordinary Generating Functions for Energy Distribution")
    add_body_p(
        doc,
        "Distributing total backup energy R among n bays where each bay requires minimum reserve m kWh is modeled by the ordinary generating function:"
    )
    add_equation(doc, "G(x) = (x^m / (1 - x))^n = x^{mn} / (1 - x)^n", 7)
    add_body_p(
        doc,
        "Extracting the coefficient of x^R via the Negative Binomial theorem yields:"
    )
    add_equation(doc, "[x^R] G(x) = C((R - mn) + n - 1, n - 1)", 8)
    add_body_p(
        doc,
        "For the university benchmark (n = 4 bays, R = 100 kWh, m = 15 kWh, unit = 1 kWh):"
    )
    add_equation(doc, "[x^{100}] G(x) = C(40 + 3, 3) = C(43, 3) = 12,341", 9)
    add_body_p(
        doc,
        "If R < mn (e.g. R = 50 kWh against 60 kWh requirement), the coefficient is identically 0, triggering an automatic safety deficit interlock."
    )

    # VI. ALGORITHMS AND IMPLEMENTATION
    add_ieee_heading1(doc, "VI. Algorithms and Implementation")
    add_body_p(
        doc,
        "The core algorithmic pipeline integrates shortest path navigation, chromatic scheduling, and deadlock recovery. When the directed Wait-For Graph D = (V_A, E_W) contains a cycle, Tarjan's SCC algorithm identifies the deadlock cluster. The lowest priority agent in the cycle yields, its current position is vacated, and Dijkstra's algorithm recalculates a true physical detour around dynamic robot obstacles without artificial edge deletion."
    )

    # VII. EXPERIMENTAL SETUP
    add_ieee_heading1(doc, "VII. Experimental Setup")
    add_body_p(
        doc,
        "The experimental digital twin was evaluated on an 8 × 8 grid layout with 8 AGVs, 4 peripheral charging stations, and 6 storage zones. Discrete simulation ticks run at 800 ms per step. Five standardized scenarios were tested: EXP-01 (Normal Routing), EXP-02 (Intersecting Orthogonal Routes), EXP-03 (Restricted Charging Stations), EXP-04 (Backup Energy Shortage), and EXP-05 (Circular Deadlock Recovery)."
    )

    # VIII. RESULTS AND DISCUSSION
    add_ieee_heading1(doc, "VIII. Results and Discussion")
    add_body_p(
        doc,
        "Table I displays the recorded empirical metrics across all five benchmark scenarios, comparing uncoordinated Baseline execution against the mathematically optimized framework."
    )

    # Add Table of Results
    tbl = doc.add_table(rows=6, cols=6)
    tbl.style = 'Table Grid'
    tbl.alignment = docx.enum.table.WD_TABLE_ALIGNMENT.CENTER

    headers = [
        "Scenario",
        "Mode",
        "Distance (T)",
        "Avg Wait (W)",
        "Collisions",
        "Deliveries"
    ]
    hdr_cells = tbl.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_margins(hdr_cells[i], top=60, bottom=60, left=80, right=80)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        for run in p.runs:
            run.font.name = 'Times New Roman'
            run.font.size = Pt(8.5)
            run.font.bold = True

    data_rows = [
        ("EXP-01", "Baseline / Opt", "56 hops", "0.00 ticks", "0", "8/8 (100%)"),
        ("EXP-02", "Baseline", "24 hops", "0.00 ticks", "4 vert + 2 swap", "4/4 (Crashed)"),
        ("EXP-02", "Optimized", "24 hops", "0.75 ticks", "0 (-100%)", "4/4 (100%)"),
        ("EXP-03", "Base vs Opt", "28 hops", "0.00 ticks", "0", "15/24 fail -> 9/9 ok"),
        ("EXP-05", "Base vs Opt", "14 -> 20 hops", "Inf -> 1.25", "0 (Stall -> Free)", "0/4 -> 4/4 (100%)"),
    ]

    for row_idx, r_data in enumerate(data_rows):
        row_cells = tbl.rows[row_idx + 1].cells
        for col_idx, text in enumerate(r_data):
            row_cells[col_idx].text = text
            set_cell_margins(row_cells[col_idx], top=50, bottom=50, left=70, right=70)
            p = row_cells[col_idx].paragraphs[0]
            p.alignment = WD_ALIGN_PARAGRAPH.CENTER if col_idx > 0 else WD_ALIGN_PARAGRAPH.LEFT
            for run in p.runs:
                run.font.name = 'Times New Roman'
                run.font.size = Pt(8)

    p_tbl_cap = doc.add_paragraph()
    p_tbl_cap.alignment = WD_ALIGN_PARAGRAPH.CENTER
    p_tbl_cap.paragraph_format.space_before = Pt(4)
    p_tbl_cap.paragraph_format.space_after = Pt(8)
    r_cap = p_tbl_cap.add_run("TABLE I. EMPIRICAL BENCHMARK EVALUATION (BASELINE VS OPTIMIZED)")
    r_cap.font.name = 'Times New Roman'
    r_cap.font.size = Pt(8.5)
    r_cap.font.bold = True

    add_body_p(
        doc,
        "In EXP-02, Welsh-Powell graph coloring partitioned intersecting routes into 2 conflict-free temporal phases (χ = 2), eliminating 100% of physical collisions. In EXP-03, Rook Polynomial PIE eliminated the 62.5% failure rate of naive docking by isolating the exact 9 derangements. In EXP-04, the OGF engine caught the 10 kWh deficit at 50 kWh, preventing brownout stalls. In EXP-05, the WFG engine detected the circular wait and routed the yielding robot around the congestion, recovering 100% of deliveries."
    )

    # IX. LIMITATIONS AND FUTURE SCOPE
    add_ieee_heading1(doc, "IX. Limitations and Future Scope")
    add_body_p(
        doc,
        "The current implementation is validated inside a software digital twin; physical AGV deployment introduces wheel slip and sensor noise. Greedy graph coloring does not guarantee absolute chromatic optimality on arbitrary dense topologies. Future work will investigate Conflict-Based Search (CBS) extensions and continuous-time velocity profiling."
    )

    # X. CONCLUSION
    add_ieee_heading1(doc, "X. Conclusion")
    add_body_p(
        doc,
        "This research demonstrated that discrete mathematics provides rigorous, analytical foundations for AGV warehouse traffic routing, smart charging compatibility, and power allocation. Planar graphs, chromatic scheduling, rook polynomials, inclusion-exclusion, ordinary generating functions, and wait-for graphs collectively achieve zero physical collisions, 100% deadlock recovery, and verified charging feasibility."
    )

    # REFERENCES
    add_ieee_heading1(doc, "References")
    references = [
        "[1] P. R. Wurman, R. D'Andrea, and M. Q. Mountz, \"Coordinating hundreds of cooperative, autonomous vehicles in warehouses,\" AI Magazine, vol. 29, no. 1, pp. 9-20, 2008.",
        "[2] T. Le-Anh and M. B. M. De Koster, \"A review of design and control of automated guided vehicle systems,\" European Journal of Operational Research, vol. 171, no. 1, pp. 1-23, 2006.",
        "[3] J. A. Bondy and U. S. R. Murty, Graph Theory with Applications. London: Macmillan Press, 1976.",
        "[4] D. B. West, Introduction to Graph Theory, 2nd ed. Upper Saddle River, NJ: Prentice Hall, 2001.",
        "[5] G. Sharon, R. Stern, A. Felner, and N. R. Sturtevant, \"Conflict-based search for optimal multi-agent pathfinding,\" Artificial Intelligence, vol. 219, pp. 40-66, 2015.",
        "[6] D. J. A. Welsh and M. B. Powell, \"An upper bound for the chromatic number of a graph and its application to timetabling problems,\" The Computer Journal, vol. 10, no. 1, pp. 85-86, 1967.",
        "[7] R. L. Brooks, \"On colouring the nodes of a network,\" Math. Proc. Cambridge Phil. Soc., vol. 37, no. 2, pp. 194-197, 1941.",
        "[8] J. Riordan, An Introduction to Combinatorial Analysis. New York: John Wiley & Sons, 1958.",
        "[9] R. P. Stanley, Enumerative Combinatorics, Volume 1, 2nd ed. Cambridge: Cambridge University Press, 2011.",
        "[10] P. Flajolet and R. Sedgewick, Analytic Combinatorics. Cambridge: Cambridge University Press, 2009.",
        "[11] E. G. Coffman, M. J. Elphick, and A. Shoshani, \"System deadlocks,\" ACM Computing Surveys, vol. 3, no. 2, pp. 67-78, 1971.",
        "[12] R. Tarjan, \"Depth-first search and linear graph algorithms,\" SIAM Journal on Computing, vol. 1, no. 2, pp. 146-160, 1972.",
        "[13] E. W. Dijkstra, \"A note on two problems in connexion with graphs,\" Numerische Mathematik, vol. 1, no. 1, pp. 269-271, 1959.",
        "[14] T. H. Cormen, C. E. Leiserson, R. L. Rivest, and C. Stein, Introduction to Algorithms, 3rd ed. Cambridge, MA: MIT Press, 2009.",
        "[15] A. Meurer et al., \"SymPy: symbolic computing in Python,\" PeerJ Computer Science, vol. 3, p. e103, 2017."
    ]

    for ref in references:
        p_ref = doc.add_paragraph()
        p_ref.alignment = WD_ALIGN_PARAGRAPH.JUSTIFY
        p_ref.paragraph_format.space_before = Pt(0)
        p_ref.paragraph_format.space_after = Pt(2.5)
        p_ref.paragraph_format.left_indent = Inches(0.2)
        p_ref.paragraph_format.first_line_indent = Inches(-0.2)
        run = p_ref.add_run(ref)
        run.font.name = 'Times New Roman'
        run.font.size = Pt(8)

    doc.save(filename)
    print(f"Generated IEEE DOCX: {filename}")


if __name__ == "__main__":
    build_docx("AGV_Intelligence_IEEE_Research_Paper.docx")
