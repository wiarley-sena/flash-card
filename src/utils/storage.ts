export interface UserStats {
    bestPercentage: number;
    totalSessions: number;
}

const STORAGE_KEYS = {
    USER_STATS: 'userStats',
};

export function getSavedStats(): UserStats {
    const data = localStorage.getItem(STORAGE_KEYS.USER_STATS);
    if(!data) {
        return {bestPercentage: 0, totalSessions: 0};
    }
    try {
        return JSON.parse(data);
    } catch {
        return {bestPercentage: 0, totalSessions: 0};
    }
}

export function saveStats(currentPercentage: number): UserStats {
    const currentStats = getSavedStats();
    const newStats = {
        bestPercentage: Math.max(currentStats.bestPercentage, currentPercentage),
        totalSessions: currentStats.totalSessions + 1,
    };
    localStorage.setItem(STORAGE_KEYS.USER_STATS, JSON.stringify(newStats));
    return newStats;
}