import React from 'react';
import { RotateCcw, Save, Loader2 } from 'lucide-react';
import { cn } from '../../lib/utils';
import { Button } from '../ui/button';

interface FormattedOutputProps {
  content: string;
  isLoading: boolean;
  onRegenerate: () => void;
  onSave: () => void;
}

const FormattedOutput: React.FC<FormattedOutputProps> = ({
  content,
  isLoading,
  onRegenerate,
  onSave,
}) => {
  // Parse markdown-like content for display
  const parseContent = (text: string) => {
    const lines = text.split('\n');
    const elements: React.ReactNode[] = [];
    let currentSection: string[] = [];
    let currentSectionTitle = '';
    let currentParagraph: string[] = [];

    lines.forEach((line, index) => {
      const trimmedLine = line.trim();
      
      // Check for headings (lines ending with :)
      if (trimmedLine.endsWith(':') && trimmedLine.length < 50 && !trimmedLine.startsWith('-')) {
        // Save previous section
        if (currentSection.length > 0) {
          elements.push(
            <div key={`section-${index}`} className="mb-4">
              <h4 className="font-semibold text-foreground mb-2">{currentSectionTitle}</h4>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                {currentSection.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </div>
          );
          currentSection = [];
        }
        // Save previous paragraph
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`para-${index}`} className="text-muted-foreground mb-3">
              {currentParagraph.join(' ')}
            </p>
          );
          currentParagraph = [];
        }
        currentSectionTitle = trimmedLine.replace(':', '');
      } else if (trimmedLine.startsWith('- ')) {
        // Add to current section
        currentSection.push(trimmedLine.substring(2));
      } else if (trimmedLine.length > 0) {
        // Regular paragraph text
        currentParagraph.push(trimmedLine);
      } else {
        // Empty line - flush current paragraph
        if (currentParagraph.length > 0) {
          elements.push(
            <p key={`para-${index}`} className="text-muted-foreground mb-3">
              {currentParagraph.join(' ')}
            </p>
          );
          currentParagraph = [];
        }
      }
    });

    // Add remaining section
    if (currentSection.length > 0) {
      elements.push(
        <div key="final-section" className="mb-4">
          <h4 className="font-semibold text-foreground mb-2">{currentSectionTitle}</h4>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            {currentSection.map((item, i) => (
              <li key={i}>{item}</li>
            ))}
          </ul>
        </div>
      );
    }

    // Add remaining paragraph
    if (currentParagraph.length > 0) {
      elements.push(
        <p key="final-para" className="text-muted-foreground mb-3">
          {currentParagraph.join(' ')}
        </p>
      );
    }

    return elements.length > 0 ? elements : <p className="text-muted-foreground">{text}</p>;
  };

  if (isLoading) {
    return (
      <div className="bg-card border border-border rounded-lg p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center space-y-4">
            <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto" />
            <p className="text-muted-foreground">Generating your super prompt...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card border border-border rounded-lg p-6 space-y-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xl font-semibold text-foreground">Generated Output</h3>
      </div>

      <div className="prose prose-invert max-w-none">
        <div className="text-foreground space-y-4">
          {content ? parseContent(content) : (
            <p className="text-muted-foreground italic">No content generated yet.</p>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3 pt-4 border-t border-border">
        <Button
          onClick={onRegenerate}
          variant="outline"
          className="flex items-center gap-2"
        >
          <RotateCcw className="h-4 w-4" />
          Regenerate
        </Button>
        <Button
          onClick={onSave}
          className="flex items-center gap-2 bg-primary hover:bg-primary/90"
        >
          <Save className="h-4 w-4" />
          Save Prompt
        </Button>
      </div>
    </div>
  );
};

export default FormattedOutput;

