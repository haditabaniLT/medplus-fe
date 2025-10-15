import React, { useState, useRef, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { OnboardingStepProps } from '../../../types';
import { FONT_OPTIONS, MAX_FILE_SIZE, ALLOWED_IMAGE_TYPES } from '../../../constants/onboarding';
import Dropdown from '../../ui/Dropdown';
import TextInput from '../../ui/TextInput';
import Button from '../../ui/AntButton';
import { Upload, X, Lock, Star } from 'lucide-react';
import { RootState, AppDispatch } from '../../../store';
import { uploadBrandLogoAsync, updateOnboardingStepAsync } from '../../../store/slices/onboardingSlice';

const BrandSetupStep: React.FC<OnboardingStepProps> = ({
  data,
  onUpdate,
  onNext,
  onBack,
}) => {
  const dispatch: AppDispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.session);
  const [dragActive, setDragActive] = useState(false);
  const [logoError, setLogoError] = useState('');
  const [showColorHelper, setShowColorHelper] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Mock user plan - in real app this would come from user state
  const userPlan = Math.random() > 0.5 ? 'pro' : 'base'; // Demo: random plan
  const isPro = userPlan === 'pro';

  // Auto-save disabled as per user request
  // useEffect(() => { ... }, [data.primaryColor, data.secondaryColor, data.font, user?.id, dispatch]);

  const handleLogoUpload = async (file: File) => {
    setLogoError('');
    
    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setLogoError('Please upload a PNG or SVG file');
      return;
    }
    
    if (file.size > MAX_FILE_SIZE) {
      setLogoError('File size must be less than 2MB');
      return;
    }
    
    if (!user?.id) {
      setLogoError('User not authenticated');
      return;
    }

    setIsUploading(true);
    try {
      const result = await dispatch(uploadBrandLogoAsync({ userId: user.id, file }));
      if (uploadBrandLogoAsync.fulfilled.match(result)) {
        onUpdate({ logo: file }); // Keep local file for preview
        // The logo URL is automatically saved to Redux state
      } else {
        setLogoError('Failed to upload logo');
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      setLogoError('Failed to upload logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    const file = e.dataTransfer.files[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleLogoUpload(file);
    }
  };

  const removeLogo = () => {
    onUpdate({ logo: null });
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleColorChange = (field: 'primaryColor' | 'secondaryColor', value: string) => {
    onUpdate({ [field]: value });
  };

  const handleFontChange = (value: string | number) => {
    onUpdate({ font: value as string });
  };

  const getContrastRatio = (color1: string, color2: string) => {
    // Simplified contrast calculation - in real app use proper contrast library
    return 'Good'; // Mock return
  };

  const renderLockedContent = () => (
    <div className="space-y-6 opacity-60">
      <div className="relative">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm rounded-lg z-10 flex items-center justify-center">
          <div className="text-center space-y-3">
            <Lock className="h-12 w-12 text-muted-foreground mx-auto" />
            <div>
              <h3 className="font-semibold text-foreground">Pro Feature</h3>
              <p className="text-sm text-muted-foreground">Unlock brand customization</p>
            </div>
            <Button variant="primary" className="gap-2">
              <Star className="h-4 w-4" />
              Upgrade to Pro
            </Button>
          </div>
        </div>
        
        {/* Preview content */}
        <div className="space-y-6 p-6 border border-border rounded-lg">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Company Logo
            </label>
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">Upload your logo</p>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Primary Color
              </label>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-primary rounded border" />
                <input 
                  type="text" 
                  value="#8b5cf6" 
                  disabled
                  className="flex-1 px-3 py-2 border border-border rounded bg-muted"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-foreground mb-2">
                Secondary Color
              </label>
              <div className="flex gap-2">
                <div className="w-10 h-10 bg-secondary rounded border" />
                <input 
                  type="text" 
                  value="#6b7280" 
                  disabled
                  className="flex-1 px-3 py-2 border border-border rounded bg-muted"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  if (!isPro) {
    return (
      <div className="space-y-6">
        <div>
          <h2 className="text-2xl font-semibold text-foreground mb-2">
            Brand Setup
          </h2>
          <p className="text-muted-foreground mb-6">
            Customize your brand appearance with Pro features
          </p>
        </div>

        {renderLockedContent()}

        <div className="flex justify-between">
          <Button onClick={onBack} variant="outline" className="px-8">
            Back
          </Button>
          <Button onClick={onNext} className="px-8">
            Skip for now
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-semibold text-foreground mb-2">
          Brand Setup
        </h2>
        <p className="text-muted-foreground mb-6">
          Customize your brand appearance
        </p>
      </div>

      <div className="space-y-6">
        {/* Logo Upload */}
        <div>
          <label className="block text-sm font-medium text-foreground mb-2">
            Company Logo
          </label>
          
          {data.logo ? (
            <div className="relative inline-block">
              <div className="w-32 h-32 border border-border rounded-lg p-4 bg-background flex items-center justify-center">
                <img
                  src={URL.createObjectURL(data.logo)}
                  alt="Logo preview"
                  className="max-w-full max-h-full object-contain"
                />
              </div>
              <button
                onClick={removeLogo}
                className="absolute -top-2 -right-2 bg-destructive text-destructive-foreground rounded-full p-1 hover:bg-destructive/90"
              >
                <X className="h-3 w-3" />
              </button>
            </div>
          ) : (
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
                dragActive ? 'border-primary bg-primary/5' : 'border-border'
              } ${isUploading ? 'opacity-50 cursor-not-allowed' : ''}`}
              onDragEnter={() => !isUploading && setDragActive(true)}
              onDragLeave={() => setDragActive(false)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={handleDrop}
              onClick={() => !isUploading && fileInputRef.current?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-foreground font-medium">
                {isUploading ? 'Uploading...' : 'Click to upload or drag and drop'}
              </p>
              <p className="text-sm text-muted-foreground">PNG or SVG up to 2MB</p>
            </div>
          )}
          
          <input
            ref={fileInputRef}
            type="file"
            accept=".png,.svg"
            onChange={handleFileSelect}
            className="hidden"
          />
          
          {logoError && (
            <p className="text-sm text-destructive mt-1">{logoError}</p>
          )}
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Primary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={data.primaryColor || '#8b5cf6'}
                onChange={(e) => handleColorChange('primaryColor', e.target.value)}
                className="w-10 h-10 border border-border rounded cursor-pointer"
              />
              <TextInput
                value={data.primaryColor || '#8b5cf6'}
                onChange={(value) => handleColorChange('primaryColor', value)}
                placeholder="#8b5cf6"
                className="flex-1"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              Secondary Color
            </label>
            <div className="flex gap-2">
              <input
                type="color"
                value={data.secondaryColor || '#6b7280'}
                onChange={(e) => handleColorChange('secondaryColor', e.target.value)}
                className="w-10 h-10 border border-border rounded cursor-pointer"
              />
              <TextInput
                value={data.secondaryColor || '#6b7280'}
                onChange={(value) => handleColorChange('secondaryColor', value)}
                placeholder="#6b7280"
                className="flex-1"
              />
            </div>
          </div>
        </div>

        {/* Contrast Helper */}
        {data.primaryColor && data.secondaryColor && (
          <div className="bg-muted p-3 rounded-lg">
            <p className="text-sm text-muted-foreground">
              Contrast ratio: <span className="font-medium">Good</span> ✓
            </p>
          </div>
        )}

        {/* Font Selector */}
        <div>
          <Dropdown
            label="Brand Font"
            options={FONT_OPTIONS}
            value={data.font}
            onChange={handleFontChange}
            placeholder="Select a font..."
            className="max-w-md"
          />
          
          {data.font === 'custom' && (
            <div className="mt-2">
              <TextInput
                placeholder="Enter custom font name (e.g., 'MyFont', serif)"
                value={data.customFont || ''}
                onChange={(value) => onUpdate({ customFont: value })}
              />
            </div>
          )}
        </div>
      </div>

      <div className="flex justify-between">
        <Button onClick={onBack} variant="outline" className="px-8">
          Back
        </Button>
        <Button onClick={onNext} className="px-8">
          Next
        </Button>
      </div>
    </div>
  );
};

export default BrandSetupStep;