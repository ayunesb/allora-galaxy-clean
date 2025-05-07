
import React from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent } from '@/components/ui/card';
import PageHelmet from '@/components/PageHelmet';

const PrivacyPage: React.FC = () => {
  const { t } = useTranslation();

  return (
    <>
      <PageHelmet
        title={t('legal.privacyPolicy')}
        description="Privacy Policy for Allora OS"
      />
      
      <div className="container py-8 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('legal.privacyPolicy')}</h1>
        
        <Card>
          <CardContent className="pt-6">
            <div className="prose dark:prose-invert max-w-none">
              <h2>1. Data Collection</h2>
              <p>
                Allora OS collects several types of information for various purposes to provide and improve our service to you:
              </p>
              <ul>
                <li>Personal Data: Email address, name, company information</li>
                <li>Usage Data: How you interact with our platform</li>
                <li>Cookies and Tracking Data: For analytics and service improvement</li>
              </ul>
              
              <h2>2. Use of Data</h2>
              <p>
                Allora OS uses the collected data for various purposes:
              </p>
              <ul>
                <li>To provide and maintain our service</li>
                <li>To notify you about changes to our service</li>
                <li>To provide customer support</li>
                <li>To gather analysis or valuable information so that we can improve our service</li>
                <li>To monitor the usage of our service</li>
              </ul>
              
              <h2>3. Cookies Policy</h2>
              <p>
                We use cookies and similar tracking technologies to track activity on our service and hold certain information.
              </p>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our service.
              </p>
              <p>
                Examples of Cookies we use:
              </p>
              <ul>
                <li>Functional Cookies: To recognize you and remember your preferences on our website.</li>
                <li>Analytics Cookies: To understand how you use our website, which helps us improve our services.</li>
                <li>Marketing Cookies: To deliver advertisements that may be relevant to you and your interests.</li>
              </ul>
              
              <h2>4. Data Security</h2>
              <p>
                The security of your data is important to us, but remember that no method of transmission over
                the Internet, or method of electronic storage is 100% secure.
              </p>
              
              <h2>5. Your Data Protection Rights</h2>
              <p>
                Allora OS aims to ensure you are fully aware of all your data protection rights:
              </p>
              <ul>
                <li>Right to access your personal data</li>
                <li>Right to rectification of inaccurate personal data</li>
                <li>Right to erasure (right to be forgotten)</li>
                <li>Right to restriction of processing</li>
                <li>Right to data portability</li>
                <li>Right to object to processing of personal data</li>
              </ul>
              
              <h2>6. AI and Automated Processing</h2>
              <p>
                Allora OS utilizes artificial intelligence and automated processing to enhance our services. 
                The AI systems process your data to provide insights, automate workflows, and improve user experience.
                You have the right to:
              </p>
              <ul>
                <li>Request human intervention in decisions made solely by automated means</li>
                <li>Express your point of view regarding automated decisions</li>
                <li>Contest automated decisions that significantly affect you</li>
              </ul>
              
              <h2>7. Changes to This Privacy Policy</h2>
              <p>
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting
                the new Privacy Policy on this page and updating the "effective date" at the top of this page.
              </p>
              
              <h2>8. Contact Us</h2>
              <p>
                If you have any questions about this Privacy Policy, please contact us at privacy@alloraos.com.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
};

export default PrivacyPage;
