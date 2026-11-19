# AGV Intelligence – IEEE Conference Research Paper Source Package

**Paper Title:** Mathematical Modelling and Optimization of Autonomous Guided Vehicle Traffic Routing and Smart Charging in Automated Warehouses Using Discrete Mathematics  
**Authors:** Author 1, Author 2, Author 3, Author 4  
**Affiliation:** Department of Artificial Intelligence and Data Engineering, Jain University, Bengaluru, Karnataka, India  
**Format:** IEEE Two-Column Conference Format (US Letter)  

---

## 1. Package Contents

```text
paper/
├── main.tex                    # Complete IEEE conference LaTeX source code
├── references.bib              # Authentic BibTeX references
├── README.md                   # Compilation and Overleaf instructions
├── figures/                    # 10 High-resolution IEEE figures (SVG/Vector)
│   ├── integrated_optimization_controller.svg   (Fig. 1. Overall System Architecture)
│   ├── grid_graph_module3.svg                  (Fig. 2. Warehouse Grid Graph)
│   ├── conflict_graph_module3.svg              (Fig. 3. AGV Route Conflict Graph)
│   ├── graph_coloring_scheduling.svg           (Fig. 4. Graph Coloring & Scheduling)
│   ├── charging_compatibility_matrix.svg       (Fig. 5. Compatibility Matrix)
│   ├── rook_polynomial_derivation.svg          (Fig. 6. Rook Polynomial Calculation)
│   ├── generating_functions_derivation.svg     (Fig. 7. Generating Functions Distribution)
│   ├── warehouse_digital_twin_8x8.svg          (Fig. 8. Integrated Warehouse Twin)
│   ├── deadlock_detection_wfg.svg              (Fig. 9. Deadlock Detection & Recovery)
│   └── experiments_analytics_dashboard.svg     (Fig. 10. Performance Comparison)
└── tables/                     # Empirical benchmark data tables
```

---

## 2. Compilation Instructions

### Option A: Compile Locally via pdflatex / latexmk
Run the following standard commands in your terminal:
```bash
pdflatex main
bibtex main
pdflatex main
pdflatex main
```
Or with `latexmk`:
```bash
latexmk -pdf main.tex
```

### Option B: Compile on Overleaf
1. Log in to [Overleaf](https://www.overleaf.com/).
2. Click **New Project** $\to$ **Upload Project**.
3. Select `AGV_Intelligence_IEEE_Source.zip`.
4. Overleaf will automatically detect `main.tex` and compile the IEEE PDF with two-column formatting.

---

## 3. Microsoft Word (.docx) Version
An editable, two-column IEEE formatted Word document is also provided in the repository root:
- [`AGV_Intelligence_IEEE_Research_Paper.docx`](file:///e:/semester%203/discrete%20mathematics%20and%20graph%20theory/AGV-INTELLIGENCE/AGV_Intelligence_IEEE_Research_Paper.docx)
