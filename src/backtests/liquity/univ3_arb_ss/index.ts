import { Backtest } from '../../../lib/backtest.js';
import { DataSourceInfo } from '../../../lib/datasource/types.js';
import { HedgedUniswapStrategyRunner } from './strategyRunner.js';


const main = async () => {
  const USDCWETH = '0xC31E54c7a869B9FcBEcc14363CF510d1c41fa443';
  const sources: DataSourceInfo[] = [
    {
      chain: 'arbitrum',
      protocol: 'uniswap-dex',
      resoution: '1h',
      config: {
        pairs: [USDCWETH],
      },
    },
  ];

  const bt = await Backtest.create(
    new Date('2023-01-01'),
    // new Date('2023-01-05'),
    new Date(), // Now
    sources,
  );

  // Configure Strategy
  const strategy = new HedgedUniswapStrategyRunner();
  bt.onBefore(strategy.before.bind(strategy));
  bt.onData(strategy.onData.bind(strategy));
  bt.onAfter(strategy.after.bind(strategy));

  // Run
  await bt.run();
};

main();
