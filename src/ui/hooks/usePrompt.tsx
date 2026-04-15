import { useState, useCallback } from 'react';
import { PromptDialog } from '../pages/PromptDialog';

interface PromptOptions {
  title?: string;
  defaultValue?: string;
  validator?: (value: string) => boolean | string;
}

export const usePrompt = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [error, setError] = useState<string>('');
  const [promptConfig, setPromptConfig] = useState<{
    message: string;
    resolve: (value: string | null) => void;
    defaultValue?: string;
    title?: string;
    validator?: (value: string) => boolean | string;
  } | null>(null);

  const prompt = useCallback((
    message: string,
    options: PromptOptions = {}
  ): Promise<string | null> => {
    return new Promise((resolve) => {
      setPromptConfig({
        message,
        resolve,
        defaultValue: options.defaultValue,
        title: options.title || 'Input Required',
        validator: options.validator,
      });
      setIsOpen(true);
      setError('');
    });
  }, []);

  const handleConfirm = useCallback((value: string) => {
    if (promptConfig?.validator) {
      const validationResult = promptConfig.validator(value);
      if (validationResult !== true) {
        setError(validationResult ? validationResult : 'Invalid input');
        return;
      }
    }

    if (promptConfig) {
      promptConfig.resolve(value);
      setIsOpen(false);
      setPromptConfig(null);
      setError('');
    }
  }, [promptConfig]);

  const handleCancel = useCallback(() => {
    if (promptConfig) {
      promptConfig.resolve(null);
      setIsOpen(false);
      setPromptConfig(null);
      setError('');
    }
  }, [promptConfig]);

  const PromptComponent = useCallback(() => {
    if (!promptConfig) return null;

    return (
      <PromptDialog
        isOpen={isOpen}
        title={promptConfig.title || 'Input Required'}
        message={promptConfig.message}
        defaultValue={promptConfig.defaultValue}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        error={error}
      />
    );
  }, [isOpen, promptConfig, handleConfirm, handleCancel, error]);

  return { prompt, PromptComponent };
};
