import { AaveDataSource } from './Aave.js';
import { AaveArbitrumDataSource } from './aaveArbitrum.js';
import { CamelotDexDataSource } from './camelotDex.js';
import { CamelotFarmDataSource } from './camelotFarm.js';
import { CurveDexDataSource } from './curveDex.js';
import { DataSource, DataSourceInfo } from './types.js';
import { VelodromeDexDataSource } from './velodromeDex.js';
import { Uni3DexDataSource } from './univ3Dex.js';
import { SonneDataSource } from './sonne.js';
import { JoesV2DexDataSource } from './joesv2Dex.js';
import { Uni3ArbitrumDataSource } from './univ3Arbitrum.js';

type DataSourceEntry = DataSourceInfo & {
  createSource: (info: DataSourceInfo) => DataSource;
};

// TODO - Temporary solution, this needs to be more generic.
export const DataSourcesRepo: DataSourceEntry[] = [
  {
    chain: 'arbitrum',
    protocol: 'aave',
    resoution: '1h',
    createSource: AaveDataSource.create,
  },
  {
    chain: 'arbitrum',
    protocol: 'uniswap-dex',
    resoution: '1h',
    createSource: Uni3ArbitrumDataSource.create,
  },
  {
    chain: 'optimism',
    protocol: 'aave',
    resoution: '1h',
    createSource: AaveDataSource.create,
  },
  {
    chain: 'arbitrum',
    protocol: 'camelot-farm',
    resoution: '1h',
    createSource: CamelotFarmDataSource.create,
  },
  {
    chain: 'arbitrum',
    protocol: 'camelot-dex',
    resoution: '1m',
    createSource: CamelotDexDataSource.create,
  },
  {
    chain: 'optimism',
    protocol: 'velodrome-dex',
    resoution: '1m',
    createSource: VelodromeDexDataSource.create,
  },
  {
    chain: 'ethereum',
    protocol: 'curve-dex',
    resoution: '1m',
    createSource: CurveDexDataSource.create,
  },
  {
    chain: 'ethereum',
    protocol: 'uniswap-dex',
    resoution: '1h',
    createSource: Uni3DexDataSource.create,
  },
  {
    chain: 'optimism',
    protocol: 'sonne',
    resoution: '1h',
    createSource: SonneDataSource.create,
  },
  {
    chain: 'optimism',
    protocol: 'sonne',
    resoution: '1h',
    createSource: SonneDataSource.create,
  },
  {
    chain: 'avalanche',
    protocol: 'joes-v2-dex',
    resoution: '1h',
    createSource: JoesV2DexDataSource.create,
  },
];
