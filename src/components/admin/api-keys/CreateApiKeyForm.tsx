
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { useApiKeys } from '@/hooks/admin/useApiKeys';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { ApiKeyResponse } from '@/types/api-key';

const formSchema = z.object({
  name: z.string().min(3, { message: 'Name must be at least 3 characters' }),
  scope: z.array(z.string()).min(1, { message: 'At least one scope must be selected' }),
  expires_at: z.date().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface CreateApiKeyFormProps {
  onSuccess?: (response: ApiKeyResponse) => void;
  onCancel?: () => void;
}

const CreateApiKeyForm: React.FC<CreateApiKeyFormProps> = ({ onSuccess, onCancel }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { createApiKey } = useApiKeys();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      scope: ['read'],
      expires_at: undefined,
    },
  });

  const onSubmit = async (values: FormValues) => {
    setIsSubmitting(true);
    try {
      // Convert Date to string if present
      const formattedValues = {
        ...values,
        expires_at: values.expires_at ? values.expires_at.toISOString() : null,
      };
      
      const response = await createApiKey(formattedValues);
      
      if (response && onSuccess) {
        onSuccess(response);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Create API Key</CardTitle>
      </CardHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)}>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My API Key" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Scope</FormLabel>
                  <Select
                    onValueChange={(value) => field.onChange([value])}
                    defaultValue={field.value?.[0]}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="read">Read</SelectItem>
                      <SelectItem value="write">Write</SelectItem>
                      <SelectItem value="admin">Admin</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="expires_at"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Expiration Date (Optional)</FormLabel>
                  <DatePicker
                    date={field.value || null}
                    onDateChange={field.onChange}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" onClick={onCancel} type="button">
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Creating...' : 'Create API Key'}
            </Button>
          </CardFooter>
        </form>
      </Form>
    </Card>
  );
};

export default CreateApiKeyForm;
