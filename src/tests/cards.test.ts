import { describe, it, expect } from 'vitest';
import { calculateScoreSummary } from '../utils/cards';

describe('calculateScoreSummary - Lógica de Desempenho', () => {
  it('deve calcular corretamente a porcentagem de acertos quando houver acertos parciais', () => {
    const result = calculateScoreSummary(
      { correct: 3, total: 4 },
      () => {}
    );

    expect(result.stats.correct).toBe(3);
    expect(result.stats.total).toBe(4);
    expect(result.stats.percentage).toBe(75);
  });

  it('deve retornar 0% de aproveitamento quando o total de acertos for zero', () => {
    const result = calculateScoreSummary(
      { correct: 0, total: 4 },
      () => {}
    );

    expect(result.stats.percentage).toBe(0);
  });

  it('deve calcular 100% de aproveitamento quando todos forem corretos', () => {
    const result = calculateScoreSummary(
      { correct: 4, total: 4 },
      () => {}
    );

    expect(result.stats.percentage).toBe(100);
  });
});