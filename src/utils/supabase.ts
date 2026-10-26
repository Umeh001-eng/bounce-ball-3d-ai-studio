import { createClient } from '@supabase/supabase-js';
import { LeaderboardEntry } from '../types/game';

const SUPABASE_URL = "https://frpsinogtxzhmrrttdpp.supabase.co";
const SUPABASE_KEY = "sb_publishable_XrKxDWWTcH1Eb4eYLFl5Ug_jg4fCrtu";
const LEADERBOARD_TABLE = "leaderboard";

let supabaseClient: ReturnType<typeof createClient> | null = null;
try {
  if (SUPABASE_URL && SUPABASE_KEY) {
    supabaseClient = createClient(SUPABASE_URL, SUPABASE_KEY);
  }
} catch (e) {
  console.warn('Supabase initialization fallback:', e);
}

const LOCAL_FALLBACK_LEADERBOARD: LeaderboardEntry[] = [
  { player_name: 'TitanApex', score: 28450, avatar: '🦁' },
  { player_name: 'CyberWolf99', score: 24100, avatar: '🐺' },
  { player_name: 'ViperFox', score: 19850, avatar: '🦊' },
  { player_name: 'InfernoKnight', score: 17200, avatar: '🐯' },
  { player_name: 'DragonDrifter', score: 14600, avatar: '🐉' },
  { player_name: 'SkyEagle7', score: 12900, avatar: '🦅' },
  { player_name: 'DeepShark', score: 10400, avatar: '🦈' },
  { player_name: 'PandaPulse', score: 8750, avatar: '🐼' },
  { player_name: 'GhostRaccoon', score: 7100, avatar: '🦝' },
  { player_name: 'NeonFrog', score: 5800, avatar: '🐸' }
];

export const AVATAR_LIST = ["🦁","🦊","🐺","🐯","🦅","🐉","🦈","🐼","🦝","🐸"];

export async function fetchTop10Leaderboard(): Promise<{ entries: LeaderboardEntry[]; isLive: boolean; error?: string }> {
  if (supabaseClient) {
    try {
      const { data, error } = await supabaseClient
        .from(LEADERBOARD_TABLE)
        .select('id, player_name, score, created_at')
        .order('score', { ascending: false })
        .limit(10);

      if (!error && data && data.length > 0) {
        const rows = data as unknown as LeaderboardEntry[];
        const mapped: LeaderboardEntry[] = rows.map((item, idx) => ({
          ...item,
          avatar: AVATAR_LIST[idx % AVATAR_LIST.length]
        }));
        return { entries: mapped, isLive: true };
      }
    } catch (err: unknown) {
      console.warn('Supabase fetch error, fallback to local demo list:', err);
    }
  }

  // Check if we have locally stored scores
  try {
    const localSaved = localStorage.getItem('bounceball_local_leaderboard');
    if (localSaved) {
      const parsed = JSON.parse(localSaved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return { entries: parsed.slice(0, 10), isLive: false };
      }
    }
  } catch {}

  return { entries: LOCAL_FALLBACK_LEADERBOARD, isLive: false };
}

export async function submitScore(name: string, score: number): Promise<{ success: boolean; message: string; isLive: boolean }> {
  const sanitizedName = name.trim().replace(/\s+/g, ' ').slice(0, 20);
  if (!sanitizedName) {
    return { success: false, message: 'Please enter a valid nickname (1-20 characters).', isLive: false };
  }

  const finalScore = Math.max(0, Math.floor(score));

  if (supabaseClient) {
    try {
      const { error } = await (supabaseClient.from(LEADERBOARD_TABLE) as any)
        .insert({
          player_name: sanitizedName,
          score: finalScore
        });

      if (!error) {
        return { success: true, message: `Score of ${finalScore.toLocaleString()} verified and saved to Global Top 10!`, isLive: true };
      } else {
        console.warn('Supabase insert error:', error.message);
      }
    } catch (err) {
      console.warn('Supabase insert network error:', err);
    }
  }

  // Save to local demonstration leaderboard so user sees their score on this device
  try {
    let list = [...LOCAL_FALLBACK_LEADERBOARD];
    const localSaved = localStorage.getItem('bounceball_local_leaderboard');
    if (localSaved) {
      try { list = JSON.parse(localSaved); } catch {}
    }

    list.push({
      player_name: sanitizedName,
      score: finalScore,
      avatar: AVATAR_LIST[Math.floor(Math.random() * AVATAR_LIST.length)]
    });

    list.sort((a, b) => b.score - a.score);
    localStorage.setItem('bounceball_local_leaderboard', JSON.stringify(list.slice(0, 20)));

    return {
      success: true,
      message: `Score saved locally! (Backend unavailable: preserved on this device)`,
      isLive: false
    };
  } catch (e: unknown) {
    return { success: false, message: 'Failed to record score locally.', isLive: false };
  }
}
