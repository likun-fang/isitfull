export type AuthProvider = 'GUEST' | 'GOOGLE' | 'APPLE';

export type UserRank = 'ECO_NEWBIE' | 'GREEN_SCOUT' | 'RVM_GUARDIAN' | 'ECO_CHAMPION' | 'LEGEND';

export interface User {
  id: string;
  provider: AuthProvider;
  email?: string;
  displayName?: string;
  avatarUrl?: string;
  karmaPoints: number;
  rank: UserRank;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
  merged?: {
    fromGuestId: string;
    pointsMerged: number;
  };
}

export interface KarmaLog {
  id: string;
  points: number;
  reason: string;
  refType?: string;
  refId?: string;
  rvmName?: string;
  createdAt: string;
}

export const RANK_INFO: Record<UserRank, { emoji: string; name: string; minKarma: number }> = {
  ECO_NEWBIE: { emoji: '🌱', name: 'Eco Newbie', minKarma: 0 },
  GREEN_SCOUT: { emoji: '🌿', name: 'Green Scout', minKarma: 200 },
  RVM_GUARDIAN: { emoji: '🛡️', name: 'RVM Guardian', minKarma: 1000 },
  ECO_CHAMPION: { emoji: '🏆', name: 'Eco Champion', minKarma: 3000 },
  LEGEND: { emoji: '👑', name: 'Eco Legend', minKarma: 10000 },
};
