export type EcoScoreLabel = "Отлично" | "Хорошо" | "Средне" | "Плохо";

export interface EcoScoreResult {
  score: number;
  label: EcoScoreLabel;
  color: string;
  description: string;
}

// Calculate eco-score based on product attributes
export function calculateEcoScore(params: {
  materials: string[];
  origin: string;
  hasRecycling: boolean;
  hasOrganicCert: boolean;
  isFairTrade: boolean;
  packagingType: string;
}): number {
  let score = 30;

  const ecoMaterials = ["бамбук", "конопля", "переработанный пластик", "органический хлопок", "пробка", "лён"];
  const ecoMatches = params.materials.filter((m) =>
    ecoMaterials.some((em) => m.toLowerCase().includes(em))
  ).length;
  score += Math.min(ecoMatches * 15, 30);

  if (params.hasRecycling) score += 15;
  if (params.hasOrganicCert) score += 10;
  if (params.isFairTrade) score += 10;

  const localOrigins = ["россия", "местный", "regional"];
  if (localOrigins.some((o) => params.origin.toLowerCase().includes(o))) {
    score += 10;
  }

  const ecoPacking = ["переработанная бумага", "без упаковки", "биоразлагаемый"];
  if (ecoPacking.some((p) => params.packagingType.toLowerCase().includes(p))) {
    score += 5;
  }

  return Math.min(score, 100);
}

export function getEcoScoreResult(score: number): EcoScoreResult {
  if (score >= 80) {
    return { score, label: "Отлично", color: "#16a34a", description: "Минимальный след на природе" };
  } else if (score >= 60) {
    return { score, label: "Хорошо", color: "#65a30d", description: "Товар экологически ответственный" };
  } else if (score >= 40) {
    return { score, label: "Средне", color: "#ca8a04", description: "Есть потенциал для улучшения" };
  } else {
    return { score, label: "Плохо", color: "#dc2626", description: "Высокое влияние на окружающую среду" };
  }
}
