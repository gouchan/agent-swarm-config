# Custom Indicators

Drop your translated Pine Script indicators here.

## How to Add a Custom Indicator

1. Create a new `.ts` file in this directory (e.g., `my-strategy.ts`)
2. Implement the `Indicator` interface:

```typescript
import type { Indicator, IndicatorConfig, IndicatorInput, IndicatorOutput } from '../types.js';

export class MyStrategyIndicator implements Indicator {
  config: IndicatorConfig = {
    name: 'my-strategy',
    description: 'My custom TradingView strategy',
    defaultParams: { period: 14 },
    timeframe: '15m',
    minCandles: 15,
  };

  compute(input: IndicatorInput): IndicatorOutput {
    const { candles, params } = input;
    // Your logic here...
    return {
      signal: 'buy',      // 'buy' | 'sell' | 'neutral'
      confidence: 0.7,    // 0.0 to 1.0
      values: { myValue: 42 },
    };
  }
}
```

3. Register in the engine (`src/indicators/engine.ts`):

```typescript
import { MyStrategyIndicator } from './custom/my-strategy.js';
// In constructor:
this.register(new MyStrategyIndicator());
```

4. Add to `activeIndicators` in your config to enable it.

## Pine Script Translation Tips

| Pine Script | TypeScript Equivalent |
|-------------|----------------------|
| `ta.rsi(close, 14)` | See `built-in/rsi.ts` |
| `ta.ema(close, 9)` | See `built-in/ema.ts` → `calculateEMA()` |
| `ta.atr(14)` | See `built-in/atr.ts` → `calculateATR()` |
| `ta.macd(close, 12, 26, 9)` | See `built-in/macd.ts` |
| `ta.bb(close, 20, 2)` | See `built-in/bollinger.ts` |
| `ta.supertrend(3, 10)` | See `built-in/supertrend.ts` |
| `ta.crossover(a, b)` | `prev_a <= prev_b && curr_a > curr_b` |
| `ta.crossunder(a, b)` | `prev_a >= prev_b && curr_a < curr_b` |
| `close` | `candles[i].close` |
| `high` | `candles[i].high` |
| `volume` | `candles[i].volume` |
