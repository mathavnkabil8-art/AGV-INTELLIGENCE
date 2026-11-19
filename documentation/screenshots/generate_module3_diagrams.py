"""
Script to generate visual SVG diagrams for Module 3:
1. Warehouse Grid Graph G = (V, E)
2. Conflict Graph G_c = (V_c, E_c) with Graph Coloring & Scheduling Phases
"""
import math
from backend.algorithms.graph_routing import WarehouseGridGraph, ConflictGraphEngine
from backend.simulation.warehouse import WarehouseState

def generate_grid_graph_svg(filepath: str):
    warehouse = WarehouseState()
    grid_graph = WarehouseGridGraph(warehouse.width, warehouse.height, warehouse.obstacles)
    path_bfs = grid_graph.find_shortest_path_bfs((0, 0), (7, 7))
    meta = grid_graph.get_graph_metadata()
    
    cell_size = 60
    padding = 60
    width = warehouse.width * cell_size + 2 * padding + 220
    height = warehouse.height * cell_size + 2 * padding + 80
    
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" style="background:#0b0f19; font-family:system-ui, -apple-system, sans-serif;">',
        '<defs>',
        '  <linearGradient id="edgeGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
        '    <stop offset="0%" stop-color="#3b82f6" stop-opacity="0.4"/>',
        '    <stop offset="100%" stop-color="#06b6d4" stop-opacity="0.4"/>',
        '  </linearGradient>',
        '  <linearGradient id="pathGrad" x1="0%" y1="0%" x2="100%" y2="100%">',
        '    <stop offset="0%" stop-color="#10b981"/>',
        '    <stop offset="100%" stop-color="#06b6d4"/>',
        '  </linearGradient>',
        '</defs>',
        f'<text x="{padding}" y="36" fill="#f8fafc" font-size="20" font-weight="700">Warehouse Grid Graph G = (V, E)</text>',
        f'<text x="{padding}" y="56" fill="#94a3b8" font-size="12">8x8 Undirected 4-Connected Grid | |V|={meta["num_vertices"]}, |E|={meta["num_edges"]}, Connected={meta["is_connected"]}</text>'
    ]
    
    # Draw edges
    edges = grid_graph.graph.edges()
    for u, v in edges:
        x1 = padding + u[0] * cell_size + cell_size // 2
        y1 = padding + 40 + u[1] * cell_size + cell_size // 2
        x2 = padding + v[0] * cell_size + cell_size // 2
        y2 = padding + 40 + v[1] * cell_size + cell_size // 2
        svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="url(#edgeGrad)" stroke-width="2"/>')
        
    # Draw BFS path highlight
    path_edges = list(zip(path_bfs[:-1], path_bfs[1:]))
    for u, v in path_edges:
        x1 = padding + u[0] * cell_size + cell_size // 2
        y1 = padding + 40 + u[1] * cell_size + cell_size // 2
        x2 = padding + v[0] * cell_size + cell_size // 2
        y2 = padding + 40 + v[1] * cell_size + cell_size // 2
        svg.append(f'<line x1="{x1}" y1="{y1}" x2="{x2}" y2="{y2}" stroke="url(#pathGrad)" stroke-width="5" stroke-linecap="round"/>')
        
    # Draw vertices
    for y in range(warehouse.height):
        for x in range(warehouse.width):
            cx = padding + x * cell_size + cell_size // 2
            cy = padding + 40 + y * cell_size + cell_size // 2
            coord = (x, y)
            is_obstacle = coord in warehouse.obstacles
            is_path = coord in path_bfs
            
            if is_obstacle:
                svg.append(f'<rect x="{cx-18}" y="{cy-18}" width="36" height="36" rx="6" fill="#ef4444" fill-opacity="0.25" stroke="#ef4444" stroke-width="1.5"/>')
                svg.append(f'<text x="{cx}" y="{cy+4}" fill="#ef4444" font-size="10" font-weight="700" text-anchor="middle">OBS</text>')
            elif is_path:
                svg.append(f'<circle cx="{cx}" cy="{cy}" r="14" fill="#064e3b" stroke="#10b981" stroke-width="2.5"/>')
                svg.append(f'<text x="{cx}" y="{cy+4}" fill="#a7f3d0" font-size="10" font-weight="700" text-anchor="middle">{x},{y}</text>')
            else:
                svg.append(f'<circle cx="{cx}" cy="{cy}" r="11" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>')
                svg.append(f'<text x="{cx}" y="{cy+3}" fill="#cbd5e1" font-size="8" text-anchor="middle">{x},{y}</text>')

    # Legend & Information Sidebar
    sidebar_x = padding + warehouse.width * cell_size + 30
    sidebar_y = padding + 40
    svg.extend([
        f'<rect x="{sidebar_x}" y="{sidebar_y}" width="200" height="420" rx="12" fill="#111827" stroke="#1f2937" stroke-width="1.5"/>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+30}" fill="#38bdf8" font-size="14" font-weight="700">GRAPH TOPOLOGY</text>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+60}" fill="#94a3b8" font-size="11">Total Nodes |V|: <tspan fill="#f8fafc" font-weight="600">{meta["num_vertices"]}</tspan></text>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+85}" fill="#94a3b8" font-size="11">Total Edges |E|: <tspan fill="#f8fafc" font-weight="600">{meta["num_edges"]}</tspan></text>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+110}" fill="#94a3b8" font-size="11">Obstacles Pruned: <tspan fill="#ef4444" font-weight="600">{len(warehouse.obstacles)}</tspan></text>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+135}" fill="#94a3b8" font-size="11">Average Degree: <tspan fill="#f8fafc" font-weight="600">{meta["average_degree"]:.2f}</tspan></text>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+160}" fill="#94a3b8" font-size="11">BFS Shortest Path: <tspan fill="#10b981" font-weight="600">{len(path_bfs)-1} hops</tspan></text>',
        f'<line x1="{sidebar_x+16}" y1="{sidebar_y+180}" x2="{sidebar_x+184}" y2="{sidebar_y+180}" stroke="#374151" stroke-width="1"/>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+205}" fill="#e2e8f0" font-size="12" font-weight="600">Legend:</text>',
        f'<circle cx="{sidebar_x+25}" cy="{sidebar_y+230}" r="8" fill="#1e293b" stroke="#475569" stroke-width="1.5"/>',
        f'<text x="{sidebar_x+42}" y="{sidebar_y+234}" fill="#94a3b8" font-size="11">Free Intersection</text>',
        f'<circle cx="{sidebar_x+25}" cy="{sidebar_y+260}" r="8" fill="#064e3b" stroke="#10b981" stroke-width="2"/>',
        f'<text x="{sidebar_x+42}" y="{sidebar_y+264}" fill="#a7f3d0" font-size="11">Shortest Path Vertex</text>',
        f'<rect x="{sidebar_x+17}" y="{sidebar_y+282}" width="16" height="16" rx="3" fill="#ef4444" fill-opacity="0.3" stroke="#ef4444"/>',
        f'<text x="{sidebar_x+42}" y="{sidebar_y+294}" fill="#fca5a5" font-size="11">Blocked (Obstacle)</text>',
        f'<line x1="{sidebar_x+17}" y1="{sidebar_y+320}" x2="{sidebar_x+33}" y2="{sidebar_y+320}" stroke="#06b6d4" stroke-width="3"/>',
        f'<text x="{sidebar_x+42}" y="{sidebar_y+324}" fill="#94a3b8" font-size="11">Valid Pathway (Edge)</text>',
        f'<rect x="{sidebar_x+14}" y="{sidebar_y+350}" width="172" height="50" rx="6" fill="#1e1b4b" stroke="#4338ca" stroke-width="1"/>',
        f'<text x="{sidebar_x+22}" y="{sidebar_y+370}" fill="#a5b4fc" font-size="10" font-weight="600">Discrete Math Principle:</text>',
        f'<text x="{sidebar_x+22}" y="{sidebar_y+386}" fill="#c7d2fe" font-size="9">G is 4-regular minus boundaries</text>',
        f'<text x="{sidebar_x+22}" y="{sidebar_y+397}" fill="#c7d2fe" font-size="9">&amp; obstacle vertex removals.</text>',
    ])

    svg.append('</svg>')
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated grid graph SVG: {filepath}")

def generate_conflict_graph_svg(filepath: str):
    # 6 test routes with interesting conflict structure
    routes = {
        "AGV-1": [(0, 0), (1, 0), (2, 0), (3, 0), (4, 0)],
        "AGV-2": [(0, 1), (1, 0), (2, 1), (3, 1), (4, 1)], # conflicts with AGV-1 at (1,0) at t=1
        "AGV-3": [(4, 0), (3, 0), (2, 0), (1, 0), (0, 0)], # head-on edge swap with AGV-1
        "AGV-4": [(7, 7), (7, 6), (7, 5), (7, 4)],
        "AGV-5": [(7, 4), (7, 5), (7, 6), (7, 7)], # head-on with AGV-4
        "AGV-6": [(0, 7), (1, 7), (2, 7), (3, 7)], # independent route
    }
    
    result = ConflictGraphEngine.compute_graph_coloring(routes, strategy="largest_first")
    
    width = 860
    height = 560
    cx = 320
    cy = 280
    radius = 170
    
    nodes = result["nodes"]
    edges = result["edges"]
    coloring = result["coloring"]
    
    # Calculate circle layout positions
    n = len(nodes)
    pos = {}
    for i, node_id in enumerate(nodes):
        angle = 2 * math.pi * i / n - math.pi / 2
        pos[node_id] = (cx + radius * math.cos(angle), cy + radius * math.sin(angle))
        
    color_map = {
        0: {"bg": "#0284c7", "border": "#38bdf8", "text": "#e0f2fe", "name": "Phase 1"},
        1: {"bg": "#7c3aed", "border": "#a855f7", "text": "#f3e8ff", "name": "Phase 2"},
        2: {"bg": "#d97706", "border": "#f59e0b", "text": "#fef3c7", "name": "Phase 3"},
        3: {"bg": "#059669", "border": "#10b981", "text": "#d1fae5", "name": "Phase 4"},
    }
    
    svg = [
        f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {width} {height}" width="{width}" height="{height}" style="background:#0b0f19; font-family:system-ui, -apple-system, sans-serif;">',
        '<defs>',
        '  <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">',
        '    <feGaussianBlur stdDeviation="3" result="blur" />',
        '    <feComposite in="SourceGraphic" in2="blur" operator="over" />',
        '  </filter>',
        '</defs>',
        '<text x="40" y="36" fill="#f8fafc" font-size="20" font-weight="700">Conflict Graph G_c = (V_c, E_c) &amp; Greedy Coloring</text>',
        f'<text x="40" y="56" fill="#94a3b8" font-size="12">Chromatic Upper Bound: \u03c7(G_c) \u2264 \u0394 + 1 = {result["brooks_upper_bound"]} | Colors Assigned = {result["num_colors_used"]} | Conflicts = {len(edges)}</text>'
    ]
    
    # Draw Conflict Edges
    for edge in edges:
        p1 = pos[edge["u"]]
        p2 = pos[edge["v"]]
        svg.append(f'<line x1="{p1[0]}" y1="{p1[1]}" x2="{p2[0]}" y2="{p2[1]}" stroke="#ef4444" stroke-width="2.5" opacity="0.85"/>')
        
    # Draw Nodes
    for step in result["coloring_steps"]:
        nid = step["vertex"]
        p = pos[nid]
        color_idx = coloring.get(nid, 0)
        c = color_map.get(color_idx, color_map[0])
        deg = step["degree"]
        
        svg.append(f'<circle cx="{p[0]}" cy="{p[1]}" r="30" fill="{c["bg"]}" stroke="{c["border"]}" stroke-width="3" filter="url(#glow)"/>')
        svg.append(f'<text x="{p[0]}" y="{p[1]-4}" fill="{c["text"]}" font-size="12" font-weight="700" text-anchor="middle">{nid}</text>')
        svg.append(f'<text x="{p[0]}" y="{p[1]+12}" fill="{c["text"]}" font-size="9" text-anchor="middle">{c["name"]} (deg {deg})</text>')
        
    # Sidebar
    sidebar_x = 590
    sidebar_y = 75
    svg.extend([
        f'<rect x="{sidebar_x}" y="{sidebar_y}" width="230" height="450" rx="12" fill="#111827" stroke="#1f2937" stroke-width="1.5"/>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+28}" fill="#38bdf8" font-size="14" font-weight="700">MATHEMATICAL AUDIT</text>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+55}" fill="#94a3b8" font-size="11">Coloring Strategy: <tspan fill="#38bdf8" font-weight="600">{result["strategy"].title()}</tspan></text>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+78}" fill="#94a3b8" font-size="11">Max Degree \u0394(G_c): <tspan fill="#f8fafc" font-weight="600">{result["max_degree_delta"]}</tspan></text>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+101}" fill="#94a3b8" font-size="11">Brooks\' Bound (\u0394+1): <tspan fill="#a855f7" font-weight="600">\u2264 {result["brooks_upper_bound"]}</tspan></text>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+124}" fill="#94a3b8" font-size="11">Colors Used k: <tspan fill="#10b981" font-weight="600">{result["num_colors_used"]}</tspan></text>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+147}" fill="#94a3b8" font-size="11">Interference Edges: <tspan fill="#ef4444" font-weight="600">{len(edges)}</tspan></text>',
        f'<line x1="{sidebar_x+16}" y1="{sidebar_y+165}" x2="{sidebar_x+214}" y2="{sidebar_y+165}" stroke="#374151" stroke-width="1"/>',
        f'<text x="{sidebar_x+16}" y="{sidebar_y+188}" fill="#e2e8f0" font-size="12" font-weight="600">Scheduling Phases:</text>',
    ])
    
    phase_y = sidebar_y + 210
    for phase_name, agents in result["scheduling_phases"].items():
        # extract index from 'Phase 0'
        p_idx = int(phase_name.split()[1]) if " " in phase_name else 0
        c = color_map.get(p_idx, color_map[0])
        agents_str = ", ".join(agents)
        svg.append(f'<rect x="{sidebar_x+16}" y="{phase_y-14}" width="12" height="12" rx="3" fill="{c["bg"]}" stroke="{c["border"]}"/>')
        svg.append(f'<text x="{sidebar_x+34}" y="{phase_y-4}" fill="{c["text"]}" font-size="10" font-weight="600">{c["name"]}: [{agents_str}]</text>')
        phase_y += 24
        
    svg.extend([
        f'<rect x="{sidebar_x+12}" y="{sidebar_y+310}" width="206" height="120" rx="8" fill="#1e1b4b" stroke="#4338ca" stroke-width="1"/>',
        f'<text x="{sidebar_x+20}" y="{sidebar_y+330}" fill="#a5b4fc" font-size="11" font-weight="700">Academic Disclaimer:</text>',
        f'<text x="{sidebar_x+20}" y="{sidebar_y+348}" fill="#c7d2fe" font-size="8.5">Graph coloring is a scheduling aid.</text>',
        f'<text x="{sidebar_x+20}" y="{sidebar_y+362}" fill="#c7d2fe" font-size="8.5">It does not automatically guarantee</text>',
        f'<text x="{sidebar_x+20}" y="{sidebar_y+376}" fill="#c7d2fe" font-size="8.5">deadlock freedom or collision-free</text>',
        f'<text x="{sidebar_x+20}" y="{sidebar_y+390}" fill="#c7d2fe" font-size="8.5">execution unless time &amp; resource</text>',
        f'<text x="{sidebar_x+20}" y="{sidebar_y+404}" fill="#c7d2fe" font-size="8.5">reservations are enforced.</text>',
    ])
    
    svg.append('</svg>')
    with open(filepath, "w", encoding="utf-8") as f:
        f.write("\n".join(svg))
    print(f"Generated conflict graph SVG: {filepath}")

if __name__ == "__main__":
    generate_grid_graph_svg("documentation/screenshots/grid_graph_module3.svg")
    generate_conflict_graph_svg("documentation/screenshots/conflict_graph_module3.svg")
