import type { ComponentType } from 'react';
import type { Material } from '../types/problem';
import { GearMesh } from './GearMesh';
import { SphereMesh } from './SphereMesh';
import { BoxMesh } from './BoxMesh';
import { CylinderMesh } from './CylinderMesh';
import { PolygonMesh } from './PolygonMesh';
import { CircularTrackMesh } from './CircularTrackMesh';

// Each mesh component below is strongly typed against its own Geometry
// variant. The registry itself is intentionally loose (`geo: any`) because a
// `Record<kind, Component>` lookup can't statically narrow which variant
// applies - EntityNode is responsible for only ever pairing a `kind` with
// its matching geometry payload.
type GeometryProps = {
  geo: any;
  material: Material;
};

export const geometryRegistry: Record<
  string,
  ComponentType<GeometryProps>
> = {
  gear: GearMesh,
  sphere: SphereMesh,
  box: BoxMesh,
  cylinder: CylinderMesh,
  polygon: PolygonMesh,
  circular_track: CircularTrackMesh,
};
