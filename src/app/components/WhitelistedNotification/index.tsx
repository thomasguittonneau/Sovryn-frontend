import React from 'react';
import { Icon } from '@blueprintjs/core/lib/esm/components/icon/icon';
import { Trans } from 'react-i18next';
import { translations } from 'locales/i18n';
import { useIsWhitelisted } from '../../hooks/whitelist/useIsWhitelisted';

export function WhitelistedNotification() {
  const isWhitelisted = useIsWhitelisted();

  if (isWhitelisted) return <></>;

  return (
    <div className="container mt-6 mb-4">
      <div className="bg-info sovryn-border rounded p-3 d-flex flex-row justify-content-start align-items-center">
        <div className="ml-3 mr-4">
          <Icon icon="warning-sign" iconSize={26} />
        </div>
        <div>
          <Trans
            i18nKey={translations.whiteListedNotification.text}
            components={[
              <a
                href="https://wiki.sovryn.app/"
                className="font-weight-light text-gold"
                target="_blank"
                rel="noreferrer noopener"
              >
                x
              </a>,
            ]}
          />
        </div>
      </div>
    </div>
  );
}
