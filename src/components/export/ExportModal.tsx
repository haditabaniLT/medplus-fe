import React, { useState } from 'react';
import { 
  Download, 
  FileText, 
  Image, 
  Presentation,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ExternalLink,
  Zap
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import Button  from '../ui/AntButton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Label } from '../ui/label';
import { Switch } from '../ui/switch';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Card } from '../ui/Card';
import { Badge } from '../ui/badge';
import { Alert, AlertDescription } from '../ui/alert';
import { useToast } from '../../hooks/use-toast';
import { Separator } from '../ui/separator';

interface Task {
  id: string;
  title: string;
  category: string;
  summary: string;
  steps: string[];
  content: string;
  createdAt: string;
  updatedAt: string;
  wordCount: number;
  sourceLanguage: string;
  tone: string;
}

interface ExportModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  task: Task;
  userPlan: 'base' | 'pro';
}

const ExportModal: React.FC<ExportModalProps> = ({ open, onOpenChange, task, userPlan }) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('pdf');
  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState<string | null>(null);
  
  // PDF Options
  const [pdfIncludeTitle, setPdfIncludeTitle] = useState(true);
  const [pdfIncludeMetadata, setPdfIncludeMetadata] = useState(true);
  const [pdfPageNumbers, setPdfPageNumbers] = useState(true);
  const [pdfPaperSize, setPdfPaperSize] = useState('letter');
  const [pdfMargins, setPdfMargins] = useState('normal');
  const [pdfIncludeBrand, setPdfIncludeBrand] = useState(false);

  // Canva Options
  const [canvaIncludeTitle, setCanvaIncludeTitle] = useState(true);
  const [canvaIncludeMetadata, setCanvaIncludeMetadata] = useState(true);
  const [canvaIncludeBrand, setCanvaIncludeBrand] = useState(false);
  const [canvaConnected, setCanvaConnected] = useState(false);

  // Gamma Options
  const [gammaTheme, setGammaTheme] = useState('modern');
  const [gammaLogo, setGammaLogo] = useState(true);
  const [gammaAccentColor, setGammaAccentColor] = useState('#8b5cf6');
  const [gammaCtaSlide, setGammaCtaSlide] = useState(true);
  const [gammaAgendaSlide, setGammaAgendaSlide] = useState(true);
  const [gammaIncludeBrand, setGammaIncludeBrand] = useState(false);
  const [gammaConnected, setGammaConnected] = useState(false);

  const estimatedPages = Math.ceil(task.wordCount / 250);

  const handlePdfExport = async () => {
    setIsExporting(true);
    setExportError(null);

    try {
      // Simulate PDF generation
      await new Promise(resolve => setTimeout(resolve, 2000));

      if (estimatedPages > 25) {
        toast({
          title: 'Large document',
          description: `This document has ${estimatedPages} pages and may take longer to export.`,
          variant: 'default',
        });
      }

      // Mock PDF export
      console.log('Exporting PDF with options:', {
        includeTitle: pdfIncludeTitle,
        includeMetadata: pdfIncludeMetadata,
        pageNumbers: pdfPageNumbers,
        paperSize: pdfPaperSize,
        margins: pdfMargins,
        includeBrand: pdfIncludeBrand,
      });

      toast({
        title: 'PDF exported',
        description: 'Your task has been exported as a PDF successfully.',
      });

      onOpenChange(false);
    } catch (error) {
      setExportError('Failed to export PDF. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleCanvaConnect = () => {
    // Mock OAuth popup
    const popup = window.open('', 'canva-oauth', 'width=600,height=700');
    
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      toast({
        title: 'Popup blocked',
        description: 'Please allow popups for this site to connect to Canva.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate OAuth flow
    setTimeout(() => {
      popup.close();
      setCanvaConnected(true);
      toast({
        title: 'Connected to Canva',
        description: 'You can now export tasks to Canva.',
      });
    }, 2000);
  };

  const handleCanvaExport = async () => {
    if (!canvaConnected) {
      handleCanvaConnect();
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 1500));

      console.log('Exporting to Canva with options:', {
        includeTitle: canvaIncludeTitle,
        includeMetadata: canvaIncludeMetadata,
        includeBrand: canvaIncludeBrand,
      });

      toast({
        title: 'Sent to Canva',
        description: 'Your task has been sent to Canva successfully.',
      });

      onOpenChange(false);
    } catch (error) {
      setExportError('Failed to export to Canva. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleGammaConnect = () => {
    if (userPlan === 'base') {
      toast({
        title: 'Upgrade required',
        description: 'Gamma export is available on Pro plan.',
        variant: 'destructive',
      });
      return;
    }

    // Mock OAuth popup
    const popup = window.open('', 'gamma-oauth', 'width=600,height=700');
    
    if (!popup || popup.closed || typeof popup.closed === 'undefined') {
      toast({
        title: 'Popup blocked',
        description: 'Please allow popups for this site to connect to Gamma.',
        variant: 'destructive',
      });
      return;
    }

    // Simulate OAuth flow
    setTimeout(() => {
      popup.close();
      setGammaConnected(true);
      toast({
        title: 'Connected to Gamma',
        description: 'You can now export tasks to Gamma.',
      });
    }, 2000);
  };

  const handleGammaExport = async () => {
    if (userPlan === 'base') {
      toast({
        title: 'Upgrade required',
        description: 'Gamma export is available on Pro plan.',
        variant: 'destructive',
      });
      return;
    }

    if (!gammaConnected) {
      handleGammaConnect();
      return;
    }

    setIsExporting(true);
    setExportError(null);

    try {
      await new Promise(resolve => setTimeout(resolve, 2000));

      console.log('Exporting to Gamma with options:', {
        theme: gammaTheme,
        logo: gammaLogo,
        accentColor: gammaAccentColor,
        ctaSlide: gammaCtaSlide,
        agendaSlide: gammaAgendaSlide,
        includeBrand: gammaIncludeBrand,
      });

      const deckUrl = `https://gamma.app/decks/${Math.random().toString(36).substr(2, 9)}`;
      
      toast({
        title: 'Gamma deck created',
        description: (
          <div className="flex items-center gap-2">
            <span>Your deck is ready!</span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => window.open(deckUrl, '_blank')}
            >
              Open Gamma deck
              <ExternalLink className="h-3 w-3 ml-1" />
            </Button>
          </div>
        ),
      });

      onOpenChange(false);
    } catch (error) {
      setExportError('Failed to export to Gamma. Please try again.');
    } finally {
      setIsExporting(false);
    }
  };

  const handleExport = () => {
    switch (activeTab) {
      case 'pdf':
        handlePdfExport();
        break;
      case 'canva':
        handleCanvaExport();
        break;
      case 'gamma':
        handleGammaExport();
        break;
    }
  };

  const handleRetry = () => {
    setExportError(null);
    handleExport();
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Export Task</DialogTitle>
          <DialogDescription>
            Choose a format and configure export options for "{task.title}"
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pdf" className="gap-2">
              <FileText className="h-4 w-4" />
              PDF
            </TabsTrigger>
            <TabsTrigger value="canva" className="gap-2">
              <Image className="h-4 w-4" />
              Canva
            </TabsTrigger>
            <TabsTrigger value="gamma" className="gap-2 relative">
              <Presentation className="h-4 w-4" />
              Gamma
              {userPlan === 'base' && <Badge variant="secondary" className="ml-1 text-[10px]">Pro</Badge>}
            </TabsTrigger>
          </TabsList>

          {/* PDF Tab */}
          <TabsContent value="pdf" className="space-y-4 mt-4">
            {/* Preview */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-center h-32 bg-background rounded border-2 border-dashed border-border">
                <div className="text-center">
                  <FileText className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">PDF Preview</p>
                  <p className="text-xs text-muted-foreground">~{estimatedPages} pages</p>
                </div>
              </div>
            </Card>

            <Separator />

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="pdf-title">Include title</Label>
                <Switch
                  id="pdf-title"
                  checked={pdfIncludeTitle}
                  onCheckedChange={setPdfIncludeTitle}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pdf-metadata">Include metadata</Label>
                <Switch
                  id="pdf-metadata"
                  checked={pdfIncludeMetadata}
                  onCheckedChange={setPdfIncludeMetadata}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="pdf-numbers">Page numbers</Label>
                <Switch
                  id="pdf-numbers"
                  checked={pdfPageNumbers}
                  onCheckedChange={setPdfPageNumbers}
                />
              </div>

              <div className="space-y-2">
                <Label>Paper size</Label>
                <RadioGroup value={pdfPaperSize} onValueChange={setPdfPaperSize}>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="letter" id="letter" />
                    <Label htmlFor="letter" className="font-normal">Letter (8.5" × 11")</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="a4" id="a4" />
                    <Label htmlFor="a4" className="font-normal">A4 (210mm × 297mm)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-2">
                <Label htmlFor="margins">Margins</Label>
                <Select value={pdfMargins} onValueChange={setPdfMargins}>
                  <SelectTrigger id="margins">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="narrow">Narrow (0.5")</SelectItem>
                    <SelectItem value="normal">Normal (1")</SelectItem>
                    <SelectItem value="wide">Wide (1.5")</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="pdf-brand">Include brand</Label>
                  {userPlan === 'base' && <Badge variant="secondary" className="text-[10px]">Pro</Badge>}
                </div>
                <Switch
                  id="pdf-brand"
                  checked={pdfIncludeBrand}
                  onCheckedChange={setPdfIncludeBrand}
                  disabled={userPlan === 'base'}
                />
              </div>
            </div>
          </TabsContent>

          {/* Canva Tab */}
          <TabsContent value="canva" className="space-y-4 mt-4">
            {/* Preview */}
            <Card className="p-4 bg-muted/50">
              <div className="flex items-center justify-center h-32 bg-background rounded border-2 border-dashed border-border">
                <div className="text-center">
                  <Image className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                  <p className="text-sm text-muted-foreground">Canva Design Preview</p>
                </div>
              </div>
            </Card>

            <Separator />

            {/* Connection Status */}
            {!canvaConnected && (
              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Connect your Canva account to export</span>
                  <Button size="sm" onClick={handleCanvaConnect}>
                    Connect Account
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {canvaConnected && (
              <Alert>
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                <AlertDescription>
                  Connected to Canva
                </AlertDescription>
              </Alert>
            )}

            {/* Options */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="canva-title">Include title</Label>
                <Switch
                  id="canva-title"
                  checked={canvaIncludeTitle}
                  onCheckedChange={setCanvaIncludeTitle}
                />
              </div>

              <div className="flex items-center justify-between">
                <Label htmlFor="canva-metadata">Include metadata</Label>
                <Switch
                  id="canva-metadata"
                  checked={canvaIncludeMetadata}
                  onCheckedChange={setCanvaIncludeMetadata}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Label htmlFor="canva-brand">Include brand</Label>
                  {userPlan === 'base' && <Badge variant="secondary" className="text-[10px]">Pro</Badge>}
                </div>
                <Switch
                  id="canva-brand"
                  checked={canvaIncludeBrand}
                  onCheckedChange={setCanvaIncludeBrand}
                  disabled={userPlan === 'base'}
                />
              </div>
            </div>
          </TabsContent>

          {/* Gamma Tab */}
          <TabsContent value="gamma" className="space-y-4 mt-4">
            {userPlan === 'base' ? (
              <Alert>
                <Zap className="h-4 w-4" />
                <AlertDescription className="flex items-center justify-between">
                  <span>Gamma export is available on Pro plan</span>
                  <Button size="sm" className="bg-gradient-primary">
                    <Zap className="h-3.5 w-3.5 mr-2" />
                    Upgrade to Pro
                  </Button>
                </AlertDescription>
              </Alert>
            ) : (
              <>
                {/* Preview */}
                <Card className="p-4 bg-muted/50">
                  <div className="flex items-center justify-center h-32 bg-background rounded border-2 border-dashed border-border">
                    <div className="text-center">
                      <Presentation className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">Gamma Deck Preview</p>
                    </div>
                  </div>
                </Card>

                <Separator />

                {/* Connection Status */}
                {!gammaConnected && (
                  <Alert>
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription className="flex items-center justify-between">
                      <span>Connect your Gamma account to export</span>
                      <Button size="sm" onClick={handleGammaConnect}>
                        Connect Account
                      </Button>
                    </AlertDescription>
                  </Alert>
                )}

                {gammaConnected && (
                  <Alert>
                    <CheckCircle2 className="h-4 w-4 text-green-500" />
                    <AlertDescription>
                      Connected to Gamma
                    </AlertDescription>
                  </Alert>
                )}

                {/* Options */}
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="gamma-theme">Theme</Label>
                    <Select value={gammaTheme} onValueChange={setGammaTheme}>
                      <SelectTrigger id="gamma-theme">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="modern">Modern</SelectItem>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="bold">Bold</SelectItem>
                        <SelectItem value="classic">Classic</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="gamma-logo">Include logo</Label>
                    <Switch
                      id="gamma-logo"
                      checked={gammaLogo}
                      onCheckedChange={setGammaLogo}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="gamma-accent">Accent color</Label>
                    <div className="flex items-center gap-2">
                      <input
                        type="color"
                        id="gamma-accent"
                        value={gammaAccentColor}
                        onChange={(e) => setGammaAccentColor(e.target.value)}
                        className="h-10 w-20 rounded border cursor-pointer"
                      />
                      <span className="text-sm text-muted-foreground">{gammaAccentColor}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="gamma-cta">CTA slide</Label>
                    <Switch
                      id="gamma-cta"
                      checked={gammaCtaSlide}
                      onCheckedChange={setGammaCtaSlide}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="gamma-agenda">Agenda slide</Label>
                    <Switch
                      id="gamma-agenda"
                      checked={gammaAgendaSlide}
                      onCheckedChange={setGammaAgendaSlide}
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <Label htmlFor="gamma-brand">Include brand</Label>
                    <Switch
                      id="gamma-brand"
                      checked={gammaIncludeBrand}
                      onCheckedChange={setGammaIncludeBrand}
                    />
                  </div>
                </div>
              </>
            )}
          </TabsContent>
        </Tabs>

        {/* Error Display */}
        {exportError && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{exportError}</span>
              <Button size="sm" variant="outline" onClick={handleRetry}>
                Retry
              </Button>
            </AlertDescription>
          </Alert>
        )}

        {/* Actions */}
        <div className="flex items-center justify-end gap-2 pt-4">
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isExporting}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting || (activeTab === 'gamma' && userPlan === 'base')}>
            {isExporting ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Exporting...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Export
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default ExportModal;
