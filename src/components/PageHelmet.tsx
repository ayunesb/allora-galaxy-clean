
import React from 'react';
import { Helmet } from 'react-helmet-async';

interface PageHelmetProps {
  title: string;
  description?: string;
  noIndex?: boolean;
}

const PageHelmet: React.FC<PageHelmetProps> = ({
  title,
  description,
  noIndex = false,
}) => {
  const appName = 'Allora OS';
  const fullTitle = `${title} | ${appName}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      {description && <meta name="description" content={description} />}
      {noIndex && <meta name="robots" content="noindex,nofollow" />}
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:title" content={fullTitle} />
      {description && <meta property="og:description" content={description} />}
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      {description && <meta name="twitter:description" content={description} />}

      {/* Canonical URL - should be set on a per-page basis when necessary */}
      {/* <link rel="canonical" href="https://example.com/page" /> */}
    </Helmet>
  );
};

export default PageHelmet;
