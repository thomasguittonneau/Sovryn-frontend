import React, { useMemo } from 'react';
import cn from 'classnames';
import { Dialog } from '../../../../containers/Dialog';
import { useDispatch, useSelector } from 'react-redux';
import { selectMarginTradePage } from '../../selectors';
import { actions } from '../../slice';
import { TradingPairDictionary } from '../../../../../utils/dictionaries/trading-pair-dictionary';
import {
  toNumberFormat,
  weiToNumberFormat,
} from '../../../../../utils/display-text/format';
import { AssetsDictionary } from '../../../../../utils/dictionaries/assets-dictionary';
import { FormGroup } from 'form/FormGroup';
import { TxFeeCalculator } from '../TxFeeCalculator';
import { getLendingContractName } from '../../../../../utils/blockchain/contract-helpers';
import { PricePrediction } from '../../../../containers/MarginTradeForm/PricePrediction';
import { useTrading_resolvePairTokens } from '../../../../hooks/trading/useTrading_resolvePairTokens';
import { LiquidationPrice } from '../LiquidationPrice';
import { useApproveAndTrade } from '../../../../hooks/trading/useApproveAndTrade';
import { DialogButton } from 'form/DialogButton';
import { SendTxProgress } from '../../../../components/SendTxProgress';
import { LoadableValue } from '../../../../components/LoadableValue';
import { fromWei } from '../../../../../utils/blockchain/math-helpers';

export function TradeDialog() {
  const { position, amount, pairType, collateral, leverage } = useSelector(
    selectMarginTradePage,
  );
  const dispatch = useDispatch();

  const pair = useMemo(() => TradingPairDictionary.get(pairType), [pairType]);
  const asset = useMemo(() => AssetsDictionary.get(collateral), [collateral]);

  const {
    loanToken,
    collateralToken,
    useLoanTokens,
  } = useTrading_resolvePairTokens(pair, position, collateral);
  const contractName = getLendingContractName(loanToken);

  const { trade, ...tx } = useApproveAndTrade(
    pair,
    position,
    collateral,
    leverage,
    amount,
  );

  const submit = () => trade();

  return (
    <Dialog
      isOpen={!!position}
      onClose={() => dispatch(actions.closeTradingModal())}
    >
      <div className="tw-mw-320 tw-mx-auto">
        <h1 className="tw-mb-6 tw-text-white tw-text-center">
          Review Transaction
        </h1>
        <LabelValuePair label="Trading Pair:" value={pair.name} />
        <LabelValuePair
          label="Leverage:"
          value={<>{toNumberFormat(leverage)}x</>}
        />
        <LabelValuePair label="Direction:" value={position} />
        <LabelValuePair
          label="Collateral:"
          value={
            <>
              <LoadableValue
                loading={false}
                value={weiToNumberFormat(amount, 4)}
                tooltip={fromWei(amount)}
              />{' '}
              {asset.symbol}
            </>
          }
        />
        <LabelValuePair
          label="Maintenance Margin:"
          value={<>{weiToNumberFormat(15)}%</>}
        />
        <LabelValuePair
          label="Est. Liquidation price:"
          value={
            <>
              <LiquidationPrice
                asset={loanToken}
                assetLong={collateralToken}
                leverage={leverage}
                position={position}
              />{' '}
              USD
            </>
          }
        />
        {/*<LabelValuePair*/}
        {/*  label="Renewal Date:"*/}
        {/*  value={<>{weiToNumberFormat(15)}%</>}*/}
        {/*/>*/}
        <FormGroup label="Approx. Position Entry Price:" className="tw-mt-8">
          <div className="tw-input-wrapper readonly">
            <div className="tw-input">
              <PricePrediction
                position={position}
                leverage={leverage}
                loanToken={loanToken}
                collateralToken={collateralToken}
                useLoanTokens={useLoanTokens}
                weiAmount={amount}
              />
            </div>
            <div className="tw-input-append">USD</div>
          </div>
        </FormGroup>
        <TxFeeCalculator
          args={[]}
          methodName="marginTrade"
          contractName={contractName}
          condition={true}
        />
      </div>

      <SendTxProgress {...tx} displayAbsolute={false} />

      <div className="tw-px-5">
        <DialogButton
          confirmLabel="Confirm"
          onConfirm={() => submit()}
          cancelLabel="Cancel"
          onCancel={() => dispatch(actions.closeTradingModal())}
        />
      </div>
    </Dialog>
  );
}

interface LabelValuePairProps {
  label: React.ReactNode;
  value: React.ReactNode;
  className?: string;
}

function LabelValuePair(props: LabelValuePairProps) {
  return (
    <div
      className={cn(
        'tw-flex tw-flex-row tw-justify-between tw-items-center tw-space-x-4 tw-mb-2',
        props.className,
      )}
    >
      <div className="tw-truncate">{props.label}</div>
      <div className="tw-truncate">{props.value}</div>
    </div>
  );
}
