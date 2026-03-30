const UNIT_ALIASES: Record<string, 'ml' | 'l' | 'gm' | 'kg' | 'pcs' | 'stick'> = {
  ml: 'ml',
  milliliter: 'ml',
  milliliters: 'ml',
  l: 'l',
  litre: 'l',
  litres: 'l',
  liter: 'l',
  liters: 'l',
  gm: 'gm',
  g: 'gm',
  gram: 'gm',
  grams: 'gm',
  kg: 'kg',
  kilogram: 'kg',
  kilograms: 'kg',
  pc: 'pcs',
  pcs: 'pcs',
  piece: 'pcs',
  pieces: 'pcs',
  stick: 'stick',
  sticks: 'stick',
};

const PREFERRED_FORMAT = /^\d+(\.\d+)?\s*(ml|gm|g|gram|grams|kg|l|litre|liter|pcs|pc|piece|pieces|stick|sticks)$/i;

const formatNumber = (value: number) => {
  if (!Number.isFinite(value)) return '';
  return Number.isInteger(value) ? String(value) : String(Number(value.toFixed(2)));
};

export const isPreferredWeightFormat = (value: unknown) => {
  const raw = String(value || '').trim();
  if (!raw) return true;
  return PREFERRED_FORMAT.test(raw);
};

export const normalizeWeight = (value: unknown) => {
  const raw = String(value || '').trim();
  if (!raw) return '';

  const cleaned = raw.replace(/\s+/g, ' ');
  const match = cleaned.match(/^(\d+(?:\.\d+)?)\s*([a-zA-Z]+)$/);
  if (!match) return cleaned;

  const amount = parseFloat(match[1]);
  const unitRaw = match[2].toLowerCase();
  if (!Number.isFinite(amount)) return cleaned;

  const unit = UNIT_ALIASES[unitRaw];
  if (!unit) return cleaned;

  if (unit === 'ml') {
    if (amount >= 1000) return `${formatNumber(amount / 1000)} l`;
    return `${formatNumber(amount)} ml`;
  }
  if (unit === 'gm') {
    if (amount >= 1000) return `${formatNumber(amount / 1000)} kg`;
    return `${formatNumber(amount)} gm`;
  }
  if (unit === 'l') return `${formatNumber(amount)} l`;
  if (unit === 'kg') return `${formatNumber(amount)} kg`;
  if (unit === 'pcs') return `${formatNumber(amount)} pcs`;

  const plural = amount === 1 ? 'stick' : 'sticks';
  return `${formatNumber(amount)} ${plural}`;
};

export const toWeightKey = (value: unknown) => normalizeWeight(value).toLowerCase();
