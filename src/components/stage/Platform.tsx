import type { PlatformConfig, MainLEDConfig } from "@/types/stage";

interface PlatformProps {
  config: PlatformConfig;
  mainLED: MainLEDConfig;
}

/**
 * Visualizes the permanent platform as a slab whose TOP surface sits at
 * Y = 0 (the world origin plane) and whose bottom sits at
 * Y = -platformHeight (the facility floor reference). Radius is drawn
 * somewhat larger than the LED radius for visual clarity only -- this is
 * not a claimed physical dimension.
 *
 * Confirmed by user (2026 review): the platform spans the ENTIRE LED
 * stage interior (not just a partial area), 0.17m above the facility
 * floor -- matching the original spec figure.
 *
 * Rendering notes:
 *  - Given brighter, more saturated colors + a distinct top-surface
 *    material so the riser doesn't blend into the background / grid.
 *  - A thin accent ring at the top rim (Y=0, radius = visualRadius)
 *    makes the 0.17m step clearly readable at a glance, since 0.17m is
 *    otherwise a very subtle height difference at normal camera
 *    distances.
 */
export function Platform({ config, mainLED }: PlatformProps) {
  const visualRadius = mainLED.radius + 1.5;
  return (
    <group name="Platform">
      <mesh position={[0, -config.height / 2, 0]} receiveShadow castShadow>
        <cylinderGeometry args={[visualRadius, visualRadius, config.height, 64]} />
        <meshStandardMaterial color="#4a4d52" roughness={0.75} metalness={0.05} />
      </mesh>

      {/* Top surface, drawn slightly above the cylinder cap to avoid
          z-fighting, in a lighter tone so the platform floor reads
          clearly distinct from the facility-floor grid below it. */}
      <mesh position={[0, 0.001, 0]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
        <circleGeometry args={[visualRadius, 64]} />
        <meshStandardMaterial color="#5c6066" roughness={0.6} />
      </mesh>

      {/* Rim accent ring at the top edge, to make the 0.17m riser
          unmistakable even at a glance / at a distance. */}
      <mesh position={[0, 0.002, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <ringGeometry args={[visualRadius - 0.05, visualRadius, 64]} />
        <meshStandardMaterial color="#8b8f96" roughness={0.5} />
      </mesh>
    </group>
  );
}
