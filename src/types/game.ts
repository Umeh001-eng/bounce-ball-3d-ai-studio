export type BallRarity = 'COMMON' | 'RARE' | 'EPIC' | 'LEGENDARY' | 'MYTHIC' | 'GOD';

export interface BallItem {
  id: string;
  name: string;
  subtitle: string;
  price: number;
  color: string;
  emissiveColor: string;
  glow: number;
  roughness: number;
  metalness: number;
  rarity: BallRarity;
  power: number;
  jumpPower: number;
  bounceBoost: number;
  doubleJump: boolean;
  trailType: 'none' | 'silver' | 'electric' | 'fire' | 'cosmic' | 'gold' | 'magma' | 'solar';
  texturePath?: string;
  description: string;
  effectDescription: string;
}

export interface PlayerStats {
  playerName: string;
  avatar: string;
  highScore: number;
  totalCoinsEarned: number;
  totalDistance: number;
  totalRuns: number;
  totalNearMisses: number;
  missionsCompleted: number;
  ownedBalls: string[];
  equippedBall: string;
  claimedMissions: string[];
}

export interface GameSettings {
  musicVolume: number;
  sfxVolume: number;
  soundEnabled: boolean;
  tiltEnabled: boolean;
  tiltSensitivity: number;
  graphicsQuality: 'high' | 'medium' | 'low';
  vibrationEnabled: boolean;
  touchControls: 'buttons' | 'swipe_only' | 'hybrid';
  timeOfDay: 'day' | 'night';
}

export interface Mission {
  id: string;
  title: string;
  description: string;
  target: number;
  rewardCoins: number;
  icon: string;
  category: 'daily' | 'achievement';
  currentProgress?: number;
}

export interface LeaderboardEntry {
  id?: string;
  player_name: string;
  score: number;
  created_at?: string;
  avatar?: string;
}

export type PowerUpType = 'shield' | 'speed' | 'magnet';

export interface ActivePowerUp {
  type: PowerUpType;
  duration: number;
  maxDuration: number;
}
