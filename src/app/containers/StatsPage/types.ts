export type TradingVolumeData = {
  total: {
    btc: {
      allTime: number;
      twentyFourHours: number;
    };
    usd: {
      allTime: number;
      twentyFourHours: number;
    };
  };
};

export type TvlData = {
  tvlLending: {
    btc_total: number;
    usd_total: number;
    bpro_total: number;
  };
  tvlAmm: {
    btc_total: number;
    usd_total: number;
    bpro_total: number;
  };
  tvlProtocol: {
    btc_total: number;
    usd_total: number;
    bpro_total: number;
  };
  btc_doc_rate: number;
  bpro_doc_rate: number;
  bpro_btc_rate: number;
  total_btc: number;
  total_usd: number;
};

export type TvlContract = 'tvlProtocol' | 'tvlAmm' | 'tvlLending';

export type AmmBalanceRow = {
  ammPool: string;
  ammRateBtc: number;
  ammRateToken: number;
  btcDelta: number;
  contractBalanceBtc: number;
  contractBalanceToken: number;
  oracleBtcPrice: number;
  oracleRateBtc: number;
  oracleRateToken: number;
  stakedBalanceBtc: number;
  stakedBalanceToken: number;
  tokenDelta: number;
};
