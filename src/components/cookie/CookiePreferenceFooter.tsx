
import React from 'react';
import { useTranslation } from 'react-i18next';
import { DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';

interface CookiePreferenceFooterProps {
  loading: boolean;
  onRejectAll: () => void;
  onSaveCustom: () => void;
  onAcceptAll: () => void;
}

const CookiePreferenceFooter: React.FC<CookiePreferenceFooterProps> = ({
  loading,
  onRejectAll,
  onSaveCustom,
  onAcceptAll
}) => {
  const { t } = useTranslation();

  return (
    <DialogFooter className="flex flex-col-reverse sm:flex-row sm:justify-between sm:space-x-2">
      <Button
        type="button"
        variant="outline"
        onClick={onRejectAll}
        disabled={loading}
      >
        {t('cookies.rejectAll')}
      </Button>
      <div className="flex flex-col space-y-2 sm:flex-row sm:space-y-0 sm:space-x-2">
        <Button
          type="button"
          variant="secondary"
          onClick={onSaveCustom}
          disabled={loading}
        >
          {t('cookies.saveCustom')}
        </Button>
        <Button
          type="button"
          onClick={onAcceptAll}
          disabled={loading}
        >
          {t('cookies.acceptAll')}
        </Button>
      </div>
    </DialogFooter>
  );
};

export default CookiePreferenceFooter;
