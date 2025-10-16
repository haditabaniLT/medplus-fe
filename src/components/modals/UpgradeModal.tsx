import React from 'react';
import { Check, X } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from '../../store';
import { loginSuccess } from '../../store/slices/sessionSlice';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import Button from '../ui/AntButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/Card';
import { Badge } from '../ui/badge';
import { useToast } from '@/hooks/use-toast';

interface UpgradeModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const UpgradeModal: React.FC<UpgradeModalProps> = ({ isOpen, onClose }) => {
  const dispatch = useDispatch();
  const { toast } = useToast();
  const user = useSelector((state: RootState) => state.session.user);

  const handleUpgrade = () => {
    if (user) {
      // Update user plan to PRO
      dispatch(loginSuccess({ ...user, plan: 'PRO' }));

      toast({
        title: "You're now on the Pro plan!",
        description: 'Enjoy unlimited access to all features.',
      });

      onClose();
    }
  };

  const basePlanFeatures = [
    '5 categories',
    '10 tasks per month',
    'Save & export (PDF/Canva)',
    'Profile & goals',
    'Task history & filters',
  ];

  const proPlanFeatures = [
    '12 categories (all categories)',
    'Unlimited tasks',
    'Advanced task editing',
    'Prompt improvement',
    'Gamma export',
    'Brand assets applied to exports',
    'Templates & Prompt Library',
    'Priority support',
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-2xl">Upgrade to Pro</DialogTitle>
          <DialogDescription>
            Unlock unlimited tasks, advanced features, and premium templates
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-6 md:grid-cols-2 mt-4">
          {/* Base Plan */}
          <Card className="border-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Base Plan</CardTitle>
                <Badge variant="outline">Current</Badge>
              </div>
              <CardDescription className="text-2xl font-bold mt-2">
                $0<span className="text-sm font-normal text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="space-y-3">
                {basePlanFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm">{feature}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>

          {/* Pro Plan */}
          <Card className="border-2 border-primary shadow-lg">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Pro Plan</CardTitle>
                <Badge className="bg-gradient-primary">Recommended</Badge>
              </div>
              <CardDescription className="text-2xl font-bold mt-2">
                $5<span className="text-sm font-normal text-muted-foreground">/month</span>
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ul className="space-y-3">
                {proPlanFeatures.map((feature, idx) => (
                  <li key={idx} className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    <span className="text-sm font-medium">{feature}</span>
                  </li>
                ))}
              </ul>

              <Button
                onClick={handleUpgrade}
                className="w-full"
                size="lg"
              >
                Upgrade for $5/month
              </Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground text-center">
            Cancel anytime. No hidden fees. All prices in USD.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default UpgradeModal;
