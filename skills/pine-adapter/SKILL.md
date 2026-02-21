---
name: pine-adapter
description: Translate TradingView Pine Script indicators into TypeScript for the grid bot indicator engine. Plug-in architecture for custom strategies.
---

# Pine Script Adapter Skill

[PINE ADAPTER MODE ACTIVATED]

## Objective

Translate TradingView Pine Script indicators and strategies into TypeScript modules that plug into the grid bot's indicator engine. No rebuild needed — indicators auto-register.

## When to Use

- User provides a Pine Script indicator to add
- Translating TradingView strategies into bot-compatible logic
- Creating custom indicators for the grid trading system
- Debugging or testing translated indicators

## Activation

- `/pine-adapter`
- "Add this Pine Script indicator"
- "Translate my TradingView strategy"
- "Add custom indicator to the bot"

## Translation Workflow

1. **Receive** — User provides Pine Script code (paste or file)
2. **Analyze** — Parse the script to identify:
   - Input parameters (e.g., `input.int(14, "RSI Length")`)
   - Indicator functions used (e.g., `ta.rsi`, `ta.ema`, `ta.crossover`)
   - Entry/exit conditions
   - Plot outputs and alert conditions
3. **Translate** — Convert to TypeScript implementing the `Indicator` interface:
   - Map Pine `ta.*` functions to equivalent TypeScript math
   - Convert `input.*` to `defaultParams`
   - Map `strategy.entry/exit` to `signal: 'buy' | 'sell' | 'neutral'`
   - Compute confidence from signal strength
4. **Register** — Place in `grid-bot/src/indicators/custom/`
5. **Test** — Run against historical candle data to verify output matches Pine Script

## Pine Script → TypeScript Mapping

| Pine Script | TypeScript |
|-------------|-----------|
| `ta.rsi(close, 14)` | `calculateRSI(closes, 14)` (reuse from built-in) |
| `ta.ema(close, 9)` | `calculateEMA(closes, 9)` (reuse from built-in) |
| `ta.sma(close, 20)` | `closes.slice(-20).reduce((a,b) => a+b) / 20` |
| `ta.atr(14)` | `calculateATR(candles, 14)` (reuse from built-in) |
| `ta.crossover(a, b)` | `prev_a <= prev_b && curr_a > curr_b` |
| `ta.crossunder(a, b)` | `prev_a >= prev_b && curr_a < curr_b` |
| `close` | `candles[i].close` |
| `high` | `candles[i].high` |
| `volume` | `candles[i].volume` |
| `input.int(14)` | `params.period` in `defaultParams` |
| `strategy.entry("long")` | `signal: 'buy'` |
| `strategy.close("long")` | `signal: 'sell'` |
| `alertcondition(...)` | Indicator output `metadata` |

## Indicator Interface

Every custom indicator must implement:

```typescript
import type { Indicator, IndicatorConfig, IndicatorInput, IndicatorOutput } from '../types.js';

export class MyIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'my-indicator',
    description: 'Translated from Pine Script',
    defaultParams: { period: 14 },
    timeframe: '15m',
    minCandles: 15,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    // Translated logic here
    return { signal: 'neutral', confidence: 0.5, values: {} };
  }
}
```

## File Location

```
grid-bot/src/indicators/
├── types.ts                # Indicator interface (DO NOT MODIFY)
├── engine.ts               # Registry + execution engine
├── built-in/               # RSI, EMA, ATR, MACD, Bollinger, SuperTrend
└── custom/                 # ← Your translated Pine Scripts go here
    └── README.md           # How-to guide
```

## Constraints

- Start with simple indicator scripts (single-timeframe)
- Multi-timeframe scripts require additional candle data feeds
- `security()` calls (cross-symbol data) not supported in POC
- Complex Pine Script drawing functions (plotshape, plotchar) are ignored
- Focus on entry/exit signal logic, not visual output

## Testing

After translation:
1. Feed 100+ historical candles from Birdeye
2. Compare output signals to TradingView chart
3. Verify signal timing matches within 1 candle
4. Check edge cases (insufficient data, flat market, extreme volatility)
