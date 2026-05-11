# 🌳 Arboris: The Tree Visualization Laboratory

[![Vite](https://img.shields.io/badge/Vite-8.0-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.0-61DAFB?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.0-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)](LICENSE)

**Arboris** is a high-fidelity, interactive platform designed to demystify complex data structures through cinematic visualizations. Built for students, educators, and engineers, it transforms abstract algorithmic concepts into a tangible, step-by-step experience.

---

## ✨ Why Arboris?

Modern computer science education often lacks the bridge between theoretical logic and visual intuition. Arboris bridges this gap by providing:
- **Cinematic Animations**: Smooth, SVG-based transitions that track node movement and structural shifts.
- **Submarine-Dark Aesthetic**: A premium, glassmorphic UI designed to keep the focus on logic.
- **Step-Logic Tracer**: An integrated terminal that explains *why* the tree is changing in real-time.

---

## 🏗️ Supported Architectures

Arboris supports 7 distinct tree models, each with specialized logic and educational overlays:

### 1. 🌿 Binary Tree (BT)
The foundational model. Observe basic structural depth and level-order transitions.
- **Best for**: Understanding parent-child relationships and basic traversal.

### 2. 🔍 Binary Search Tree (BST)
Master the recursive comparison logic used in pathfinding.
- **Features**: Visual markers for `>` and `<` decisions during search/insertion.

### 3. ⚖️ AVL Tree
The gold standard for self-balancing trees.
- **Features**: Automatic rotations (Single/Double) with live **Balance Factor** indicators ($H_L - H_R$).

### 4. ⚡ Splay Tree
Experience self-adjusting search trees that bring frequently accessed data to the root.
- **Features**: Cinematic "Splaying" animations during every operation.

### 5. 🛡️ Red-Black Tree
Highly efficient balanced trees used in standard libraries (like `std::map`).
- **Features**: Visual recoloring and violation-fixing step-by-step logic.

### 6. 🗄️ B-Tree
Multi-key search tree architecture designed for large-scale data systems and databases.
- **Features**: Capsule-based node visualization and dynamic splitting/merging.

### 7. 🔗 B+ Tree
The advanced variant of B-Trees, optimized for range scanning.
- **Features**: Integrated **Leaf-Links** (linked list connection) for efficient sequential access.

---

## 🛠️ Interactive Laboratory Features

### 🖥️ High-Fidelity Dashboard
- **Insert/Search/Delete**: Fully interactive operations with real-time algorithmic feedback.
- **Traversals**: Execute **Pre-Order**, **In-Order**, and **Post-Order** traversals with a visual visitor highlight.
- **Order Control**: Customize the branching factor for B-Trees and B+ Trees.

### 📟 Step Logic Stream
The sidebar terminal acts as a "flight recorder" for your operations:
- **Tracer Ingress**: Timestamps for every algorithmic step.
- **Educational Annotations**: Contextual messages like *"Uncle is RED: Recoloring..."* or *"Borrowing from right sibling..."*

### 📏 Rules Atlas
Integrated modals that explain the mathematical constraints of complex trees (Order, Max Keys, Min Children, etc.) to ensure a deep understanding of the structural integrity.

---

## 🚀 Getting Started

### Prerequisites
- **Node.js**: v18.0 or higher
- **npm**: v9.0 or higher

### Installation

1. **Clone the laboratory**:
   ```bash
   git clone https://github.com/aakashraj7/tree-visualizations.git
   ```

2. **Enter the directory**:
   ```bash
   cd tree-visualizations
   ```

3. **Install the Engine**:
   ```bash
   npm install
   ```

4. **Launch Session**:
   ```bash
   npm run dev
   ```

---

## 🧬 Tech Stack

- **Core Engine**: React 19 (Functional Hooks & Performance Optimization)
- **Styling Architecture**: Tailwind CSS 4.0 + Custom Glassmorphic CSS
- **Visual Rendering**: Dynamic SVG with high-performance CSS transforms
- **Iconography**: Lucide React
- **Code Reference**: @monaco-editor/react (for future implementation code comparison)
- **Build System**: Vite 8.0

---

## 🎨 Design Philosophy
Arboris is built on the principle of **"Cognitive Clarity Through Aesthetics"**. 
- **Glow-Trace**: Active nodes glow to represent the algorithm's focus.
- **Haptic Colors**: A curated palette where Yellow = Search, Blue = Insert, Red = Delete, and Purple = Rebalancing.
- **Responsive Canvas**: The laboratory auto-scales to fit any resolution, ensuring your structures are always centered and clear.

---

## 📄 License
Distributed under the MIT License. See `LICENSE` for more information.

---

<p align="center">
  <i>Developed for the next generation of Algorithm Masters.</i>
</p>
