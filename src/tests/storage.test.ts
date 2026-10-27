import { describe, it, expect, beforeEach } from 'vitest';
import { getSavedStats, saveStats } from '../utils/storage';

describe('Storage Utils - Persistência no LocalStorage', () => {
  
  beforeEach(() => {
    localStorage.clear();
  });

  it('deve retornar valores padrão quando não houver dados salvos', () => {
    const stats = getSavedStats();
    expect(stats.bestPercentage).toBe(0);
    expect(stats.totalSessions).toBe(0);
  });

  it('deve atualizar o melhor aproveitamento e contabilizar as sessões individualmente', () => {
    
    saveStats(75);
    
    const updated = saveStats(50);

    expect(updated.bestPercentage).toBe(75);
    
    expect(updated.totalSessions).toBe(2);
  });
});