const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell,
  ImageRun, HeadingLevel, AlignmentType, BorderStyle, WidthType,
  ShadingType, LevelFormat, PageNumber, PageBreak, Header, Footer,
  TabStopType, TabStopPosition
} = require('docx');
const fs = require('fs');
const path = require('path');

// ── helpers ──────────────────────────────────────────────────────────────────
const border = { style: BorderStyle.SINGLE, size: 1, color: "AAAAAA" };
const borders = { top: border, bottom: border, left: border, right: border };
const noBorder = { style: BorderStyle.NONE, size: 0, color: "FFFFFF" };
const noBorders = { top: noBorder, bottom: noBorder, left: noBorder, right: noBorder };

function h1(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    children: [new TextRun({ text, font: "Arial", size: 32, bold: true, color: "1F3864" })],
    spacing: { before: 320, after: 160 },
    border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "1F3864", space: 4 } }
  });
}
function h2(text) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_2,
    children: [new TextRun({ text, font: "Arial", size: 26, bold: true, color: "2E4057" })],
    spacing: { before: 240, after: 120 }
  });
}
function para(text, opts = {}) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 22, ...opts })],
    spacing: { before: 60, after: 100 },
    alignment: opts.alignment || AlignmentType.JUSTIFIED
  });
}
function bullet(text) {
  return new Paragraph({
    numbering: { reference: "bullets", level: 0 },
    children: [new TextRun({ text, font: "Arial", size: 22 })],
    spacing: { before: 40, after: 40 }
  });
}
function codeBlock(lines) {
  return lines.map(line =>
    new Paragraph({
      children: [new TextRun({ text: line, font: "Courier New", size: 18, color: "1A1A2E" })],
      spacing: { before: 0, after: 0 },
      shading: { fill: "F0F0F0", type: ShadingType.CLEAR },
      indent: { left: 360 }
    })
  );
}
function blankLine() {
  return new Paragraph({ children: [new TextRun("")], spacing: { before: 0, after: 80 } });
}
function imgPara(imgRun) {
  return new Paragraph({
    children: [imgRun],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 }
  });
}
function caption(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: "Arial", size: 18, italics: true, color: "555555" })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 200 }
  });
}

// ── load images ──────────────────────────────────────────────────────────────
function loadImg(name) {
  return fs.readFileSync(path.join('output_figures', name));
}
const fig1 = loadImg('fig1_main_comparison.png');
const fig2 = loadImg('fig2_vector_field.png');
const fig3 = loadImg('fig3_magnitude_direction.png');
const fig4 = loadImg('fig4_threshold_analysis.png');

// ── info table helper ─────────────────────────────────────────────────────────
function infoTable(rows) {
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [3000, 6360],
    rows: rows.map(([k, v]) => new TableRow({
      children: [
        new TableCell({
          borders, width: { size: 3000, type: WidthType.DXA },
          shading: { fill: "D9E1F2", type: ShadingType.CLEAR },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: k, font: "Arial", size: 21, bold: true })] })]
        }),
        new TableCell({
          borders, width: { size: 6360, type: WidthType.DXA },
          margins: { top: 80, bottom: 80, left: 120, right: 120 },
          children: [new Paragraph({ children: [new TextRun({ text: v, font: "Arial", size: 21 })] })]
        })
      ]
    }))
  });
}

// ── results table ─────────────────────────────────────────────────────────────
function resultsTable() {
  const headerRow = new TableRow({
    children: ["Metric", "Value", "Description"].map((h, i) =>
      new TableCell({
        borders,
        width: { size: [2500, 2000, 4860][i], type: WidthType.DXA },
        shading: { fill: "1F3864", type: ShadingType.CLEAR },
        margins: { top: 80, bottom: 80, left: 120, right: 120 },
        children: [new Paragraph({ children: [new TextRun({ text: h, font: "Arial", size: 21, bold: true, color: "FFFFFF" })] })]
      })
    )
  });
  const data = [
    ["Image Size",        "256 × 256 pixels",  "Synthetic test image dimensions"],
    ["Max Gradient Mag",  "1139.48",            "Highest intensity change detected"],
    ["Mean Gradient Mag", "47.90",              "Average gradient across image"],
    ["Strong Edges (>80)","2,717 pixels",       "Clearly defined edges"],
    ["Weak Edges (30–80)","15,648 pixels",      "Potential/transitional edges"],
    ["Direction Range",   "-π to +π radians",  "Full angular range captured"],
  ];
  const dataRows = data.map(([m, v, d]) => new TableRow({
    children: [m, v, d].map((txt, i) => new TableCell({
      borders,
      width: { size: [2500, 2000, 4860][i], type: WidthType.DXA },
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [new Paragraph({ children: [new TextRun({ text: txt, font: "Arial", size: 20 })] })]
    }))
  }));
  return new Table({
    width: { size: 9360, type: WidthType.DXA },
    columnWidths: [2500, 2000, 4860],
    rows: [headerRow, ...dataRows]
  });
}

// ── document ─────────────────────────────────────────────────────────────────
const doc = new Document({
  numbering: {
    config: [{
      reference: "bullets",
      levels: [{ level: 0, format: LevelFormat.BULLET, text: "\u2022", alignment: AlignmentType.LEFT,
        style: { paragraph: { indent: { left: 720, hanging: 360 } } } }]
    }]
  },
  styles: {
    default: { document: { run: { font: "Arial", size: 22 } } }
  },
  sections: [{
    properties: {
      page: {
        size: { width: 12240, height: 15840 },
        margin: { top: 1440, right: 1260, bottom: 1440, left: 1260 }
      }
    },
    headers: {
      default: new Header({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "4th Semester – Vector Calculus Project  |  Topic 4: Image Edge Detection", font: "Arial", size: 18, color: "666666" })
          ],
          border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: "1F3864", space: 4 } }
        })]
      })
    },
    footers: {
      default: new Footer({
        children: [new Paragraph({
          children: [
            new TextRun({ text: "Page ", font: "Arial", size: 18, color: "666666" }),
            new TextRun({ children: [PageNumber.CURRENT], font: "Arial", size: 18, color: "666666" }),
            new TextRun({ text: "  |  Image Edge Detection using Gradient  |  Vector Calculus Practical", font: "Arial", size: 18, color: "666666" })
          ],
          alignment: AlignmentType.CENTER,
          border: { top: { style: BorderStyle.SINGLE, size: 4, color: "1F3864", space: 4 } }
        })]
      })
    },
    children: [

      // ── TITLE PAGE ────────────────────────────────────────────────────────
      new Paragraph({
        children: [new TextRun({ text: "4th Semester – Vector Calculus Project", font: "Arial", size: 24, color: "555555" })],
        alignment: AlignmentType.CENTER, spacing: { before: 480, after: 80 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Topic 4:", font: "Arial", size: 44, bold: true, color: "1F3864" })],
        alignment: AlignmentType.CENTER, spacing: { before: 240, after: 80 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "Image Edge Detection", font: "Arial", size: 52, bold: true, color: "1F3864" })],
        alignment: AlignmentType.CENTER, spacing: { before: 0, after: 80 }
      }),
      new Paragraph({
        children: [new TextRun({ text: "using Gradient (Vector Calculus)", font: "Arial", size: 36, bold: false, color: "2E4057" })],
        alignment: AlignmentType.CENTER, spacing: { before: 0, after: 480 }
      }),
      new Paragraph({
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: "1F3864", space: 1 } },
        children: [new TextRun("")], spacing: { before: 0, after: 400 }
      }),
      blankLine(),
      infoTable([
        ["Subject",      "Vector Calculus (4th Semester)"],
        ["Topic",        "Image Edge Detection using Gradient"],
        ["Language",     "Python (NumPy, SciPy, Matplotlib)"],
        ["Key Concepts", "Gradient, Partial Derivatives, Vector Fields, Magnitude, Direction"],
        ["Operators",    "Sobel Operator, Prewitt Operator"],
      ]),
      blankLine(),

      new Paragraph({
        children: [new TextRun({ children: [new PageBreak()] })],
      }),

      // ── 1. PROBLEM STATEMENT ──────────────────────────────────────────────
      h1("1.  Problem Statement"),
      para("Edge detection is one of the most fundamental operations in image processing and computer vision. An edge in an image corresponds to a sharp change in pixel intensity — which, mathematically, is the region where the gradient of the image function is large."),
      blankLine(),
      para("The goal of this project is to implement image edge detection using vector calculus — specifically by computing the gradient of a 2D image function I(x, y). We demonstrate:"),
      bullet("How partial derivatives ∂I/∂x and ∂I/∂y represent intensity changes in horizontal and vertical directions."),
      bullet("How the gradient vector ∇I = (∂I/∂x) î + (∂I/∂y) ĵ points in the direction of maximum intensity change."),
      bullet("How the gradient magnitude |∇I| identifies edge locations, and the direction θ = arctan(Gy/Gx) gives edge orientation."),
      bullet("Comparison of Sobel and Prewitt operators as practical discrete approximations of the gradient."),
      blankLine(),

      // ── 2. MATHEMATICAL MODEL ─────────────────────────────────────────────
      h1("2.  Mathematical Model"),
      h2("2.1  Image as a Scalar Field"),
      para("An image is treated as a discrete 2D scalar field:"),
      para("    I : ℝ² → ℝ   where   I = I(x, y)   and   I(x, y) ∈ [0, 255]", { bold: false, color: "1A1A2E", font: "Courier New", size: 20 }),
      para("Each pixel at position (x, y) holds an intensity value. Brighter pixels have higher values; darker pixels have lower values."),
      blankLine(),
      h2("2.2  Gradient of the Image (Vector Field)"),
      para("The gradient of the scalar field I(x, y) is a vector field defined as:"),
      para("    ∇I = (∂I/∂x) î  +  (∂I/∂y) ĵ", { bold: true, color: "1F3864", font: "Courier New", size: 22 }),
      para("where:"),
      bullet("∂I/∂x  is the partial derivative with respect to x  → detects vertical edges"),
      bullet("∂I/∂y  is the partial derivative with respect to y  → detects horizontal edges"),
      bullet("î, ĵ  are the unit vectors in the x and y directions"),
      blankLine(),
      h2("2.3  Edge Magnitude and Direction"),
      para("The magnitude of the gradient gives the edge strength at each pixel:"),
      para("    |∇I| = √( (∂I/∂x)² + (∂I/∂y)² )", { bold: true, color: "1F3864", font: "Courier New", size: 22 }),
      para("The direction of the gradient (perpendicular to the edge) is:"),
      para("    θ = arctan( (∂I/∂y) / (∂I/∂x) )", { bold: true, color: "1F3864", font: "Courier New", size: 22 }),
      blankLine(),
      h2("2.4  Sobel Operator (Discrete Gradient Approximation)"),
      para("In a discrete image, derivatives are approximated by convolution with Sobel kernels:"),
      para("    Kx = [[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]]   (x-gradient)", { font: "Courier New", size: 19 }),
      para("    Ky = [[-1,-2,-1], [ 0, 0, 0], [ 1, 2, 1]]   (y-gradient)", { font: "Courier New", size: 19 }),
      para("    Gx = I * Kx   (convolution)"),
      para("    Gy = I * Ky   (convolution)"),
      para("    |∇I| = √(Gx² + Gy²)"),
      blankLine(),

      // ── 3. ALGORITHM ──────────────────────────────────────────────────────
      h1("3.  Algorithm"),
      bullet("Step 1: Generate / load a grayscale image I(x, y)"),
      bullet("Step 2: Define Sobel kernels Kx and Ky"),
      bullet("Step 3: Convolve the image with Kx to get Gx = ∂I/∂x"),
      bullet("Step 4: Convolve the image with Ky to get Gy = ∂I/∂y"),
      bullet("Step 5: Compute gradient magnitude |∇I| = √(Gx² + Gy²)"),
      bullet("Step 6: Compute gradient direction θ = arctan(Gy / Gx)"),
      bullet("Step 7: Apply double threshold to classify strong and weak edges"),
      bullet("Step 8: Visualise — edge map, vector field, magnitude heatmap, direction map"),
      blankLine(),

      // ── 4. CODE IMPLEMENTATION ────────────────────────────────────────────
      h1("4.  Code Implementation"),
      h2("4.1  Dependencies"),
      ...codeBlock([
        "import numpy as np",
        "import matplotlib.pyplot as plt",
        "from scipy.ndimage import convolve",
        "from PIL import Image",
      ]),
      blankLine(),
      h2("4.2  Sobel Gradient Function"),
      ...codeBlock([
        "def sobel_gradients(img):",
        "    Kx = np.array([[-1, 0, 1], [-2, 0, 2], [-1, 0, 1]], dtype=np.float64)",
        "    Ky = np.array([[-1,-2,-1], [ 0, 0, 0], [ 1, 2, 1]], dtype=np.float64)",
        "    Gx = convolve(img, Kx)          # ∂I/∂x",
        "    Gy = convolve(img, Ky)          # ∂I/∂y",
        "    magnitude = np.sqrt(Gx**2 + Gy**2)   # |∇I|",
        "    direction = np.arctan2(Gy, Gx)        # θ",
        "    return Gx, Gy, magnitude, direction",
      ]),
      blankLine(),
      h2("4.3  Double Threshold Edge Classification"),
      ...codeBlock([
        "def apply_threshold(magnitude, low=30, high=80):",
        "    strong = magnitude >= high",
        "    weak   = (magnitude >= low) & (magnitude < high)",
        "    result = np.zeros_like(magnitude)",
        "    result[strong] = 255    # definite edges",
        "    result[weak]   = 128    # candidate edges",
        "    return result",
      ]),
      blankLine(),

      new Paragraph({ children: [new TextRun({ children: [new PageBreak()] })] }),

      // ── 5. VISUALISATIONS ─────────────────────────────────────────────────
      h1("5.  Graphs and Visualisations"),
      h2("5.1  Main Comparison: Original → Gradients → Edges"),
      imgPara(new ImageRun({ data: fig1, transformation: { width: 620, height: 372 }, type: "png" })),
      caption("Figure 1: (top-left) Original Image, (top-middle) Gx = ∂I/∂x, (top-right) Gy = ∂I/∂y, (bottom-left) Edge Magnitude |∇I|, (bottom-middle) Thresholded Edges, (bottom-right) Prewitt Operator"),
      blankLine(),
      h2("5.2  Gradient Vector Field  ∇I = (∂I/∂x) î + (∂I/∂y) ĵ"),
      imgPara(new ImageRun({ data: fig2, transformation: { width: 560, height: 258 }, type: "png" })),
      caption("Figure 2: The red arrows show the gradient vectors at sampled points. Each arrow points in the direction of maximum intensity change, visually confirming edge locations."),
      blankLine(),
      h2("5.3  Magnitude Heatmap & Edge Direction Map"),
      imgPara(new ImageRun({ data: fig3, transformation: { width: 560, height: 258 }, type: "png" })),
      caption("Figure 3: (left) Jet heatmap of gradient magnitude — brighter colours = stronger edges. (right) HSV colormap of gradient direction θ — different hues indicate edge orientations."),
      blankLine(),
      h2("5.4  Threshold Sensitivity Analysis"),
      imgPara(new ImageRun({ data: fig4, transformation: { width: 480, height: 267 }, type: "png" })),
      caption("Figure 4: Edge pixel count vs. threshold value. The red dashed line marks the chosen threshold (80). Lower thresholds include more noise; higher thresholds miss weaker edges."),
      blankLine(),

      new Paragraph({ children: [new TextRun({ children: [new PageBreak()] })] }),

      // ── 6. TESTING & RESULTS ──────────────────────────────────────────────
      h1("6.  Testing and Results Analysis"),
      para("The algorithm was applied to a 256×256 synthetic image containing a rectangle, a circle, and a diagonal line — all clearly identifiable geometric shapes."),
      blankLine(),
      resultsTable(),
      blankLine(),
      h2("6.1  Observations"),
      bullet("The Sobel operator successfully detected all geometric boundaries in the image."),
      bullet("The gradient magnitude heatmap (Figure 3) clearly highlights edges with high intensity values."),
      bullet("The vector field (Figure 2) shows that gradient arrows point perpendicular to edge contours — consistent with the mathematical property that ∇I is perpendicular to level curves."),
      bullet("The direction map (Figure 3 right) shows distinct colours for horizontal, vertical, and diagonal edges, confirming directional accuracy."),
      bullet("Threshold analysis (Figure 4) shows that a threshold of 80 provides a good balance between edge completeness and noise suppression."),
      bullet("The Prewitt operator produces similar results to Sobel but with slightly less noise suppression due to its simpler kernel weights."),
      blankLine(),

      // ── 7. VECTOR CALCULUS CONCEPTS ───────────────────────────────────────
      h1("7.  How Vector Calculus Concepts Were Applied"),
      new Table({
        width: { size: 9360, type: WidthType.DXA },
        columnWidths: [2800, 6560],
        rows: [
          ["Concept", "Application in this Project"],
          ["Scalar Field", "Image I(x, y) modelled as a 2D scalar field mapping pixel coords to intensity"],
          ["Gradient ∇f", "∇I computed at every pixel — direction of maximum intensity change = edge direction"],
          ["Partial Derivatives", "∂I/∂x and ∂I/∂y computed via Sobel convolution — detect V and H edges respectively"],
          ["Vector Field", "∇I = (Gx)î + (Gy)ĵ forms a 2D vector field visualised as quiver plot"],
          ["Magnitude |∇f|", "|∇I| = √(Gx²+Gy²) gives edge strength — high magnitude = definite edge"],
          ["Direction θ", "θ = arctan(Gy/Gx) gives the edge orientation angle at each pixel"],
        ].map(([a, b], i) => new TableRow({
          children: [a, b].map((txt, j) => new TableCell({
            borders,
            width: { size: [2800, 6560][j], type: WidthType.DXA },
            shading: { fill: i === 0 ? "1F3864" : (i % 2 === 0 ? "EEF2FF" : "FFFFFF"), type: ShadingType.CLEAR },
            margins: { top: 80, bottom: 80, left: 120, right: 120 },
            children: [new Paragraph({ children: [new TextRun({ text: txt, font: "Arial", size: i === 0 ? 21 : 20, bold: i === 0, color: i === 0 ? "FFFFFF" : "000000" })] })]
          }))
        }))
      }),
      blankLine(),

      // ── 8. CONCLUSION ─────────────────────────────────────────────────────
      h1("8.  Conclusion"),
      para("This project successfully demonstrated the application of vector calculus — specifically the concept of the gradient — to the real-world problem of image edge detection. By modelling an image as a 2D scalar field and computing its gradient vector field, we were able to precisely identify the location, strength, and orientation of edges."),
      blankLine(),
      para("The Sobel operator provides a practical discrete approximation to the continuous gradient, making it computationally efficient and widely used in computer vision systems. The double-threshold technique adds robustness by distinguishing strong definite edges from weaker candidate edges."),
      blankLine(),
      para("This approach forms the mathematical foundation for modern image processing pipelines, including the Canny edge detector, image segmentation, object recognition in AI systems, and feature extraction in convolutional neural networks (CNNs)."),
      blankLine(),
    ]
  }]
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync("vector_calculus_project_topic4.docx", buf);
  console.log("Report created: vector_calculus_project_topic4.docx");
});