import { GameSettings, Mission, PlayerStats } from '../types/game';

const STATS_KEY = 'bounceball_player_stats_v3';
const SETTINGS_KEY = 'bounceball_game_settings_v3';

export const DEFAULT_SETTINGS: GameSettings = {
  musicVolume: 0.6,
  sfxVolume: 0.8,
  soundEnabled: true,
  tiltEnabled: false,
  tiltSensitivity: 1.0,
  graphicsQuality: 'high',
  vibrationEnabled: true,
  touchControls: 'hybrid',
  timeOfDay: 'night'
};

export const INITIAL_MISSIONS: Mission[] = [
  {
    id: 'm_coins_100',
    title: 'Coin Collector',
    description: 'Collect 100 gameplay coins in total',
    target: 100,
    rewardCoins: 500,
    icon: '🪙',
    category: 'daily'
  },
  {
    id: 'm_score_1000',
    title: 'Highway Speedster',
    description: 'Reach a run score of 1,000 points',
    target: 1000,
    rewardCoins: 800,
    icon: '⚡',
    category: 'daily'
  },
  {
    id: 'm_survive_60',
    title: 'Survivor Instinct',
    description: 'Survive on the highway for 60 seconds in a single run',
    target: 60,
    rewardCoins: 1200,
    icon: '⏱️',
    category: 'daily'
  },
  {
    id: 'm_jump_20',
    title: 'Acrobatic Vault',
    description: 'Successfully jump over 20 barrier obstacles',
    target: 20,
    rewardCoins: 650,
    icon: '🦘',
    category: 'daily'
  },
  {
    id: 'm_near_miss_5',
    title: 'Adrenaline Rush',
    description: 'Score 5 near-miss close calls against enemies or barriers',
    target: 5,
    rewardCoins: 900,
    icon: '🎯',
    category: 'daily'
  },
  {
    id: 'm_distance_2000',
    title: 'Cross-County Tour',
    description: 'Travel a cumulative distance of 2,000 meters',
    target: 2000,
    rewardCoins: 1500,
    icon: '🛣️',
    category: 'achievement'
  },
  {
    id: 'm_own_3_balls',
    title: 'Sphere Connoisseur',
    description: 'Unlock at least 3 unique balls in the shops',
    target: 3,
    rewardCoins: 2500,
    icon: '⚽',
    category: 'achievement'
  },
  {
    id: 'm_lava_glory',
    title: 'Lava God Ascent',
    description: 'Acquire 50,000 cumulative lifetime coins towards the God of Lava',
    target: 50000,
    rewardCoins: 10000,
    icon: '🌋',
    category: 'achievement'
  }
];

export const AVATARS = ['🦁', '🦊', '🐺', '🐯', '🦅', '🐉', '🦈', '🐼', '🦝', '🐸'];

const DEFAULT_STATS: PlayerStats = {
  playerName: 'HighwayStar',
  avatar: '🦁',
  highScore: 0,
  totalCoinsEarned: 250, // Starting bonus for nice onboarding feel
  totalDistance: 0,
  totalRuns: 0,
  totalNearMisses: 0,
  missionsCompleted: 0,
  ownedBalls: ['chrome'],
  equippedBall: 'chrome',
  claimedMissions: []
};

export function loadPlayerStats(): PlayerStats {
  try {
    const raw = localStorage.getItem(STATS_KEY);
    if (!raw) {
      // Check legacy key if any
      const legacyRaw = localStorage.getItem('bounceBallShopSave_v2');
      if (legacyRaw) {
        const legacy = JSON.parse(legacyRaw);
        return {
          ...DEFAULT_STATS,
          totalCoinsEarned: Math.max(DEFAULT_STATS.totalCoinsEarned, Number(legacy.coins) || 0),
          ownedBalls: Array.isArray(legacy.unlocked) ? legacy.unlocked : ['chrome'],
          equippedBall: legacy.equipped || 'chrome'
        };
      }
      return { ...DEFAULT_STATS };
    }
    const parsed = JSON.parse(raw);
    return {
      ...DEFAULT_STATS,
      ...parsed,
      ownedBalls: Array.isArray(parsed.ownedBalls) && parsed.ownedBalls.length > 0 ? parsed.ownedBalls : ['chrome'],
      claimedMissions: Array.isArray(parsed.claimedMissions) ? parsed.claimedMissions : []
    };
  } catch {
    return { ...DEFAULT_STATS };
  }
}

export function savePlayerStats(stats: PlayerStats): void {
  try {
    localStorage.setItem(STATS_KEY, JSON.stringify(stats));
  } catch (err) {
    console.warn('Failed to save player stats to localStorage:', err);
  }
}

export function loadGameSettings(): GameSettings {
  try {
    const raw = localStorage.getItem(SETTINGS_KEY);
    if (!raw) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export function saveGameSettings(settings: GameSettings): void {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (err) {
    console.warn('Failed to save settings:', err);
  }
}
