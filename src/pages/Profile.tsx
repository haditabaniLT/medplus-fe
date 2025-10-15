import React, { useState, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "../store";
import { updateUserProfile } from "../store/slices/sessionSlice";
import { getUserProfile, updateUserProfile as updateSupabaseProfile } from "@/supabase/auth";
import DashboardLayout from "../components/layout/DashboardLayout";
import { Button } from "../components/ui/Button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Textarea } from "../components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/Card";
import { Avatar, AvatarFallback } from "../components/ui/avatar";
import { Badge } from "../components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, X, Upload, CheckCircle2, Lock, Crown, Palette } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select";
import { Alert, AlertDescription } from "../components/ui/alert";

const Profile = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state: RootState) => state.session);
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Profile data
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [bio, setBio] = useState("");
  const [goals, setGoals] = useState<string[]>([]);
  const [newGoal, setNewGoal] = useState("");

  // Brand data (Pro only)
  const [brandLogo, setBrandLogo] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#1ABC9C");
  const [secondaryColor, setSecondaryColor] = useState("#0B1D3A");
  const [brandFont, setBrandFont] = useState("Inter");

  const userPlan = (user?.plan?.toLowerCase() || "base") as "base" | "pro";
  const bioLimit = 280;
  const bioRemaining = bioLimit - bio.length;
  const isEmailVerified = true; // Would check actual verification status

  console.log("LOADING", loading);

  useEffect(() => {
    console.log("=======LOADING PROFILE USE=EFFECT=======");
    loadProfile();
  }, []);

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault();
        e.returnValue = "";
      }
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [hasUnsavedChanges]);

  const loadProfile = async () => {
    setLoading(true);
    try {
      console.log("=======LOADING PROFILE=======");
      
      if (!user?.id) {
        setLoading(false);
        return;
      }

      // Fetch user profile data from Supabase
      const profileData = await getUserProfile(user.id);

      if (profileData) {
        setFullName(profileData.full_name || "");
        setEmail(profileData.email || user.email || "");
        setRole(profileData.role || "user");
        setBio(profileData.bio || "");
        setGoals(Array.isArray(profileData.goals) ? profileData.goals : []);
        setBrandLogo(profileData.brand_logo_url || "");
        setPrimaryColor(profileData.brand_primary_color || "#1ABC9C");
        setSecondaryColor(profileData.brand_secondary_color || "#0B1D3A");
        setBrandFont(profileData.brand_font || "Inter");
      } else {
        // Fallback to Redux user data if profile fetch fails
        setFullName(user.fullName || "");
        setEmail(user.email || "");
        setRole(user.role || "user");
        setBio("");
        setGoals([]);
        setBrandLogo("");
        setPrimaryColor("#1ABC9C");
        setSecondaryColor("#0B1D3A");
        setBrandFont("Inter");
      }
    } catch (error) {
      console.error("Error loading profile:", error);
      toast({
        title: "Error",
        description: "Failed to load profile data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    // Database calls removed - Supabase implementation removed
    // Replace with your database client calls
    const authUser = { id: user?.id }; // Use real user data
    if (!authUser?.id) return;

    // Validation
    if (!fullName.trim()) {
      toast({
        title: "Validation Error",
        description: "Name cannot be empty",
        variant: "destructive",
      });
      return;
    }

    if (bio.length > bioLimit) {
      toast({
        title: "Validation Error",
        description: `Bio cannot exceed ${bioLimit} characters`,
        variant: "destructive",
      });
      return;
    }

    setLoading(true);

    try {
      const profileData = {
        fullName,
        bio,
        goals,
        industry: "", // Add industry field if needed
        seniority: "", // Add seniority field if needed
        brandLogo,
        primaryColor,
        secondaryColor,
        brandFont,
        preferences: {}, // Add preferences if needed
        integrations: {} // Add integrations if needed
      };

      // Update profile in Supabase
      await updateSupabaseProfile(user.id, profileData);

      // Update Redux state to reflect changes across the app
      dispatch(updateUserProfile({
        full_name: fullName,
        email: email,
        role: role,
      }));

      setHasUnsavedChanges(false);
      toast({
        title: "Success",
        description: "Profile updated successfully",
      });
    } catch (error) {
      console.error("Error saving profile:", error);
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const addGoal = () => {
    if (newGoal.trim() && !goals.includes(newGoal.trim())) {
      setGoals([...goals, newGoal.trim()]);
      setNewGoal("");
      setHasUnsavedChanges(true);
    }
  };

  const removeGoal = (index: number) => {
    setGoals(goals.filter((_, i) => i !== index));
    setHasUnsavedChanges(true);
  };

  const getContrastRatio = (color1: string, color2: string) => {
    // Simplified contrast calculation
    return 5.5; // Would implement actual WCAG contrast calculation
  };

  const contrastWarning = getContrastRatio(primaryColor, secondaryColor) < 4.5;

  return (
    <DashboardLayout>
      {loading ? (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-headline font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground mt-1">Loading your profile...</p>
            </div>
          </div>
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-6 w-48 bg-muted animate-pulse rounded" />
                <div className="h-4 w-64 bg-muted animate-pulse rounded mt-2" />
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="h-10 bg-muted animate-pulse rounded" />
                  <div className="h-10 bg-muted animate-pulse rounded" />
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="p-6 max-w-5xl mx-auto space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-headline font-bold text-foreground">Profile</h1>
              <p className="text-muted-foreground mt-1">Manage your personal information and preferences</p>
            </div>
            <Button onClick={handleSave} disabled={loading || !hasUnsavedChanges} className="bg-gradient-primary">
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </div>

          {/* Identity Section */}
          <Card>
            <CardHeader>
              <CardTitle>Identity</CardTitle>
              <CardDescription>Your basic profile information</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center gap-6">
                <Avatar className="h-24 w-24">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {fullName?.charAt(0) || "U"}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="fullName">Full Name *</Label>
                      <Input
                        id="fullName"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          setHasUnsavedChanges(true);
                        }}
                        placeholder="Enter your full name"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <div className="relative">
                        <Input id="email" value={email} disabled className="pr-10" />
                        {isEmailVerified && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-success" />}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="role">Role</Label>
                    <Select
                      value={role}
                      onValueChange={(value) => {
                        setRole(value);
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select your role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Manager">Manager</SelectItem>
                        <SelectItem value="Analyst">Analyst</SelectItem>
                        <SelectItem value="Director">Director</SelectItem>
                        <SelectItem value="Executive">Executive</SelectItem>
                        <SelectItem value="Consultant">Consultant</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Goals & Bio Section */}
          <Card>
            <CardHeader>
              <CardTitle>Goals & Bio</CardTitle>
              <CardDescription>Share your professional goals and a brief bio</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Goals</Label>
                <div className="flex gap-2">
                  <Input
                    value={newGoal}
                    onChange={(e) => setNewGoal(e.target.value)}
                    placeholder="Add a new goal"
                    onKeyPress={(e) => e.key === "Enter" && addGoal()}
                  />
                  <Button onClick={addGoal} size="icon">
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2 mt-2">
                  {goals.map((goal, index) => (
                    <Badge key={index} variant="secondary" className="gap-1">
                      {goal}
                      <button onClick={() => removeGoal(index)} className="ml-1 hover:text-destructive">
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="bio">Bio</Label>
                  <span className={`text-sm ${bioRemaining < 0 ? "text-destructive" : "text-muted-foreground"}`}>
                    {bioRemaining} characters remaining
                  </span>
                </div>
                <Textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => {
                    setBio(e.target.value);
                    setHasUnsavedChanges(true);
                  }}
                  placeholder="Tell us about yourself..."
                  rows={4}
                  maxLength={bioLimit}
                />
              </div>
            </CardContent>
          </Card>

          {/* Brand Section (Pro Only) */}
          <Card className={userPlan === "base" ? "opacity-60" : ""}>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <Palette className="h-5 w-5" />
                    Brand Customization
                    {userPlan === "pro" && <Crown className="h-4 w-4 text-primary" />}
                  </CardTitle>
                  <CardDescription>Customize your brand appearance for exports and presentations</CardDescription>
                </div>
                {userPlan === "base" && (
                  <Badge variant="secondary">
                    <Lock className="h-3 w-3 mr-1" />
                    Pro Only
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              {userPlan === "base" ? (
                <div className="text-center py-8 space-y-4">
                  <Lock className="h-12 w-12 mx-auto text-muted-foreground" />
                  <p className="text-muted-foreground">
                    Upgrade to Pro to customize your brand and apply it to all exports
                  </p>
                  <Button className="bg-gradient-primary">
                    <Crown className="mr-2 h-4 w-4" />
                    Upgrade to Pro
                  </Button>
                </div>
              ) : (
                <>
                  <div className="space-y-2">
                    <Label>Brand Logo</Label>
                    <div className="flex items-center gap-4">
                      {brandLogo && (
                        <div className="h-16 w-16 rounded border border-border bg-muted flex items-center justify-center">
                          <img src={brandLogo} alt="Brand logo" className="max-h-full max-w-full" />
                        </div>
                      )}
                      <div className="flex gap-2">
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Upload Logo
                        </Button>
                        {brandLogo && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {
                              setBrandLogo("");
                              setHasUnsavedChanges(true);
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">PNG or SVG, max 2MB</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="primaryColor">Primary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="primaryColor"
                          type="color"
                          value={primaryColor}
                          onChange={(e) => {
                            setPrimaryColor(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={primaryColor}
                          onChange={(e) => {
                            setPrimaryColor(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="#1ABC9C"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="secondaryColor">Secondary Color</Label>
                      <div className="flex gap-2">
                        <Input
                          id="secondaryColor"
                          type="color"
                          value={secondaryColor}
                          onChange={(e) => {
                            setSecondaryColor(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          className="w-16 h-10 p-1 cursor-pointer"
                        />
                        <Input
                          value={secondaryColor}
                          onChange={(e) => {
                            setSecondaryColor(e.target.value);
                            setHasUnsavedChanges(true);
                          }}
                          placeholder="#0B1D3A"
                        />
                      </div>
                    </div>
                  </div>

                  {contrastWarning && (
                    <Alert variant="destructive">
                      <AlertDescription>
                        Warning: The contrast ratio between your primary and secondary colors is below 4.5:1, which may
                        affect readability.
                      </AlertDescription>
                    </Alert>
                  )}

                  <div className="space-y-2">
                    <Label htmlFor="brandFont">Brand Font</Label>
                    <Select
                      value={brandFont}
                      onValueChange={(value) => {
                        setBrandFont(value);
                        setHasUnsavedChanges(true);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Inter">Inter</SelectItem>
                        <SelectItem value="Montserrat">Montserrat</SelectItem>
                        <SelectItem value="Roboto">Roboto</SelectItem>
                        <SelectItem value="Open Sans">Open Sans</SelectItem>
                        <SelectItem value="Lato">Lato</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </DashboardLayout>
  );
};

export default Profile;
