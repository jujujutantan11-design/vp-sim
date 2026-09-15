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
 */
export function Platform({ config, mainLED }: PlatformProps) {
  const visualRadius = mainLED.radius + 1.5;
  return (
    <mesh
      name="Platform"
      position={[0, -config.height / 2, 0]}
      receiveShadow
    >
      <cylinderGeometry args={[visualRadius, visualRadius, config.height, 64]} />
      <meshStandardMaterial color="#1a1a1a" roughness={0.9} />
    </mesh>
  );
}
