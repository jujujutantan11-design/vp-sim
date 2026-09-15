import * as THREE from "three";
import { degToRad } from "./coordinates";

/**
 * Horizontal field of view.
 *   HFOV = 2 * atan(sensorWidth / (2 * focalLength))
 * sensorWidthMm and focalLengthMm must be in the same unit (mm).
 * Returns radians.
 */
export function calculateHFOV(sensorWidthMm: number, focalLengthMm: number): number {
  return 2 * Math.atan(sensorWidthMm / (2 * focalLengthMm));
}

/**
 * Vertical field of view.
 *   VFOV = 2 * atan(sensorHeight / (2 * focalLength))
 * Returns radians.
 */
export function calculateVFOV(sensorHeightMm: number, focalLengthMm: number): number {
  return 2 * Math.atan(sensorHeightMm / (2 * focalLengthMm));
}

/** sensorDiagonal = sqrt(sensorWidth^2 + sensorHeight^2) */
export function calculateSensorDiagonal(sensorWidthMm: number, sensorHeightMm: number): number {
  return Math.sqrt(sensorWidthMm * sensorWidthMm + sensorHeightMm * sensorHeightMm);
}

/**
 * Diagonal field of view.
 *   DFOV = 2 * atan(sensorDiagonal / (2 * focalLength))
 * Returns radians.
 */
export function calculateDFOV(
  sensorWidthMm: number,
  sensorHeightMm: number,
  focalLengthMm: number
): number {
  const diagonal = calculateSensorDiagonal(sensorWidthMm, sensorHeightMm);
  return 2 * Math.atan(diagonal / (2 * focalLengthMm));
}

export interface FOVResult {
  hfovRad: number;
  vfovRad: number;
  dfovRad: number;
  hfovDeg: number;
  vfovDeg: number;
  dfovDeg: number;
}

/** Convenience: compute all three FOV values (radians + degrees) at once. */
export function calculateFOV(
  sensorWidthMm: number,
  sensorHeightMm: number,
  focalLengthMm: number
): FOVResult {
  const hfovRad = calculateHFOV(sensorWidthMm, focalLengthMm);
  const vfovRad = calculateVFOV(sensorHeightMm, focalLengthMm);
  const dfovRad = calculateDFOV(sensorWidthMm, sensorHeightMm, focalLengthMm);
  return {
    hfovRad,
    vfovRad,
    dfovRad,
    hfovDeg: (hfovRad * 180) / Math.PI,
    vfovDeg: (vfovRad * 180) / Math.PI,
    dfovDeg: (dfovRad * 180) / Math.PI,
  };
}

/**
 * Builds the simulated cinema camera's world orientation quaternion from
 * pan/tilt/roll (degrees), avoiding Euler-order ambiguity bugs (spec §13).
 *
 * Convention (matches world coordinate system in src/utils/coordinates.ts):
 *   - pan = 0, tilt = 0, roll = 0  => camera looks toward -Z (three.js
 *     camera default forward), consistent with world "north" = -Z.
 *   - pan (yaw) rotates around world +Y, positive = turning toward +X.
 *   - tilt (pitch) rotates around the camera's local X axis, positive =
 *     tilting up.
 *   - roll rotates around the camera's local Z (forward) axis.
 *
 * We apply rotations in a fixed, explicit YXZ order (yaw, then pitch,
 * then roll) via THREE.Euler with order "YXZ" -- this order is chosen
 * deliberately (not Three.js's default "XYZ") to match standard
 * pan/tilt/roll camera-rig semantics, and is documented here so it is
 * never silently assumed elsewhere.
 */
export function panTiltRollToQuaternion(
  panDeg: number,
  tiltDeg: number,
  rollDeg: number
): THREE.Quaternion {
  const euler = new THREE.Euler(
    degToRad(tiltDeg), // X = pitch
    degToRad(panDeg), // Y = yaw
    degToRad(rollDeg), // Z = roll
    "YXZ"
  );
  return new THREE.Quaternion().setFromEuler(euler);
}

/**
 * Builds a THREE.PerspectiveCamera representing the simulated cinema
 * camera at the given world position/orientation and vertical FOV.
 * This is the SINGLE source of truth for the simulated camera's
 * projection -- frustum visualization, camera monitor, and (Phase 3)
 * coverage ray generation must all derive from this camera's actual
 * projection matrix, never an approximated pyramid (spec §14).
 */
export function buildSimulatedCamera(params: {
  positionX: number;
  positionY: number;
  positionZ: number;
  panDeg: number;
  tiltDeg: number;
  rollDeg: number;
  vfovDeg: number;
  aspect: number;
  near: number;
  far: number;
}): THREE.PerspectiveCamera {
  const cam = new THREE.PerspectiveCamera(params.vfovDeg, params.aspect, params.near, params.far);
  cam.position.set(params.positionX, params.positionY, params.positionZ);
  cam.quaternion.copy(panTiltRollToQuaternion(params.panDeg, params.tiltDeg, params.rollDeg));
  cam.updateMatrixWorld(true);
  cam.updateProjectionMatrix();
  return cam;
}
