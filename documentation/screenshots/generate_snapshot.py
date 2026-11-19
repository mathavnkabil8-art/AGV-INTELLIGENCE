"""Generates an SVG visual snapshot of the 8x8 digital twin."""
from backend.simulation.engine import SimulationEngine

engine = SimulationEngine()
wh = engine.warehouse
robots = engine.robots

cell_size = 56
padding = 32
width = wh.width * cell_size + padding * 2
height = wh.height * cell_size + padding * 2

svg = [f'<svg xmlns="http://www.w3.org/2000/svg" width="{width}" height="{height}" style="background:#070B14; font-family:monospace;">']
svg.append(f'<text x="{width//2}" y="22" fill="#38BDF8" font-size="13" font-weight="bold" text-anchor="middle">AGV INTELLIGENCE: 8x8 WAREHOUSE DIGITAL TWIN</text>')

chargers = set(wh.charging_stations)
storages = set(wh.storage_zones)
obstacles = set(wh.obstacles)

for y in range(wh.height):
    for x in range(wh.width):
        cx = padding + x * cell_size
        cy = padding + y * cell_size
        fill = '#0F172A'
        stroke = '#1E293B'
        label = ''

        if (x, y) in obstacles:
            fill = '#1E293B'
            stroke = '#475569'
            label = 'RACK'
        elif (x, y) in chargers:
            fill = '#78350F'
            stroke = '#D97706'
            label = 'PAD'
        elif (x, y) in storages:
            fill = '#064E3B'
            stroke = '#059669'
            label = 'BAY'

        svg.append(f'<rect x="{cx}" y="{cy}" width="{cell_size-3}" height="{cell_size-3}" rx="6" fill="{fill}" stroke="{stroke}" stroke-width="1.5"/>')
        svg.append(f'<text x="{cx+4}" y="{cy+11}" fill="#475569" font-size="8">{x},{y}</text>')
        if label:
            svg.append(f'<text x="{cx+cell_size//2}" y="{cy+cell_size//2+4}" fill="#E2E8F0" font-size="8" font-weight="bold" text-anchor="middle">{label}</text>')

# Draw planned BFS routes
for r in robots.values():
    if r.route and len(r.route) > 1:
        points = ' '.join([f'{padding + px * cell_size + cell_size//2},{padding + py * cell_size + cell_size//2}' for px, py in r.route])
        svg.append(f'<polyline points="{points}" fill="none" stroke="{r.color}" stroke-width="2" stroke-dasharray="4,3" opacity="0.5"/>')

# Draw robots with distinct visual identities
for r in robots.values():
    rx = padding + r.position[0] * cell_size + cell_size // 2
    ry = padding + r.position[1] * cell_size + cell_size // 2
    svg.append(f'<rect x="{rx-15}" y="{ry-15}" width="30" height="30" rx="8" fill="#0B1120" stroke="{r.color}" stroke-width="2.5"/>')
    svg.append(f'<circle cx="{rx}" cy="{ry}" r="6" fill="{r.color}"/>')
    svg.append(f'<text x="{rx}" y="{ry-19}" fill="#FFFFFF" font-size="9" font-weight="bold" text-anchor="middle">{r.id}</text>')

svg.append('</svg>')

with open('documentation/screenshots/warehouse_digital_twin_8x8.svg', 'w') as f:
    f.write('\n'.join(svg))

print('Successfully generated documentation/screenshots/warehouse_digital_twin_8x8.svg')
