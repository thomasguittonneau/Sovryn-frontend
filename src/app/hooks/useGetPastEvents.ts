import { useCallback, useEffect, useRef, useState } from 'react';
import { EventData, Contract } from 'web3-eth-contract';
import { getWeb3Contract } from '../../utils/blockchain/contract-helpers';

// todo move to .env and config to make reusable
const OLDEST_BLOCK = 1125558;

/**
 * @param contract
 * @param event
 */
export function useGetPastEvents(
  contract: { abi: any; address: string },
  event: string = 'allEvents',
) {
  const web3ContractRef = useRef<Contract>(null as any);
  const [events, setEvents] = useState<EventData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<any>(null);

  useEffect(() => {
    web3ContractRef.current = getWeb3Contract(contract.address, contract.abi);
  }, [contract]);

  const fetch = useCallback(
    (
      filter = undefined,
      options = { fromBlock: OLDEST_BLOCK, toBlock: 'latest' },
    ) => {
      web3ContractRef.current
        .getPastEvents(event, { ...options, ...{ filter } })
        .then(data => {
          setEvents(data as any);
          setLoading(false);
        })
        .catch(e => {
          setLoading(false);
          setError(e);
        });
    },
    [event],
  );

  return { events, fetch: fetch, loading, error };
}
