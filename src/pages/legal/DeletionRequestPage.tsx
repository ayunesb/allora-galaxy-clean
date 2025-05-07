
import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAuth } from '@/context/AuthContext';
import { useWorkspace } from '@/context/WorkspaceContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import PageHelmet from '@/components/PageHelmet';

const DeletionRequestPage: React.FC = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const { currentTenant } = useWorkspace();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [reason, setReason] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  
  const handleConfirmSubmit = async () => {
    if (!user || !currentTenant) return;
    
    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('deletion_requests')
        .insert({
          user_id: user.id,
          tenant_id: currentTenant.id,
          reason,
          status: 'pending',
          created_at: new Date().toISOString(),
        });
      
      if (error) throw error;
      
      toast({
        title: t('legal.dataDeletion.success'),
      });
      
      navigate('/settings'); // Redirect to settings after submission
    } catch (error) {
      console.error('Error submitting deletion request:', error);
      toast({
        title: t('legal.dataDeletion.error'),
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
      setShowConfirmDialog(false);
    }
  };
  
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setShowConfirmDialog(true);
  };
  
  return (
    <>
      <PageHelmet
        title={t('legal.dataDeletion.title')}
        description="Request deletion of your personal data"
      />
      
      <div className="container py-8 max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">{t('legal.dataDeletion.title')}</h1>
        
        <Card>
          <CardHeader>
            <CardTitle>{t('legal.dataDeletion.title')}</CardTitle>
            <CardDescription>
              {t('legal.dataDeletion.description')}
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              <div className="space-y-4">
                <div className="space-y-2">
                  <label htmlFor="reason" className="block text-sm font-medium">
                    {t('legal.dataDeletion.reason')}
                  </label>
                  <Textarea
                    id="reason"
                    placeholder={t('legal.dataDeletion.placeholderReason')}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    rows={5}
                    className="w-full"
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => navigate('/settings')}
              >
                {t('common.cancel')}
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? t('common.loading') : t('legal.dataDeletion.submit')}
              </Button>
            </CardFooter>
          </form>
        </Card>
      </div>
      
      {/* Confirmation Dialog */}
      <AlertDialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('legal.dataDeletion.title')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('legal.dataDeletion.confirmation')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{t('common.cancel')}</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSubmit}>
              {t('legal.dataDeletion.submit')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

export default DeletionRequestPage;
