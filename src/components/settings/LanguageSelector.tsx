import React from "react";
import { useTranslation } from "react-i18next";
import { languages, changeLanguage } from "@/lib/i18n";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Label } from "@/components/ui/label";

interface LanguageSelectorProps {
  onChange?: (language: string) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({ onChange }) => {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = (value: string) => {
    changeLanguage(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="language-select">{t("settings.language")}</Label>
      <Select value={i18n.language} onValueChange={handleLanguageChange}>
        <SelectTrigger id="language-select" className="w-full">
          <SelectValue placeholder={t("settings.language")} />
        </SelectTrigger>
        <SelectContent>
          {languages.map((lang) => (
            <SelectItem key={lang.code} value={lang.code}>
              {lang.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default LanguageSelector;
