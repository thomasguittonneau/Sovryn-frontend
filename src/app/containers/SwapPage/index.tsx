/**
 *
 * SwapPage
 *
 */

import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

import { translations } from 'locales/i18n';

import { Header } from '../../components/Header';
import { SkeletonRow } from '../../components/Skeleton/SkeletonRow';
import { useAccount } from '../../hooks/useAccount';
import { SwapFormContainer } from '../SwapFormContainer';
import { SwapHistory } from '../SwapHistory';

interface Props {}

export function SwapPage(props: Props) {
  const { t } = useTranslation();
  const account = useAccount();

  useEffect(() => {
    const bodyElement = document.getElementsByTagName('body')[0];
    bodyElement.style.background = '#161616';
  }, []);

  return (
    <>
      <Helmet>
        <title>{t(translations.swap.title)}</title>
        <meta name="description" content={t(translations.swap.meta)} />
      </Helmet>
      <Header />
      <div className="tw-container swap-page">
        <div>
          <SwapFormContainer />
        </div>
        <div>
          <div className="swap-history-table-container">
            {!account ? (
              <SkeletonRow
                loadingText={t(translations.topUpHistory.walletHistory)}
                className="tw-mt-2"
              />
            ) : (
              <SwapHistory />
            )}
          </div>
        </div>
      </div>
    </>
  );
}
