import * as THREE from './vendor/three.module.min.js';
import { createEditionStage } from './edition-scene.js?v=oil-2';
import { animateEdition } from './edition-controls.js?v=oil-1';

const host = document.querySelector('.edition-viewport');
const stage = document.querySelector('#cover-stage');
const toggle = document.querySelector('#cover-motion-toggle');
const reduced = matchMedia('(prefers-reduced-motion: reduce)');

if (host && stage && toggle && !reduced.matches) {
  let renderer;
  try {
    renderer = new THREE.WebGLRenderer({ antialias:true, alpha:false, powerPreference:'high-performance' });
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.25));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    stage.append(renderer.domElement);
    const edition = await createEditionStage(renderer);
    animateEdition(host, stage, toggle, renderer, edition, reduced);
  } catch (error) {
    host.closest('.edition-opening').classList.remove('motion-ready');
    host.classList.remove('motion-ready');
    toggle.hidden = true;
    renderer?.dispose();
    console.warn('Oil painting opening fallback:', error);
  }
}
