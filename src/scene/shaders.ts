/** GLSL sources for the procedural celestial bodies. */

export const GALAXY_VERTEX: string = /* glsl */ `
uniform float uTime;
uniform float uRadius;
uniform float uScale;
attribute vec3 aOrbit;
attribute float aSize;
attribute vec3 aColor;
varying vec3 vColor;

void main() {
  float radius = aOrbit.x;
  float angle = aOrbit.y + uTime * 0.045 / (0.25 + radius / uRadius * 0.75);
  vec3 position = vec3(cos(angle) * radius, aOrbit.z, sin(angle) * radius);
  vec4 viewPosition = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * viewPosition;
  gl_PointSize = clamp(aSize * uScale / -viewPosition.z, 1.0, 48.0);
  vColor = aColor;
}
`;

export const GALAXY_FRAGMENT: string = /* glsl */ `
uniform float uOpacity;
varying vec3 vColor;

void main() {
  float distanceToCenter = length(gl_PointCoord - 0.5);
  float alpha = smoothstep(0.5, 0.0, distanceToCenter);
  gl_FragColor = vec4(vColor * alpha * uOpacity, 1.0);
}
`;

export const ACCRETION_VERTEX: string = /* glsl */ `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

/** Accretion disc on a RingGeometry: uv.x is the angle, uv.y the radius. */
export const ACCRETION_FRAGMENT: string = /* glsl */ `
uniform float uTime;
uniform float uOpacity;
uniform vec3 uHot;
uniform vec3 uCool;
varying vec2 vUv;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
float noise(vec2 p) {
  vec2 i = floor(p);
  vec2 f = fract(p);
  vec2 u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
}

void main() {
  float radius = vUv.y;
  float angle = vUv.x * 6.2831853;
  float swirl = angle * 3.0 - uTime * (1.6 - radius) * 1.4 + radius * 9.0;
  float streaks = noise(vec2(swirl, radius * 22.0)) * 0.6 + noise(vec2(swirl * 2.3, radius * 48.0)) * 0.4;
  float falloff = smoothstep(0.0, 0.08, radius) * pow(1.0 - radius, 1.6);
  vec3 color = mix(uHot, uCool, smoothstep(0.0, 0.85, radius));
  float intensity = falloff * (0.45 + streaks * 0.95);
  gl_FragColor = vec4(color * intensity * uOpacity * 2.2, 1.0);
}
`;

export const HALO_FRAGMENT: string = /* glsl */ `
uniform float uOpacity;
uniform vec3 uHot;
varying vec2 vUv;
void main() {
  float radius = vUv.y;
  float ring = smoothstep(0.0, 0.12, radius) * pow(1.0 - radius, 3.0);
  gl_FragColor = vec4(uHot * ring * uOpacity * 2.4, 1.0);
}
`;

export const ATMOSPHERE_VERTEX: string = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vNormal = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - worldPosition.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;

export const ATMOSPHERE_FRAGMENT: string = /* glsl */ `
uniform vec3 uColor;
uniform float uPower;
uniform float uOpacity;
varying vec3 vNormal;
varying vec3 vView;
void main() {
  float rim = pow(1.0 - abs(dot(vNormal, vView)), uPower);
  gl_FragColor = vec4(uColor * rim * uOpacity, 1.0);
}
`;

/**
 * Earth at night. With the map loaded it draws real land (R), Colombia (G)
 * and borders (B); a close-up texture sharpens the area around Colombia.
 * The contact signal spreads from uOrigin across Colombia only.
 */
export const EARTH_FRAGMENT: string = /* glsl */ `
uniform float uTime;
uniform sampler2D uWorld;
uniform sampler2D uRegion;
uniform float uHasMap;
uniform vec4 uRegionBounds;
uniform vec3 uOrigin;
uniform float uSignal;
uniform float uSignalGlow;
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vLocal;
varying vec2 vUv;

float hash(vec3 p) { return fract(sin(dot(p, vec3(127.1, 311.7, 74.7))) * 43758.5453); }
float noise(vec3 p) {
  vec3 i = floor(p);
  vec3 f = fract(p);
  vec3 u = f * f * (3.0 - 2.0 * f);
  return mix(
    mix(mix(hash(i), hash(i + vec3(1, 0, 0)), u.x), mix(hash(i + vec3(0, 1, 0)), hash(i + vec3(1, 1, 0)), u.x), u.y),
    mix(mix(hash(i + vec3(0, 0, 1)), hash(i + vec3(1, 0, 1)), u.x), mix(hash(i + vec3(0, 1, 1)), hash(i + vec3(1, 1, 1)), u.x), u.y),
    u.z);
}
float fbm(vec3 p) {
  float value = 0.0;
  float amplitude = 0.5;
  for (int i = 0; i < 5; i++) { value += amplitude * noise(p); p *= 2.03; amplitude *= 0.5; }
  return value;
}

vec3 sampleMap(vec3 dir) {
  vec3 world = texture2D(uWorld, vUv).rgb;
  float lat = degrees(asin(clamp(dir.y, -1.0, 1.0)));
  float lon = degrees(atan(dir.z, -dir.x)) - 180.0;
  if (lon < -180.0) lon += 360.0;
  vec2 regionUv = vec2(
    (lon - uRegionBounds.x) / (uRegionBounds.y - uRegionBounds.x),
    (lat - uRegionBounds.z) / (uRegionBounds.w - uRegionBounds.z));
  if (regionUv.x > 0.0 && regionUv.x < 1.0 && regionUv.y > 0.0 && regionUv.y < 1.0) {
    vec2 edge = min(regionUv, 1.0 - regionUv);
    return mix(world, texture2D(uRegion, regionUv).rgb, smoothstep(0.0, 0.08, min(edge.x, edge.y)));
  }
  return world;
}

void main() {
  vec3 dir = normalize(vLocal);
  float land;
  float home = 0.0;
  float border = 0.0;
  if (uHasMap > 0.5) {
    vec3 map = sampleMap(dir);
    land = map.r;
    home = map.g;
    border = map.b;
  } else {
    land = smoothstep(0.47, 0.53, fbm(dir * 2.2 + vec3(0.0, 0.0, uTime * 0.01)));
  }
  vec3 amber = vec3(1.0, 0.72, 0.38);
  vec3 ocean = vec3(0.01, 0.05, 0.14);
  vec3 ground = vec3(0.05, 0.11, 0.08);
  vec3 base = mix(ocean, ground, land);
  float lightSide = smoothstep(-0.2, 0.6, dot(vNormal, normalize(vec3(-0.4, 0.8, 0.5))));
  float cities = step(0.78, noise(vLocal * 28.0)) * land * (1.0 - lightSide);
  vec3 color = base * (0.35 + lightSide * 0.9) + amber * cities * 0.75;
  color += vec3(0.55, 0.45, 0.3) * border * (0.08 + lightSide * 0.14);
  color += amber * home * 0.05;

  float distance = acos(clamp(dot(dir, uOrigin), -1.0, 1.0));
  float filled = (1.0 - smoothstep(uSignal - 0.012, uSignal, distance)) * home;
  float front = exp(-pow((distance - uSignal) / 0.006, 2.0)) * home;
  float ripple = 0.65 + 0.35 * sin(uTime * 7.0 - distance * 140.0);
  float outline = border * smoothstep(0.0, 0.4, home) * step(distance, uSignal + 0.004);
  color += amber * (filled * 0.5 * ripple + front * 1.8 + outline * 1.2) * uSignalGlow;

  float rim = pow(1.0 - max(dot(vNormal, vView), 0.0), 3.0);
  color += vec3(0.25, 0.55, 1.0) * rim * 0.9;
  gl_FragColor = vec4(color, 1.0);
}
`;

export const EARTH_VERTEX: string = /* glsl */ `
varying vec3 vNormal;
varying vec3 vView;
varying vec3 vLocal;
varying vec2 vUv;
void main() {
  vec4 worldPosition = modelMatrix * vec4(position, 1.0);
  vNormal = normalize(mat3(modelMatrix) * normal);
  vView = normalize(cameraPosition - worldPosition.xyz);
  vLocal = position;
  vUv = uv;
  gl_Position = projectionMatrix * viewMatrix * worldPosition;
}
`;