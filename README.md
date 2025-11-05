
# 🎨 ImageLab — Web-Based Image Editor (Next.js + Konva + Zustand)

**ImageLab** is a lightweight, browser-based image editor built using **Next.js (App Router)**, **React**, **Konva.js**, and **Zustand**.  
It enables users to **upload, annotate, transform, crop, draw, and export images** — entirely client-side, with no external storage required.

This project was developed as part of a frontend engineering assignment, with emphasis on **tooling clarity, modular design, performance considerations, and extensibility**.

---

## 🌐 Live Demo

**Try it here:**  
https://medulla-project.vercel.app/

---

## 🧭 Core Capabilities

| Feature | Description |
|--------|-------------|
| **Upload** | Select image from device storage (PNG, JPEG supported). |
| **Canvas-based Editing** | Powered by **Konva** for high-performance 2D drawing & transforms. |
| **Rotate** | Quick rotate (90° steps) + transforms tracked in state store. |
| **Crop Tool** | Drag-to-select crop region → apply & update canvas. Supports undo. |
| **Freehand Drawing** | Smooth pen drawing with adjustable brush properties. |
| **Text Annotation** | Add text anywhere on canvas → drag, position, and edit via double-click. |
| **Zoom & Pan** | Scroll to zoom, hold **Space** to pan (industry-standard UX). |
| **Undo / Redo** | History-aware editor state snapshots (up to 10 steps). |
| **Export** | Download final rendered output as **PNG**. |
| **Responsive UI** | Toolbar, console, and canvas adapt to desktop / tablet breakpoints. |

---

## 🏗️ System Architecture Overview



## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.


This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).