import { ILogAny } from "../../../lib/utils/influx2x.js";
import { InfluxBatcher } from '../../../lib/utils/influxBatcher.js';

export const Log = new InfluxBatcher<ILogAny, any, any>(
  'hedged_univ3_strategy',
);
export const Rebalance = new InfluxBatcher<ILogAny, any, any>(
  'hedged_univ3_rebalance',
);
export const Summary = new InfluxBatcher<ILogAny, any, any>(
  'hedged_univ3_summary',
);
