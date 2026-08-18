"use client";

import { useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import { X, Upload, Sparkles, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

interface ScoreDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ScoreDialog({ open, onOpenChange }: ScoreDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [analyzing, setAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) {
      toast.error("Please upload a resume (PDF/DOCX) first");
      return;
    }
    setAnalyzing(true);
    setTimeout(() => {
      setAnalyzing(false);
      onOpenChange(false);
      toast.success("Resume analyzed! Score: 87/100. Check your live dashboard.");
    }, 2000);
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <Dialog.Content className="fixed left-[50%] top-[50%] z-50 grid w-full max-w-lg translate-x-[-50%] translate-y-[-50%] gap-4 border border-white/10 glass-strong p-6 shadow-2xl duration-200 rounded-3xl text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-[#00D9C0]" />
              <Dialog.Title className="font-display text-lg font-bold">
                Get Free Employability Score
              </Dialog.Title>
            </div>
            <Dialog.Close className="rounded-full p-1 hover:bg-white/10 transition-colors">
              <X className="h-5 w-5 text-[#8A90A6]" />
            </Dialog.Close>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4 pt-2">
            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8A90A6] mb-2 font-semibold">
                Upload Resume (PDF / DOCX)
              </label>
              <div className="border-2 border-dashed border-white/20 hover:border-[#00D9C0] transition-colors rounded-2xl p-6 text-center cursor-pointer relative bg-white/5">
                <input
                  type="file"
                  accept=".pdf,.docx,.doc"
                  className="absolute inset-0 opacity-0 cursor-pointer"
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                <Upload className="mx-auto h-8 w-8 text-[#00D9C0] mb-2" />
                {file ? (
                  <p className="text-sm font-semibold text-white flex items-center justify-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-[#00D9C0]" />
                    {file.name}
                  </p>
                ) : (
                  <div>
                    <p className="text-sm text-white font-medium">Click or drag resume here</p>
                    <p className="text-xs text-[#8A90A6] mt-1">Supports PDF, DOCX up to 10MB</p>
                  </div>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs uppercase tracking-wider text-[#8A90A6] mb-1 font-semibold">
                Target Role (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. Full Stack Engineer, AI Developer"
                className="w-full h-11 rounded-xl bg-white/5 border border-white/10 px-4 text-sm text-white focus:outline-none focus:border-[#00D9C0]"
              />
            </div>

            <Button
              type="submit"
              disabled={analyzing}
              className="w-full h-12 rounded-full bg-[#3D5AFE] hover:bg-[#3D5AFE]/90 font-bold text-white mt-4 cursor-pointer"
            >
              {analyzing ? "Analyzing Resume & Market Data..." : "Calculate Employability Score"}
            </Button>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
