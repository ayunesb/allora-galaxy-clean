
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import LanguageSelector from '@/components/settings/LanguageSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHelmet from '@/components/PageHelmet';
import Footer from '@/components/layout/Footer';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isSaving, setIsSaving] = useState(false);
  const [selectedLanguage, setSelectedLanguage] = useState<string>(
    localStorage.getItem('preferred_language') || 'en'
  );

  const handleLanguageChange = (language: string) => {
    setSelectedLanguage(language);
  };

  const saveSettings = async () => {
    if (!user) return;
    
    setIsSaving(true);
    try {
      // Save language preference to user profile
      const { error } = await supabase
        .from('profiles')
        .upsert({
          id: user.id,
          preferred_language: selectedLanguage,
        })
        .select();

      if (error) throw error;
      
      toast({
        title: t('settings.changesSaved'),
        duration: 3000,
      });
    } catch (error) {
      console.error('Error saving settings:', error);
      toast({
        title: 'Error saving settings',
        variant: 'destructive',
        duration: 3000,
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <>
      <PageHelmet
        title={`${t('settings.title')} | Allora OS`}
        description="User settings and preferences"
      />
      
      <div className="container py-8">
        <h1 className="text-3xl font-bold mb-6">{t('settings.title')}</h1>
        
        <div className="grid gap-6">
          {/* Language Settings */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.language')}</CardTitle>
              <CardDescription>Choose your preferred language for the application</CardDescription>
            </CardHeader>
            <CardContent>
              <LanguageSelector onChange={handleLanguageChange} />
            </CardContent>
            <CardFooter>
              <Button onClick={saveSettings} disabled={isSaving}>
                {isSaving ? t('common.loading') : t('settings.saveChanges')}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Cookie Preferences */}
          <Card>
            <CardHeader>
              <CardTitle>{t('cookies.title')}</CardTitle>
              <CardDescription>Manage how we use cookies on this site</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Control which cookies are used when you browse our application. 
                Functional cookies are always enabled as they're necessary for the site to work.
              </p>
            </CardContent>
            <CardFooter>
              <Button variant="secondary" onClick={() => window.dispatchEvent(new Event('open-cookie-preferences'))}>
                {t('cookies.managePreferences')}
              </Button>
            </CardFooter>
          </Card>
          
          {/* Data Management Options */}
          <Card>
            <CardHeader>
              <CardTitle>{t('settings.dataManagement')}</CardTitle>
              <CardDescription>Manage your personal data</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h3 className="text-lg font-medium mb-1">{t('legal.dataExport.title')}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{t('legal.dataExport.description')}</p>
                  <Button variant="outline" onClick={() => 
                    toast({
                      title: t('legal.dataExport.success'),
                    })
                  }>
                    {t('legal.dataExport.submit')}
                  </Button>
                </div>
                
                <Separator />
                
                <div>
                  <h3 className="text-lg font-medium mb-1">{t('legal.dataDeletion.title')}</h3>
                  <p className="text-sm text-muted-foreground mb-2">{t('legal.dataDeletion.description')}</p>
                  <Button 
                    variant="destructive"
                    onClick={() => navigate('/deletion-request')}
                  >
                    {t('legal.dataDeletion.submit')}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      <Footer />
    </>
  );
};

export default SettingsPage;
