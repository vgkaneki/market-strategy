import type { ChartLevel, LevelEngine, LevelEngineContext } from "./types.js";
import { SwingPivotLevelEngine } from "./SwingPivotLevelEngine.js";
import { LiquiditySweepLevelEngine } from "./LiquiditySweepLevelEngine.js";
import { createCompleteLevelCatalog } from "./catalog/CatalogLevelEngines.js";

export class LevelEngineRegistry {
  private engines = new Map<string, LevelEngine>();

  constructor() {
    this.register(new SwingPivotLevelEngine());
    this.register(new LiquiditySweepLevelEngine());
    for (const engine of createCompleteLevelCatalog()) this.register(engine);
  }

  register(engine: LevelEngine) {
    if (this.engines.has(engine.id)) {
      throw new Error(`Level engine already registered: ${engine.id}`);
    }
    this.engines.set(engine.id, engine);
  }

  list() {
    return [...this.engines.values()].map((engine) => ({
      id: engine.id,
      label: engine.label,
      minCandles: engine.minCandles
    }));
  }

  get(id: string) {
    return this.engines.get(id);
  }

  generateAll(context: LevelEngineContext, engineIds?: string[]): ChartLevel[] {
    const engines = engineIds?.length
      ? engineIds.map((id) => this.get(id)).filter(Boolean) as LevelEngine[]
      : [...this.engines.values()];

    const levels: ChartLevel[] = [];

    for (const engine of engines) {
      if (context.candles.length < engine.minCandles) continue;
      levels.push(...engine.generate(context));
    }

    return levels.sort((a, b) => a.createdAt - b.createdAt);
  }
}
