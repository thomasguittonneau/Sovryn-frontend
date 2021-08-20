import React, { useCallback, useMemo, useEffect, useState } from 'react';
import axios from 'axios';
import { useTranslation } from 'react-i18next';

import { AssetDetails } from 'utils/models/asset-details';
import { backendUrl, currentChainId } from 'utils/classifiers';
import { AssetsDictionary } from 'utils/dictionaries/assets-dictionary';
import { getContractNameByAddress } from 'utils/blockchain/contract-helpers';
import { Pagination } from '../../components/Pagination';
import { useAccount } from '../../hooks/useAccount';
import { SkeletonRow } from '../../components/Skeleton/SkeletonRow';
import { translations } from '../../../locales/i18n';
import { useSelector } from 'react-redux';
import { selectTransactionArray } from 'store/global/transactions-store/selectors';
import { TxStatus, TxType } from 'store/global/transactions-store/types';
import { getOrder } from 'app/pages/SpotTradingPage/types';
import { useTradeHistoryRetry } from 'app/hooks/useTradeHistoryRetry';
import { AssetRow } from './AssetRow';

export const SpotHistory: React.FC = () => {
  const transactions = useSelector(selectTransactionArray);
  const account = useAccount();
  const url = backendUrl[currentChainId];
  const [history, setHistory] = useState([]) as any;
  const [currentHistory, setCurrentHistory] = useState([]) as any;
  const [loading, setLoading] = useState(false);
  const { t } = useTranslation();
  const assets = AssetsDictionary.list();
  const retry = useTradeHistoryRetry();

  let cancelTokenSource;
  const getData = () => {
    if (cancelTokenSource) {
      cancelTokenSource.cancel();
    }

    cancelTokenSource = axios.CancelToken.source();
    axios
      .get(`${url}/events/conversion-swap/${account}`, {
        cancelToken: cancelTokenSource.token,
      })
      .then(res => {
        setHistory(
          res.data
            .sort(
              (a, b) =>
                new Date(b.timestamp).getTime() -
                new Date(a.timestamp).getTime(),
            )
            .map(item => {
              const { assetFrom, assetTo } = extractAssets(
                item.from_token,
                item.to_token,
              );
              const order = getOrder(assetFrom.asset, assetTo.asset);
              if (!order) return null;

              return {
                assetFrom,
                assetTo,
                order,
                item,
              };
            })
            .filter(item => item),
        );
        setLoading(false);
      })
      .catch(e => {
        console.log(e);
        setHistory([]);
        setCurrentHistory([]);
        setLoading(false);
      });
  };

  const getHistory = useCallback(() => {
    setLoading(true);
    setHistory([]);
    setCurrentHistory([]);

    getData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [account, setHistory, url, setCurrentHistory]);

  //GET HISTORY
  useEffect(() => {
    if (account) {
      getHistory();
    }
  }, [account, getHistory, setCurrentHistory, retry]);

  const onPageChanged = data => {
    const { currentPage, pageLimit } = data;
    const offset = (currentPage - 1) * pageLimit;
    setCurrentHistory(history.slice(offset, offset + pageLimit));
  };

  const onGoingTransactions = useMemo(() => {
    return transactions
      .filter(
        tx =>
          tx.type === TxType.CONVERT_BY_PATH &&
          [TxStatus.FAILED, TxStatus.PENDING].includes(tx.status),
      )
      .map(item => {
        const { customData } = item;

        const assetFrom = assets.find(
          currency => currency.asset === customData?.sourceToken,
        );
        const assetTo = assets.find(
          currency => currency.asset === customData?.targetToken,
        );

        const data = {
          status: item.status,
          timestamp: customData?.date,
          transaction_hash: item.transactionHash,
          returnVal: {
            _fromAmount: customData?.amount,
            _toAmount: customData?.minReturn || null,
          },
        };

        return (
          <AssetRow
            key={item.transactionHash}
            data={data}
            itemFrom={assetFrom!}
            itemTo={assetTo!}
          />
        );
      });
  }, [assets, transactions]);

  return (
    <section>
      <div className="sovryn-table p-3 mb-5">
        <table className="w-100">
          <thead>
            <tr>
              <th className="d-none d-lg-table-cell">
                {t(translations.spotHistory.tableHeaders.time)}
              </th>
              <th className="d-none d-lg-table-cell">
                {t(translations.spotHistory.tableHeaders.pair)}
              </th>
              <th>{t(translations.spotHistory.tableHeaders.orderType)}</th>
              <th>{t(translations.spotHistory.tableHeaders.amountPaid)}</th>
              <th className="d-none d-lg-table-cell">
                {t(translations.spotHistory.tableHeaders.amountReceived)}
              </th>
              <th>{t(translations.spotHistory.tableHeaders.status)}</th>
            </tr>
          </thead>
          <tbody className="mt-5">
            {loading && (
              <tr key={'loading'}>
                <td colSpan={99}>
                  <SkeletonRow
                    loadingText={t(translations.topUpHistory.loading)}
                  />
                </td>
              </tr>
            )}
            {history.length === 0 && !loading && (
              <tr key={'empty'}>
                <td className="text-center" colSpan={99}>
                  {t(translations.spotHistory.emptyState)}
                </td>
              </tr>
            )}
            {onGoingTransactions}
            {currentHistory.map(({ item, assetFrom, assetTo }) => {
              return (
                <AssetRow
                  key={item.transaction_hash}
                  data={item}
                  itemFrom={assetFrom}
                  itemTo={assetTo}
                />
              );
            })}
          </tbody>
        </table>
        {history.length > 0 && (
          <Pagination
            totalRecords={history.length}
            pageLimit={6}
            pageNeighbours={1}
            onChange={onPageChanged}
          />
        )}
      </div>
    </section>
  );
};

const extractAssets = (fromToken, toToken) => {
  const assets = AssetsDictionary.list();

  let assetFrom = {} as AssetDetails;
  let assetTo = {} as AssetDetails;

  assets.map(currency => {
    if (getContractNameByAddress(fromToken)?.includes(currency.asset)) {
      assetFrom = currency;
    }
    if (getContractNameByAddress(toToken)?.includes(currency.asset)) {
      assetTo = currency;
    }
    return null;
  });

  return {
    assetFrom,
    assetTo,
  };
};
