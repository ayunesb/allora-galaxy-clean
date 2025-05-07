
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { Separator } from '@/components/ui/separator';

const Footer: React.FC = () => {
  const { t } = useTranslation();
  const currentYear = new Date().getFullYear();
  
  return (
    <footer className="py-6 md:py-0 bg-background">
      <div className="container flex flex-col items-center justify-between gap-4 md:flex-row">
        <p className="text-sm text-muted-foreground text-center md:text-left">
          &copy; {currentYear} Allora OS. {t('common.allRightsReserved')}
        </p>
        <nav className="flex flex-wrap items-center justify-center gap-4 text-sm">
          <Link to="/terms" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.termsOfService')}
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <Link to="/privacy" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.privacyPolicy')}
          </Link>
          <Separator orientation="vertical" className="h-4" />
          <Link to="/deletion-request" className="text-muted-foreground hover:text-foreground transition-colors">
            {t('nav.deletionRequest')}
          </Link>
        </nav>
      </div>
    </footer>
  );
};

export default Footer;
