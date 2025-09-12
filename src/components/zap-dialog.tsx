"use client";

import { useState } from "react";
import { Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { toast } from "sonner";
import type { ThemeConfig } from "@/app/_constants/theme";
import { applyThemeClasses } from "@/app/_constants/theme";

interface ZapDialogProps {
  lightningAddress: string;
  recipientPubkey: string;
  theme: ThemeConfig;
  onZap: (
    amount: number,
    lightningAddress: string,
    recipientPubkey: string,
  ) => Promise<void>;
}

const PREDEFINED_AMOUNTS = [
  { label: "21 sats", value: 21 },
  { label: "100 sats", value: 100 },
  { label: "500 sats", value: 500 },
  { label: "1000 sats", value: 1000 },
  { label: "2100 sats", value: 2100 },
];

export function ZapDialog({
  lightningAddress,
  recipientPubkey,
  theme,
  onZap,
}: ZapDialogProps) {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>("");
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount);
    setCustomAmount("");
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    setSelectedAmount(null);
  };

  const getFinalAmount = (): number | null => {
    if (selectedAmount !== null) {
      return selectedAmount;
    }
    if (customAmount.trim()) {
      const parsed = parseInt(customAmount.trim(), 10);
      return isNaN(parsed) || parsed <= 0 ? null : parsed;
    }
    return null;
  };

  const handleZap = async () => {
    const amount = getFinalAmount();

    if (!amount) {
      toast.error("Please select or enter a zap amount");
      return;
    }

    if (amount < 1) {
      toast.error("Zap amount must be at least 1 sat");
      return;
    }

    if (amount > 1000000) {
      toast.error("Zap amount cannot exceed 1,000,000 sats");
      return;
    }

    setIsLoading(true);

    try {
      await onZap(amount, lightningAddress, recipientPubkey);
      setIsOpen(false);
      setSelectedAmount(null);
      setCustomAmount("");
    } catch (error) {
      console.error("Zap error:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const buttonClasses = applyThemeClasses(theme, "button");
  const dialogClasses = applyThemeClasses(theme, "dialog");
  const textColor = theme.textColor;
  const mutedColor = theme.mutedColor;
  const accentColor = theme.accentColor;
  const borderColor = theme.borderColor;

  return (
    <div className="flex justify-center">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button
            className={`inline-flex items-center gap-2 px-6 py-3 font-semibold transition-all ${buttonClasses}`}
          >
            <Zap className="h-4 w-4" />
            <span>Zap</span>
          </Button>
        </DialogTrigger>
        <DialogContent className={`${dialogClasses} ${textColor}`}>
          <DialogHeader>
            <DialogTitle
              className={`${theme.headingFont} ${theme.headingColor}`}
            >
              Send a Zap
            </DialogTitle>
            <DialogDescription className={mutedColor}>
              Choose a predefined amount or enter a custom amount in sats
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <h4 className={`text-sm font-medium ${textColor}`}>
                Quick amounts
              </h4>
              <div className="grid grid-cols-2 gap-2">
                {PREDEFINED_AMOUNTS.map((amount) => (
                  <Button
                    key={amount.value}
                    variant={
                      selectedAmount === amount.value ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => handleAmountSelect(amount.value)}
                    className={`${
                      selectedAmount === amount.value
                        ? buttonClasses
                        : `border ${borderColor} bg-transparent ${mutedColor} hover:${accentColor} hover:bg-${mutedColor}`
                    }`}
                  >
                    {amount.label}
                  </Button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <h4 className={`text-sm font-medium ${textColor}`}>
                Custom amount
              </h4>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  placeholder="Enter amount in sats"
                  value={customAmount}
                  onChange={(e) => handleCustomAmountChange(e.target.value)}
                  min="1"
                  max="1000000"
                  className={`${textColor} ${borderColor} focus:${accentColor}`}
                />
                <span className={`text-sm ${mutedColor}`}>sats</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsOpen(false)}
              className={`border bg-transparent ${borderColor} ${mutedColor} hover:${mutedColor} hover:bg-${borderColor}`}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleZap}
              disabled={!getFinalAmount() || isLoading}
              className={`${buttonClasses} ${isLoading ? "opacity-50" : ""}`}
            >
              {isLoading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  <span>Sending...</span>
                </>
              ) : (
                <>
                  <Zap className="h-4 w-4" />
                  <span>Send Zap</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
