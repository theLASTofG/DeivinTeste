export function roll(chance: number): boolean {
  return Math.random() < chance;
}

export interface WeightedItem<T> {
  item: T;
  weight: number;
}

export function weighted<T>(items: WeightedItem<T>[]): T {
  const totalWeight = items.reduce((sum, i) => sum + i.weight, 0);
  let random = Math.random() * totalWeight;
  for (const entry of items) {
    random -= entry.weight;
    if (random <= 0) {
      return entry.item;
    }
  }
  return items[items.length - 1].item;
}
