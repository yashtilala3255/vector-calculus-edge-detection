"""
Topic 4: Image Edge Detection using Gradient (Vector Calculus)
4th Semester Practical - Vector Calculus Project
"""

import numpy as np
import matplotlib.pyplot as plt
from scipy.ndimage import convolve
from PIL import Image
import os

# ─────────────────────────────────────────────
# 1.  CREATE A SYNTHETIC TEST IMAGE
# ─────────────────────────────────────────────
def create_test_image(size=256):
    """Generate a synthetic grayscale image with clear geometric shapes."""
    img = np.zeros((size, size), dtype=np.float64)

    # White rectangle
    img[60:120, 50:150] = 200

    # Circle
    cx, cy, r = 180, 180, 40
    Y, X = np.ogrid[:size, :size]
    mask = (X - cx)**2 + (Y - cy)**2 <= r**2
    img[mask] = 180

    # Diagonal line
    for i in range(size):
        j = int(i * 0.6)
        if j < size:
            img[i, j] = 255
            if j + 1 < size:
                img[i, j + 1] = 255

    # Add slight Gaussian noise to make it realistic
    rng = np.random.default_rng(42)
    img += rng.normal(0, 8, img.shape)
    img = np.clip(img, 0, 255)
    return img


# ─────────────────────────────────────────────
# 2.  GRADIENT-BASED EDGE DETECTION
# ─────────────────────────────────────────────

def sobel_gradients(img):
    """
    Compute image gradients using Sobel operators.

    Mathematical basis (Vector Calculus):
        ∇f = (∂f/∂x) î  +  (∂f/∂y) ĵ

    Sobel kernels approximate the partial derivatives:
        Gx ≈ ∂I/∂x,   Gy ≈ ∂I/∂y

    Edge magnitude : |∇I| = √(Gx² + Gy²)
    Edge direction : θ     = arctan(Gy / Gx)
    """
    # Sobel kernels
    Kx = np.array([[-1, 0, 1],
                   [-2, 0, 2],
                   [-1, 0, 1]], dtype=np.float64)

    Ky = np.array([[-1, -2, -1],
                   [ 0,  0,  0],
                   [ 1,  2,  1]], dtype=np.float64)

    Gx = convolve(img, Kx)
    Gy = convolve(img, Ky)

    magnitude  = np.sqrt(Gx**2 + Gy**2)
    direction  = np.arctan2(Gy, Gx)          # radians
    return Gx, Gy, magnitude, direction


def prewitt_gradients(img):
    """Prewitt operator – another discrete gradient approximation."""
    Kx = np.array([[-1, 0, 1],
                   [-1, 0, 1],
                   [-1, 0, 1]], dtype=np.float64)
    Ky = np.array([[-1, -1, -1],
                   [ 0,  0,  0],
                   [ 1,  1,  1]], dtype=np.float64)
    Gx = convolve(img, Kx)
    Gy = convolve(img, Ky)
    return np.sqrt(Gx**2 + Gy**2)


def apply_threshold(magnitude, low=30, high=80):
    """Simple double-threshold for edge classification."""
    strong = magnitude >= high
    weak   = (magnitude >= low) & (magnitude < high)
    result = np.zeros_like(magnitude)
    result[strong] = 255
    result[weak]   = 128
    return result


# ─────────────────────────────────────────────
# 3.  VECTOR FIELD VISUALISATION
# ─────────────────────────────────────────────

def plot_gradient_field(img, Gx, Gy, step=16):
    """Visualise the gradient vector field (∇I) as a quiver plot."""
    h, w = img.shape
    Y, X = np.mgrid[step//2:h:step, step//2:w:step]
    U = Gx[Y, X]
    V = Gy[Y, X]
    return X, Y, U, V


# ─────────────────────────────────────────────
# 4.  MAIN – RUN ALL STEPS AND SAVE FIGURES
# ─────────────────────────────────────────────

def main():
    os.makedirs("output_figures", exist_ok=True)

    # ---------- create / load image ----------
    img = create_test_image(256)

    # ---------- compute gradients ----------
    Gx, Gy, magnitude, direction = sobel_gradients(img)
    prewitt_mag = prewitt_gradients(img)
    edges_thresh = apply_threshold(magnitude)

    # Normalise for display
    mag_norm     = (magnitude  / magnitude.max()  * 255).astype(np.uint8)
    prew_norm    = (prewitt_mag / prewitt_mag.max() * 255).astype(np.uint8)
    Gx_disp      = np.abs(Gx); Gx_disp = (Gx_disp / Gx_disp.max() * 255).astype(np.uint8)
    Gy_disp      = np.abs(Gy); Gy_disp = (Gy_disp / Gy_disp.max() * 255).astype(np.uint8)

    X, Y, U, V  = plot_gradient_field(img, Gx, Gy)

    # ── Figure 1: Main comparison (6 panels) ──────────────────────────────
    fig1, axes = plt.subplots(2, 3, figsize=(15, 9))
    fig1.suptitle("Image Edge Detection using Gradient (Vector Calculus)",
                  fontsize=15, fontweight='bold', y=1.01)

    panels = [
        (img,          "Original Image",           "gray"),
        (Gx_disp,      "Gradient X  (∂I/∂x)",     "gray"),
        (Gy_disp,      "Gradient Y  (∂I/∂y)",     "gray"),
        (mag_norm,     "Edge Magnitude |∇I|",       "hot"),
        (edges_thresh, "Thresholded Edges",          "gray"),
        (prew_norm,    "Prewitt Operator",           "hot"),
    ]
    for ax, (data, title, cmap) in zip(axes.flat, panels):
        im = ax.imshow(data, cmap=cmap)
        ax.set_title(title, fontsize=11)
        ax.axis("off")
        fig1.colorbar(im, ax=ax, fraction=0.046, pad=0.04)

    plt.tight_layout()
    fig1.savefig("output_figures/fig1_main_comparison.png", dpi=150, bbox_inches='tight')
    plt.close(fig1)
    print("Saved: output_figures/fig1_main_comparison.png")

    # ── Figure 2: Gradient vector field ───────────────────────────────────
    fig2, axes2 = plt.subplots(1, 2, figsize=(13, 6))
    fig2.suptitle("Gradient Vector Field  ∇I = (∂I/∂x) î + (∂I/∂y) ĵ",
                  fontsize=13, fontweight='bold')

    axes2[0].imshow(img, cmap='gray')
    axes2[0].set_title("Original Image", fontsize=11)
    axes2[0].axis("off")

    axes2[1].imshow(img, cmap='gray', alpha=0.5)
    axes2[1].quiver(X, Y, U, V,
                    color='red', scale=3000, width=0.003,
                    headwidth=3, headlength=4, alpha=0.8)
    axes2[1].set_title("Gradient Vector Field (∇I)", fontsize=11)
    axes2[1].axis("off")

    plt.tight_layout()
    fig2.savefig("output_figures/fig2_vector_field.png", dpi=150, bbox_inches='tight')
    plt.close(fig2)
    print("Saved: output_figures/fig2_vector_field.png")

    # ── Figure 3: Gradient magnitude heatmap + direction ──────────────────
    fig3, axes3 = plt.subplots(1, 2, figsize=(13, 6))
    fig3.suptitle("Gradient Magnitude & Direction", fontsize=13, fontweight='bold')

    im3a = axes3[0].imshow(magnitude, cmap='jet')
    axes3[0].set_title("|∇I| = √(Gx² + Gy²)  — Magnitude Heatmap", fontsize=10)
    axes3[0].axis("off")
    fig3.colorbar(im3a, ax=axes3[0], fraction=0.046, pad=0.04)

    im3b = axes3[1].imshow(direction, cmap='hsv')
    axes3[1].set_title("θ = arctan(Gy/Gx)  — Edge Direction", fontsize=10)
    axes3[1].axis("off")
    fig3.colorbar(im3b, ax=axes3[1], fraction=0.046, pad=0.04, label='radians')

    plt.tight_layout()
    fig3.savefig("output_figures/fig3_magnitude_direction.png", dpi=150, bbox_inches='tight')
    plt.close(fig3)
    print("Saved: output_figures/fig3_magnitude_direction.png")

    # ── Figure 4: Error / sensitivity analysis ────────────────────────────
    thresholds = np.arange(10, 200, 5)
    edge_pixels = [np.sum(magnitude > t) for t in thresholds]

    fig4, ax4 = plt.subplots(figsize=(9, 5))
    ax4.plot(thresholds, edge_pixels, color='steelblue', linewidth=2.5, marker='o',
             markersize=4, label='Edge pixel count')
    ax4.axvline(x=80, color='red', linestyle='--', linewidth=1.5, label='Selected threshold = 80')
    ax4.set_xlabel("Threshold Value", fontsize=12)
    ax4.set_ylabel("Number of Edge Pixels", fontsize=12)
    ax4.set_title("Edge Pixel Count vs. Threshold  (Sensitivity Analysis)", fontsize=12)
    ax4.legend(fontsize=11)
    ax4.grid(True, alpha=0.35)
    plt.tight_layout()
    fig4.savefig("output_figures/fig4_threshold_analysis.png", dpi=150, bbox_inches='tight')
    plt.close(fig4)
    print("Saved: output_figures/fig4_threshold_analysis.png")

    # ── Print summary statistics ───────────────────────────────────────────
    print("\n========== Summary Statistics ==========")
    print(f"Image size          : {img.shape[0]} x {img.shape[1]} pixels")
    print(f"Max gradient mag    : {magnitude.max():.2f}")
    print(f"Mean gradient mag   : {magnitude.mean():.2f}")
    print(f"Strong edges (>80)  : {np.sum(magnitude > 80):,} pixels")
    print(f"Weak edges (30–80)  : {np.sum((magnitude>=30) & (magnitude<80)):,} pixels")
    print(f"Gradient directions : min={direction.min():.3f} rad, max={direction.max():.3f} rad")
    print("========================================\n")


if __name__ == "__main__":
    main()