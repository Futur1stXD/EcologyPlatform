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
  isVegan?: boolean;
  isLocalDelivery?: boolean;
  hasCarbonNeutral?: boolean;
  hasEnergyEfficiency?: boolean;
  hasZeroWaste?: boolean;
  isDurable?: boolean;
}): number {
  let score = 10; // base

  // Materials — expanded list, partial match, up to 3 matches × 10 = 30
  const ecoMaterials = [
    "бамбук", "конопля", "переработан", "органическ", "пробка",
    "лён", "льнян", "джут", "сизаль", "шерсть", "натуральн",
    "биоразлагаем", "кукурузн", "соев", "водоросл", "тростник",
    "хлопок", "кокос", "cork", "bamboo", "hemp", "recycled",
    "organic", "linen", "jute", "seaweed",
  ];
  const ecoMatches = params.materials.filter((m) =>
    ecoMaterials.some((em) => m.toLowerCase().includes(em))
  ).length;
  score += Math.min(ecoMatches * 10, 30);

  // Certifications & practices
  if (params.hasRecycling)       score += 12;
  if (params.hasOrganicCert)     score += 10;
  if (params.isFairTrade)        score += 8;
  if (params.isVegan)            score += 8;
  if (params.hasCarbonNeutral)   score += 10;
  if (params.hasEnergyEfficiency) score += 8;
  if (params.hasZeroWaste)       score += 8;
  if (params.isDurable)          score += 5;
  if (params.isLocalDelivery)    score += 7;

  // Local / regional origin
  const localOrigins = [
    "казахстан", "алматы", "астана", "шымкент", "местн", "regional",
    "россия", "беларус", "кыргызстан", "узбекистан",
  ];
  if (localOrigins.some((o) => params.origin.toLowerCase().includes(o))) {
    score += 8;
  }

  // Eco packaging
  const ecoPacking = [
    "переработанн", "без упаковки", "биоразлагаем", "картон",
    "бумаг", "компостируем", "многоразов", "recycled", "biodegradable",
  ];
  if (ecoPacking.some((p) => params.packagingType.toLowerCase().includes(p))) {
    score += 8;
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
