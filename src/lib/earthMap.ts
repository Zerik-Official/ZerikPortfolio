/**
 * Real geography for the home planet, rasterised from Natural Earth (via
 * world-atlas) on first use: land, borders and Colombia, packed into the
 * channels of two textures the Earth shader reads.
 *
 * - R: land, G: Colombia, B: borders.
 * - The world map covers the whole globe; the region map is a sharp close-up
 *   around Colombia for when the camera dives to it.
 */
import { CanvasTexture, LinearFilter, type Texture, Vector3 } from "three";
import type { GeometryCollection, Topology } from "topojson-specification";

/** ISO 3166-1 numeric code of Colombia in world-atlas. */
const COLOMBIA_ID: string = "170";

/** Bogotá, where the signal lands. */
export const BOGOTA: { readonly lon: number; readonly lat: number } = { lon: -74.07, lat: 4.71 };

/** Close-up bounds around Colombia: [west, east, south, north] in degrees. */
export const REGION_BOUNDS: readonly [number, number, number, number] = [-84, -62, -8, 16];

const WORLD_SIZE: readonly [number, number] = [2048, 1024];
const REGION_PIXELS_PER_DEGREE: number = 28;

type Ring = readonly (readonly [number, number])[];
type Polygon = readonly Ring[];

interface Geometry {
  readonly type: string;
  readonly coordinates: unknown;
}

export interface EarthMaps {
  readonly world: Texture;
  readonly region: Texture;
}

/**
 * Unit vector for a longitude/latitude, matching three's SphereGeometry
 * mapping (longitude -180 at -X, 0 at +X, 90 east at -Z).
 */
export function lonLatToVector(lon: number, lat: number, target: Vector3 = new Vector3()): Vector3 {
  const phi: number = ((lon + 180) * Math.PI) / 180;
  const theta: number = ((90 - lat) * Math.PI) / 180;
  return target.set(-Math.cos(phi) * Math.sin(theta), Math.cos(theta), Math.sin(phi) * Math.sin(theta));
}

function polygonsOf(geometry: Geometry | null): readonly Polygon[] {
  if (!geometry) return [];
  if (geometry.type === "Polygon") return [geometry.coordinates as Polygon];
  if (geometry.type === "MultiPolygon") return geometry.coordinates as readonly Polygon[];
  return [];
}

/** Unwraps longitudes so rings crossing the antimeridian stay continuous. */
function unwrap(ring: Ring): [number, number][] {
  const points: [number, number][] = [];
  let offset: number = 0;
  let previous: number | null = null;
  ring.forEach(([lon, lat]): void => {
    if (previous !== null) {
      const step: number = lon - previous;
      if (step > 180) offset -= 360;
      else if (step < -180) offset += 360;
    }
    previous = lon;
    points.push([lon + offset, lat]);
  });
  return points;
}

interface Projection {
  readonly x: (lon: number) => number;
  readonly y: (lat: number) => number;
  /** Horizontal copies needed so wrapped shapes also cover the far edge. */
  readonly wraps: readonly number[];
}

function tracePolygons(context: CanvasRenderingContext2D, polygons: readonly Polygon[], projection: Projection): void {
  context.beginPath();
  polygons.forEach((polygon: Polygon): void => {
    polygon.forEach((ring: Ring): void => {
      const points: [number, number][] = unwrap(ring);
      projection.wraps.forEach((shift: number): void => {
        points.forEach(([lon, lat], index: number): void => {
          const x: number = projection.x(lon + shift);
          const y: number = projection.y(lat);
          if (index === 0) context.moveTo(x, y);
          else context.lineTo(x, y);
        });
        context.closePath();
      });
    });
  });
}

function drawMap(
  canvas: HTMLCanvasElement,
  projection: Projection,
  countries: readonly { readonly id: string; readonly polygons: readonly Polygon[] }[],
  borderWidth: number,
): void {
  const context: CanvasRenderingContext2D = canvas.getContext("2d") as CanvasRenderingContext2D;
  context.fillStyle = "#000";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.globalCompositeOperation = "lighter";

  context.fillStyle = "rgb(255,0,0)";
  countries.forEach((country): void => {
    tracePolygons(context, country.polygons, projection);
    context.fill("evenodd");
  });

  const colombia = countries.find((country): boolean => country.id === COLOMBIA_ID);
  if (colombia) {
    context.fillStyle = "rgb(0,255,0)";
    tracePolygons(context, colombia.polygons, projection);
    context.fill("evenodd");
  }

  context.strokeStyle = "rgb(0,0,255)";
  context.lineWidth = borderWidth;
  context.lineJoin = "round";
  countries.forEach((country): void => {
    tracePolygons(context, country.polygons, projection);
    context.stroke();
  });
  context.globalCompositeOperation = "source-over";
}

function toTexture(canvas: HTMLCanvasElement, mipmaps: boolean): Texture {
  const texture: CanvasTexture = new CanvasTexture(canvas);
  texture.anisotropy = 4;
  if (!mipmaps) {
    texture.generateMipmaps = false;
    texture.minFilter = LinearFilter;
  }
  return texture;
}

let pending: Promise<EarthMaps> | null = null;

/** Builds both maps once; the atlas and its parser load lazily with them. */
export function loadEarthMaps(): Promise<EarthMaps> {
  if (pending) return pending;
  pending = Promise.all([import("topojson-client"), import("world-atlas/countries-110m.json")]).then(([topojson, atlas]) => {
    const topology = ((atlas as { default?: unknown }).default ?? atlas) as Topology<{ countries: GeometryCollection }>;
    const collection = topojson.feature(topology, topology.objects.countries) as unknown as {
      readonly features: readonly { readonly id?: string | number; readonly geometry: Geometry | null }[];
    };
    const countries = collection.features.map((feature) => ({ id: String(feature.id ?? ""), polygons: polygonsOf(feature.geometry) }));

    const [worldWidth, worldHeight] = WORLD_SIZE;
    const world: HTMLCanvasElement = document.createElement("canvas");
    world.width = worldWidth;
    world.height = worldHeight;
    drawMap(
      world,
      { x: (lon: number): number => ((lon + 180) / 360) * worldWidth, y: (lat: number): number => ((90 - lat) / 180) * worldHeight, wraps: [-360, 0, 360] },
      countries,
      1.4,
    );

    const [west, east, south, north] = REGION_BOUNDS;
    const region: HTMLCanvasElement = document.createElement("canvas");
    region.width = Math.round((east - west) * REGION_PIXELS_PER_DEGREE);
    region.height = Math.round((north - south) * REGION_PIXELS_PER_DEGREE);
    drawMap(
      region,
      {
        x: (lon: number): number => (lon - west) * REGION_PIXELS_PER_DEGREE,
        y: (lat: number): number => (north - lat) * REGION_PIXELS_PER_DEGREE,
        wraps: [0],
      },
      countries,
      2.2,
    );

    return { world: toTexture(world, true), region: toTexture(region, false) };
  });
  return pending;
}
