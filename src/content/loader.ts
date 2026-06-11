import { unitSchema, type Unit } from './schema';

/**
 * Parses and validates raw unit content. Fails fast with an error that
 * names the offending file and field so bad content never reaches the UI.
 */
export function parseUnit(raw: unknown, sourceName: string): Unit {
  const result = unitSchema.safeParse(raw);
  if (!result.success) {
    const issues = result.error.issues
      .map((issue) => `${issue.path.join('.') || '(root)'}: ${issue.message}`)
      .join('; ');
    throw new Error(`Invalid unit content in ${sourceName}: ${issues}`);
  }
  return result.data;
}

const unitModules = import.meta.glob<unknown>('./units/*.json', {
  eager: true,
  import: 'default',
});

const units: Unit[] = Object.entries(unitModules)
  .map(([path, raw]) => parseUnit(raw, path))
  .sort((a, b) => a.order - b.order);

const unitsById = new Map<string, Unit>();
for (const unit of units) {
  if (unitsById.has(unit.id)) {
    throw new Error(`Duplicate unit id "${unit.id}" in content packs`);
  }
  unitsById.set(unit.id, unit);
}

export function getUnits(): Unit[] {
  return units;
}

export function getUnit(id: string): Unit | undefined {
  return unitsById.get(id);
}
