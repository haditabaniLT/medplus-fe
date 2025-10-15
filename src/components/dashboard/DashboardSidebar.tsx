import React from 'react';
import { 
  GraduationCap,
  Clock,
  Briefcase,
  Megaphone,
  Heart,
  Cpu,
  Palette as PaletteIcon,
  DollarSign,
  TrendingUp,
  Users as UsersIcon,
  History,
  Crown,
  HelpCircle,
  Lock
} from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { cn } from '../../lib/utils';
import Button from '../ui/AntButton';
import { ScrollArea } from '../ui/scroll-area';
import { Separator } from '../ui/separator';
import { CATEGORIES, canAccessCategory } from '../../constants/categories';
import { TaskCategory } from '../../types/task.types';
import { setActiveCategory } from '../../store/slices/uiSlice';

interface SidebarProps {
  isOpen: boolean;
  isCollapsed: boolean;
  userPlan: 'base' | 'pro';
  onUpgrade?: () => void;
}

const DashboardSidebar: React.FC<SidebarProps> = ({ isOpen, isCollapsed, userPlan, onUpgrade }) => {
  const dispatch = useDispatch();
  const navigate = useNavigate();

  // Map categories to icons
  const categoryIcons: Record<string, any> = {
    "Decision Mastery": GraduationCap,
    "Influence Builder": Megaphone,
    "Team Ignition": UsersIcon,
    "Wealth Navigator": DollarSign,
    "Innovation Scout": Cpu,
    "Mindset Recharge": Heart,
    "Network Catalyst": TrendingUp,
    "Business Driver": Briefcase,
    "Meeting Matters": Clock,
    "Customer Central": UsersIcon,
    "Play Time": PaletteIcon,
    "Other/Custom": Briefcase,
  };

  const taskCategories = CATEGORIES.map(cat => ({
    name: cat,
    icon: categoryIcons[cat] || Briefcase,
    category: cat as TaskCategory,
    isLocked: !canAccessCategory(cat, userPlan),
  }));

  const secondaryLinks = [
    { name: 'Task History', icon: History, href: '/tasks' },
    { name: 'Templates', icon: Crown, href: '/templates', pro: true },
    { name: 'Help', icon: HelpCircle, href: '/help', locked: true },
  ];

  const handleCategoryClick = (category: TaskCategory, isLocked: boolean) => {
    if (isLocked && onUpgrade) {
      onUpgrade();
      return;
    }
    dispatch(setActiveCategory(category));
    navigate('/dashboard');
  };

  const CategoryItem = ({ item }: { item: any }) => {
    return (
      <button
        onClick={() => handleCategoryClick(item.category, item.isLocked)}
        className={cn(
          'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent group w-full text-left',
          'text-muted-foreground hover:text-foreground',
          item.isLocked && 'opacity-60',
          isCollapsed && 'justify-center px-2'
        )}
      >
        <item.icon className={cn('h-4 w-4 shrink-0', isCollapsed && 'h-5 w-5')} />
        {!isCollapsed && (
          <>
            <span className="truncate">{item.name}</span>
            {item.isLocked && <Lock className="h-3 w-3 ml-auto" />}
          </>
        )}
        {isCollapsed && item.isLocked && (
          <Lock className="absolute -top-1 -right-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </button>
    );
  };

  const NavItem = ({ item, isSecondary = false }: { item: any; isSecondary?: boolean }) => {
    const isLocked = item.locked || (item.pro && userPlan === 'base');
    
    return (
      <NavLink
        to={isLocked ? '#' : item.href}
        className={({ isActive }) =>
          cn(
            'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all hover:bg-accent group',
            isActive && !isLocked ? 'bg-accent text-accent-foreground' : 'text-muted-foreground hover:text-foreground',
            isLocked && 'cursor-not-allowed opacity-60',
            isCollapsed && 'justify-center px-2',
            isSecondary && 'text-xs'
          )
        }
        onClick={(e) => isLocked && e.preventDefault()}
      >
        <item.icon className={cn('h-4 w-4 shrink-0', isCollapsed && 'h-5 w-5')} />
        {!isCollapsed && (
          <>
            <span className="truncate">{item.name}</span>
            {isLocked && <Lock className="h-3 w-3 ml-auto" />}
          </>
        )}
        {isCollapsed && isLocked && (
          <Lock className="absolute -top-1 -right-1 h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity" />
        )}
      </NavLink>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm tablet:hidden desktop:hidden"
          onClick={() => {}} // This would close the sidebar on mobile
        />
      )}
      
      {/* Sidebar */}
      <aside className={cn(
        'fixed left-0 top-16 z-50 h-[calc(100vh-4rem)] border-r border-border bg-background transition-all duration-300',
        isCollapsed ? 'w-16' : 'w-80',
        'tablet:relative tablet:top-0 tablet:h-full',
        'desktop:relative desktop:top-0 desktop:h-full',
        !isOpen && 'translate-x-[-100%] tablet:translate-x-0 desktop:translate-x-0'
      )}>
        <ScrollArea className="h-full">
          <div className="py-6 px-3 space-y-4">
            {/* Task Categories */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h2 className="mb-2 px-3 text-lg font-semibold tracking-tight text-foreground">
                  Categories
                </h2>
              )}
              <nav className="space-y-1">
                {taskCategories.map((item) => (
                  <CategoryItem key={item.name} item={item} />
                ))}
              </nav>
            </div>

            <Separator />

            {/* Secondary Links */}
            <div className="space-y-2">
              {!isCollapsed && (
                <h2 className="mb-2 px-3 text-lg font-semibold tracking-tight text-foreground">
                  More
                </h2>
              )}
              <nav className="space-y-1">
                {secondaryLinks.map((item) => (
                  <NavItem key={item.name} item={item} isSecondary />
                ))}
              </nav>
            </div>

            {/* Upgrade Banner for Base Users - Only show if user is on base plan */}
            {userPlan === 'base' && !isCollapsed && onUpgrade && (
              <div className="mx-3 mt-6">
                <div className="rounded-lg bg-gradient-primary p-4 text-primary-foreground">
                  <div className="space-y-2">
                    <h3 className="font-medium">Upgrade to Pro</h3>
                    <p className="text-xs opacity-90">
                      Unlock all features and get unlimited access.
                    </p>
                    <Button size="sm" variant="secondary" className="w-full" onClick={onUpgrade}>
                      Upgrade Now
                    </Button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </ScrollArea>
      </aside>
    </>
  );
};

export default DashboardSidebar;