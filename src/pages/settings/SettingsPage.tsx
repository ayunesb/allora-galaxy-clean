
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/hooks/use-toast';
import LanguageSelector from '@/components/settings/LanguageSelector';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import PageHelmet from '@/components/PageHelmet';

const SettingsPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
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
        
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
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
        </div>
      </div>
    </>
  );
};

export default SettingsPage;
