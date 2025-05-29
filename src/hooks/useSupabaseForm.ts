import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { notifyError, notifySuccess } from "@/lib/notifications/toast";

interface UseSupabaseFormOptions<T extends Record<string, any>> {
  tableName: string;
  mode: "insert" | "update" | "upsert" | "custom";
  idField?: string;
  initialValues?: T;
  showSuccessMessage?: boolean;
  successMessage?: string;
  resetOnSuccess?: boolean;
  onSuccess?: (data: T, result: any) => void;
  onError?: (error: any) => void;
  validationSchema?: any;
  transformer?: (data: T) => any;
  customOperation?: (data: T) => Promise<any>;
}

export const useSupabaseForm = <T extends Record<string, any>>(
  options: UseSupabaseFormOptions<T>,
) => {
  const [isLoading, setIsLoading] = useState(false);
  const [formError, setFormError] = useState<any>(null);
  const [finalData, setFinalData] = useState<T | null>(null);

  const {
    tableName,
    mode,
    idField,
    initialValues,
    showSuccessMessage = true,
    successMessage,
    resetOnSuccess = false,
    onSuccess,
    onError,
    validationSchema,
    transformer,
    customOperation,
  } = options;

  const handleSubmit = async (formData: T) => {
    setIsLoading(true);
    setFormError(null);
    setFinalData(null);

    try {
      if (validationSchema) {
        try {
          await validationSchema.validate(formData, { abortEarly: false });
        } catch (validationError: any) {
          setFormError(validationError);
          setIsLoading(false);
          return { error: validationError, success: false };
        }
      }

      // Apply transformations if specified
      const processedData = transformer ? transformer(formData) : formData;

      let result;

      if (mode === "insert") {
        result = await supabase.from(tableName).insert(processedData).select();
      } else if (mode === "update") {
        if (!idField || !formData[idField]) {
          throw new Error(
            `ID field "${idField}" is not defined or has no value`,
          );
        }
        result = await supabase
          .from(tableName)
          .update(processedData)
          .eq(idField, formData[idField])
          .select();
      } else if (mode === "upsert") {
        result = await supabase.from(tableName).upsert(processedData).select();
      } else if (mode === "custom" && customOperation) {
        result = await customOperation(processedData);
      } else {
        throw new Error(
          "Invalid operation mode or missing customOperation function",
        );
      }

      if (result.error) {
        throw result.error;
      }

      const resultData = result.data;
      setFinalData(resultData);

      if (onSuccess) {
        onSuccess(processedData, resultData);
      }

      if (showSuccessMessage) {
        notifySuccess({
          title: successMessage || "Success",
          description: `${tableName} ${mode === "insert" ? "created" : "updated"} successfully`,
        });
      }

      return { data: resultData, success: true };
    } catch (error: any) {
      console.error(`Error ${mode}ing ${tableName}:`, error);
      setFormError(error);

      if (onError) {
        onError(error);
      }

      notifyError({
        title: "Error",
        description: error.message || `Failed to ${mode} ${tableName}`,
      });

      return { error, success: false };
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    formError,
    handleSubmit,
    finalData,
  };
};

export default useSupabaseForm;
