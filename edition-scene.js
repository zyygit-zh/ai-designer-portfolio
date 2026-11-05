import * as THREE from './vendor/three.module.min.js';

const vertex = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const fragment = `
  uniform sampler2D firstScene;
  uniform sampler2D nextScene;
  uniform float progress;
  uniform float aspect;
  uniform float time;
  uniform vec2 center;
  varying vec2 vUv;

  float hash(vec2 point) {
    return fract(sin(dot(point, vec2(127.1, 311.7))) * 43758.5453);
  }

  float noise(vec2 point) {
    vec2 cell = floor(point);
    vec2 local = fract(point);
    vec2 blend = local * local * (3.0 - 2.0 * local);
    return mix(mix(hash(cell), hash(cell + vec2(1, 0)), blend.x),
      mix(hash(cell + vec2(0, 1)), hash(cell + vec2(1, 1)), blend.x), blend.y);
  }

  void main() {
    if (progress <= 0.0) {
      gl_FragColor = texture2D(firstScene, vUv);
    } else if (progress >= 1.0) {
      gl_FragColor = texture2D(nextScene, vUv);
    } else {
      vec2 away = vUv - center;
      vec2 firstUv = center + away * (1.0 - smoothstep(0.2, 1.0, progress) * 0.1);
      vec2 nextUv = center + away * (1.0 + (1.0 - smoothstep(0.0, 0.8, progress)) * 0.1);
      vec3 first = texture2D(firstScene, firstUv).rgb;
      vec3 next = texture2D(nextScene, nextUv).rgb;
      vec2 position = vUv * vec2(aspect, 1.0);
      float grain = noise(position * 35.0 + time * 0.13) * 0.12
        + noise(position * 130.0) * 0.025 - 0.07;
      float radius = length(away * vec2(aspect, 1.0)) * 0.72;
      float limit = mix(radius, -0.2, smoothstep(0.82, 1.0, progress)) + grain;
      float edge = smoothstep(0.0, 1.0, progress) - limit;
      float aa = max(fwidth(edge) * 4.0, 0.004);
      float blend = smoothstep(-aa, aa, edge);
      float intensity = sin(progress * 3.14159);
      vec3 luma = vec3(0.299, 0.587, 0.114);
      float etched = mix(fwidth(dot(first, luma)), fwidth(dot(next, luma)), blend);
      float rim = exp(-abs(edge) * 25.0);
      vec3 color = mix(first, next, blend) * (1.0 - 0.24 * intensity);
      color += vec3(1.0, 0.84, 0.62) * min(0.9, rim * 0.48 + etched * 7.0) * intensity;
      gl_FragColor = vec4(color, 1.0);
    }
    #include <colorspace_fragment>
  }
`;

function makePlane(texture, transparent = false) {
  return new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({
    map: texture, transparent, depthWrite: !transparent, toneMapped: false,
    alphaTest: transparent ? 0.008 : 0,
  }));
}

function cropHalf(texture, offset) {
  const half = texture.clone();
  half.repeat.x = 0.5;
  half.offset.x = offset;
  half.needsUpdate = true;
  return half;
}

function edgeMatte() {
  const width = 32;
  const height = 128;
  const data = new Uint8Array(width * height * 4);
  for (let y = 0; y < height; y++) {
    const hem = THREE.MathUtils.smoothstep(y / (height - 1), 0, 0.21);
    for (let x = 0; x < width; x++) {
      const outerEdge = THREE.MathUtils.smoothstep(x / (width - 1), 0, 0.15);
      const value = Math.round(255 * hem * outerEdge);
      data.set([value, value, value, 255], (y * width + x) * 4);
    }
  }
  const texture = new THREE.DataTexture(data, width, height);
  texture.magFilter = THREE.LinearFilter;
  texture.minFilter = THREE.LinearFilter;
  texture.needsUpdate = true;
  return texture;
}

export async function createEditionStage(renderer) {
  const loader = new THREE.TextureLoader();
  const [garden, figures, atelier] = await Promise.all([
    loader.loadAsync('assets/oil-edition/garden.webp'),
    loader.loadAsync('assets/oil-edition/figures.webp'),
    loader.loadAsync('assets/oil-edition/atelier.webp'),
  ]);
  [garden, figures, atelier].forEach(texture => { texture.colorSpace = THREE.SRGBColorSpace; });

  const opening = new THREE.Scene();
  const chapter = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 100);
  camera.position.z = 10;
  const openingBackdrop = makePlane(garden);
  const chapterBackdrop = makePlane(atelier);
  opening.add(openingBackdrop);
  chapter.add(chapterBackdrop);

  // Both halves use the same painting, so the fingers meet exactly on the center seam.
  const left = makePlane(cropHalf(figures, 0), true);
  const right = makePlane(cropHalf(figures, 0.5), true);
  const matte = edgeMatte();
  left.material.alphaMap = matte;
  // Feather the outer painting edges while keeping the center seam opaque.
  const rightMatte = matte.clone();
  rightMatte.repeat.x = -1;
  rightMatte.offset.x = 1;
  rightMatte.needsUpdate = true;
  right.material.alphaMap = rightMatte;
  left.renderOrder = 1;
  right.renderOrder = 2;
  opening.add(left, right);

  const targetOptions = { type: THREE.HalfFloatType, samples: 2 };
  const firstTarget = new THREE.WebGLRenderTarget(1, 1, targetOptions);
  const nextTarget = new THREE.WebGLRenderTarget(1, 1, targetOptions);
  const uniforms = {
    firstScene: { value: firstTarget.texture }, nextScene: { value: nextTarget.texture },
    aspect: { value: 1 }, progress: { value: 0 }, time: { value: 0 },
    center: { value: new THREE.Vector2(0.5, 0.44) },
  };
  const screen = new THREE.Scene();
  const screenCamera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
  const quad = new THREE.Mesh(new THREE.PlaneGeometry(2, 2), new THREE.ShaderMaterial({
    uniforms, vertexShader: vertex, fragmentShader: fragment, depthTest: false, depthWrite: false,
  }));
  quad.frustumCulled = false;
  screen.add(quad);

  const drawingSize = new THREE.Vector2();
  let width = 1;
  let height = 1;
  let figureWidth = 1;
  let figureHeight = 1;
  function resize(nextWidth, nextHeight) {
    width = nextWidth;
    height = nextHeight;
    renderer.setSize(width, height);
    Object.assign(camera, { left:-width / 2, right:width / 2, top:height / 2, bottom:-height / 2 });
    camera.updateProjectionMatrix();
    for (const plane of [openingBackdrop, chapterBackdrop]) {
      const image = plane.material.map.image;
      const scale = 1.055 * Math.max(width / image.width, height / image.height);
      plane.scale.set(image.width * scale, image.height * scale, 1);
    }
    figureWidth = width <= 700 ? width * 1.10 : Math.min(width * 1.09, Math.max(width * 0.91, height * 0.98));
    figureHeight = figureWidth * figures.image.height / figures.image.width;
    left.scale.set(figureWidth / 2, figureHeight, 1);
    right.scale.copy(left.scale);
    renderer.getDrawingBufferSize(drawingSize);
    firstTarget.setSize(drawingSize.x, drawingSize.y);
    nextTarget.setSize(drawingSize.x, drawingSize.y);
    uniforms.aspect.value = width / height;
  }

  function draw(progress, time, pointer) {
    const arrival = THREE.MathUtils.smoothstep(time, 0.12, 0.96);
    const gap = Math.max(0, (1 - arrival) * width * 0.055);
    const shift = pointer.x * width * 0.019;
    const centerY = -0.06 * height + (0.605 - 0.5) * figureHeight + pointer.y * 13;
    // A slight overlap after arrival avoids a sampling hairline without masking the contact.
    const seam = arrival === 1 ? 0.27 : 0;
    left.position.set(shift - figureWidth / 4 - gap + seam, centerY, 1);
    right.position.set(shift + figureWidth / 4 + gap - seam, centerY, 1);
    openingBackdrop.position.set(pointer.x * -16, pointer.y * 8, 0);
    chapterBackdrop.position.set(pointer.x * -13, pointer.y * 6, 0);
    uniforms.progress.value = progress;
    uniforms.time.value = time;
    uniforms.center.value.set(0.5 + shift / width, 0.44 - pointer.y * 13 / height);
    if (progress < 1) {
      renderer.setRenderTarget(firstTarget);
      renderer.render(opening, camera);
    }
    if (progress > 0) {
      renderer.setRenderTarget(nextTarget);
      renderer.render(chapter, camera);
    }
    renderer.setRenderTarget(null);
    renderer.render(screen, screenCamera);
    return gap;
  }

  return { resize, draw };
}
