import { BallItem } from '../types/game';

export const SOLAR_GOD_PRICE = 100000;

export const STANDARD_BALLS: BallItem[] = [
  {
    id: 'chrome',
    name: 'SILVER PHANTOM',
    subtitle: 'Aerodynamic Liquid Quicksilver',
    price: 500,
    color: '#cbd5e1',
    emissiveColor: '#334155',
    glow: 0.15,
    roughness: 0.1,
    metalness: 0.95,
    rarity: 'COMMON',
    power: 1,
    jumpPower: 7.2,
    bounceBoost: 1.0,
    doubleJump: false,
    trailType: 'silver',
    texturePath: '/assets/aistudio/IMG_0606_5c82127f.jpeg',
    description: 'Forged from ultra-pure liquid mercury. Low friction surface yields swift rebound.',
    effectDescription: 'Quick ground rebound • Chrome mirror polish'
  },
  {
    id: 'thunder',
    name: 'THUNDER BOLT',
    subtitle: 'High-Voltage Plasma Core',
    price: 2000,
    color: '#38bdf8',
    emissiveColor: '#0284c7',
    glow: 0.45,
    roughness: 0.2,
    metalness: 0.8,
    rarity: 'RARE',
    power: 2,
    jumpPower: 8.8,
    bounceBoost: 1.25,
    doubleJump: false,
    trailType: 'electric',
    texturePath: '/assets/aistudio/IMG_0607_34053dcd.jpeg',
    description: 'Crackling with stored atmospheric lightning. Propels the ball with explosive vertical thrust.',
    effectDescription: 'High jump velocity • Electric discharge trail'
  },
  {
    id: 'inferno',
    name: 'INFERNO BEAST',
    subtitle: 'Molten Obsidian Core',
    price: 5000,
    color: '#fb923c',
    emissiveColor: '#dc2626',
    glow: 0.6,
    roughness: 0.35,
    metalness: 0.6,
    rarity: 'EPIC',
    power: 3,
    jumpPower: 10.4,
    bounceBoost: 1.45,
    doubleJump: false,
    trailType: 'fire',
    texturePath: '/assets/aistudio/IMG_0596_cb6ae26f.jpeg',
    description: 'Chiseled from sub-terrestrial lava veins. Radiates intense geothermal heat and shock absorption.',
    effectDescription: 'Heavy ground bounce • Fiery ember wake'
  },
  {
    id: 'galaxy',
    name: 'GALAXY TITAN',
    subtitle: 'Cosmic Singularity Sphere',
    price: 10000,
    color: '#c084fc',
    emissiveColor: '#7c3aed',
    glow: 0.75,
    roughness: 0.25,
    metalness: 0.7,
    rarity: 'LEGENDARY',
    power: 4,
    jumpPower: 12.0,
    bounceBoost: 1.7,
    doubleJump: false,
    trailType: 'cosmic',
    texturePath: '/assets/aistudio/IMG_0608_66874e67.jpeg',
    description: 'Traps a swirling celestial nebula within an ethereal shell. Glides with anti-gravitational ease.',
    effectDescription: 'Mega atmospheric jump • Stardust particle trail'
  },
  {
    id: 'lava',
    name: 'GOD OF LAVA',
    subtitle: 'Volcanic Magma Destroyer',
    price: 25000,
    color: '#ff4d00',
    emissiveColor: '#ff2200',
    glow: 0.95,
    roughness: 0.4,
    metalness: 0.6,
    rarity: 'MYTHIC',
    power: 5,
    jumpPower: 13.5,
    bounceBoost: 2.0,
    doubleJump: true,
    trailType: 'magma',
    texturePath: '/assets/aistudio/8E8BDF34-0432-41C6-8DBB-EAF2D658C56D_9c3fb033.png',
    description: 'Forged in subterranean magma veins. Cracks with molten fury and grants mid-air double jumping.',
    effectDescription: 'Double jump ability • Molten volcanic wake'
  }
];

export const SOLAR_GOD_BALL: BallItem = {
  id: 'solar_hyperdrive',
  name: 'SOLAR HYPERDRIVE',
  subtitle: 'GOD OF SPEED — THE GOLDEN EMPEROR',
  price: SOLAR_GOD_PRICE,
  color: '#ffd700',
  emissiveColor: '#f59e0b',
  glow: 1.4,
  roughness: 0.1,
  metalness: 0.98,
  rarity: 'GOD',
  power: 6,
  jumpPower: 15.0,
  bounceBoost: 2.4,
  doubleJump: true,
  trailType: 'solar',
  texturePath: '/assets/aistudio/8B0586A1-5445-480E-9475-948EADC87DE1_0e76a0bc.png',
  description: 'The supreme ruler of speed and solar energy. Features blazing golden neon conduits, light-speed supersonic shockwaves, and infinite air vaulting.',
  effectDescription: 'Light-speed shockwave • Blazing golden solar wake • Double jump agility'
};

export const ALL_BALLS: BallItem[] = [...STANDARD_BALLS, SOLAR_GOD_BALL];

export function getBallById(id: string): BallItem {
  // Support legacy equipped IDs seamlessly
  if (id === 'royal' || id === 'lava_god' || id === 'lava') {
    return STANDARD_BALLS.find(b => b.id === 'lava') || STANDARD_BALLS[4];
  }
  return ALL_BALLS.find(b => b.id === id) || STANDARD_BALLS[0];
}
