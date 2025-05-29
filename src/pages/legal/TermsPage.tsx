import React from "react";
import { useTranslation } from "react-i18next";
import { Card, CardContent } from "@/components/ui/card";
import PageHelmet from "@/components/PageHelmet";

const TermsPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageHelmet
        title={t("legal.termsOfService")}
        description="Terms of Service for Allora OS"
      />

      <div className="container py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t("legal.termsOfService")}</h1>

        <Card>
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2>1. Terms</h2>
              <p>
                By accessing Allora OS, you agree to be bound by these terms of
                service and to comply with all applicable laws and regulations.
                If you do not agree with any of these terms, you are prohibited
                from using or accessing this platform.
              </p>

              <h2>2. Use License</h2>
              <p>
                Permission is granted to use Allora OS for your business
                operations subject to the following conditions:
              </p>
              <ul>
                <li>
                  The materials cannot be modified or copied unless explicitly
                  allowed.
                </li>
                <li>
                  The materials cannot be used for commercial purposes outside
                  your organization without proper licensing.
                </li>
                <li>
                  Copyright and other proprietary notices must remain intact.
                </li>
              </ul>

              <h2>3. Disclaimer</h2>
              <p>
                The materials on Allora OS are provided on an 'as is' basis.
                Allora OS makes no warranties, expressed or implied, and hereby
                disclaims all warranties including, without limitation, implied
                warranties of merchantability or fitness for a particular
                purpose.
              </p>

              <h2>4. Limitations</h2>
              <p>
                In no event shall Allora OS or its suppliers be liable for any
                damages arising out of the use or inability to use the materials
                on Allora OS, even if Allora OS has been notified of the
                possibility of such damage.
              </p>

              <h2>5. Revisions</h2>
              <p>
                The materials on Allora OS may include technical or
                typographical errors. Allora OS may make changes to the
                materials at any time without notice.
              </p>

              <h2>6. AI Usage</h2>
              <p>
                Allora OS uses artificial intelligence to automate business
                decisions. By using this platform, you acknowledge and consent
                to the use of AI in your workflow. The AI systems are designed
                to assist and augment human decision-making, not replace it
                entirely.
              </p>

              <h2>7. Data Processing</h2>
              <p>
                When using Allora OS, your data may be processed by our systems
                to provide services. We handle all data in accordance with our
                Privacy Policy and applicable data protection laws.
              </p>

              <h2>8. Governing Law</h2>
              <p>
                These terms shall be governed by and construed in accordance
                with the laws, and you submit to the exclusive jurisdiction of
                the courts in the relevant jurisdiction.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default TermsPage;
