// Setup necessário para pdf-parse funcionar no Node.js
// Deve ser importado antes de qualquer código que use pdf-parse

import { createCanvas, createImageData, Image } from 'canvas'

// Extend globalThis to include polyfill properties
declare global {
  var DOMMatrix: any
  var Path2D: any
  var ImageData: any
  var Image: any
}

// Polyfills para pdfjs-dist funcionar no Node.js
if (!globalThis.DOMMatrix) {
  // @ts-ignore
  globalThis.DOMMatrix = class DOMMatrix {
    a = 1
    b = 0
    c = 0
    d = 1
    e = 0
    f = 0

    constructor(init?: any) {
      if (init) {
        if (Array.isArray(init)) {
          this.a = init[0]
          this.b = init[1]
          this.c = init[2]
          this.d = init[3]
          this.e = init[4]
          this.f = init[5]
        }
      }
    }

    scale(x: number, y: number = x) {
      return new (globalThis as any).DOMMatrix([
        this.a * x,
        this.b * x,
        this.c * y,
        this.d * y,
        this.e,
        this.f,
      ])
    }
  }
}

if (!globalThis.Path2D) {
  // @ts-ignore - Polyfill básico para Path2D
  globalThis.Path2D = class Path2D {}
}

if (!globalThis.ImageData) {
  // @ts-ignore
  globalThis.ImageData = createImageData as any
}

// @ts-ignore
globalThis.Image = Image

export {}
