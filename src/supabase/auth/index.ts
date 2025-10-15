import { supabase } from "../supabaseClient";

interface SignupResponse {
    user: any | null;
    error: any | null;
}

interface SignupProps {
    email: string,
    password: string,
    fullName: string
}

export const signupUser = async (props: SignupProps): Promise<SignupResponse> => {
    const { email, password, fullName } = props;
    try {
        // Validate inputs
        if (!email || !password || !fullName) {
            return {
                user: null,
                error: {
                    message: 'All fields are required',
                    code: 'validation_error'
                }
            };
        }

        // Sign up user in Supabase Auth WITHOUT email redirect to avoid SMTP issues
        const signupResponse = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { full_name: fullName },
                // Remove emailRedirectTo to avoid SMTP configuration issues that cause 500 errors
            },
        });

        const authError = signupResponse.error;
        const user = signupResponse.data.user;

        // Check for authentication errors
        if (authError) {
            console.error('Supabase auth error:', authError);

            // Handle specific error types
            let errorMessage = 'Authentication failed';
            if (authError.message) {
                errorMessage = authError.message;
            } else if (authError.status === 500) {
                errorMessage = 'Server error occurred. This might be due to database constraints or SMTP configuration issues.';
            } else if (authError.status === 422) {
                errorMessage = 'Invalid email or password format.';
            } else if (authError.status === 429) {
                errorMessage = 'Too many requests. Please wait a moment and try again.';
            }

            return {
                user: null,
                error: {
                    message: errorMessage,
                    code: authError.status?.toString() || 'unknown',
                    originalError: authError
                }
            };
        }
        // Return success
        return { user, error: null };
    } catch (err: any) {
        console.error('Signup error:', err);
        return {
            user: null,
            error: {
                message: err.message || 'An unexpected error occurred',
                code: 'signup_error',
                originalError: err
            }
        };
    }
};

export const loginUser = async (email: string, password: string) => {
    try {
        const { data, error } = await supabase.auth.signInWithPassword({ email, password });

        if (error) {
            console.error('Login error:', error);
            throw {
                message: error.message || 'Login failed',
                code: error.status || 'login_error'
            };
        }

        return data;
    } catch (err: any) {
        console.error('Login error:', err);
        throw err;
    }
};

export const logoutUser = async () => {
    await supabase.auth.signOut();
};

// Get user profile data from database
export const getUserProfile = async (userId: string) => {

    console.log("======[userId]=====", JSON.stringify(userId, null, 1))
    try {
        const { data, error } = await supabase
            .from('users')
            .select('*')
            .eq('id', userId)
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error fetching user profile:', error);
        return null;
    }
};

// Get current user with profile data
export const getCurrentUserWithProfile = async () => {
    try {
        const { data: { user }, error: authError } = await supabase.auth.getUser();
        if (authError) throw authError;
        
        if (!user) return null;
        
        const profile = await getUserProfile(user.id);
        if (!profile) return null;
        
        return {
            ...user,
            profile
        };
    } catch (error) {
        console.error('Error getting current user with profile:', error);
        return null;
    }
};

// Update user profile data
export const updateUserProfile = async (userId: string, profileData: any) => {
    try {
        const { data, error } = await supabase
            .from('users')
            .update({
                full_name: profileData.fullName,
                bio: profileData.bio,
                goals: profileData.goals,
                industry: profileData.industry,
                seniority: profileData.seniority,
                brand_logo_url: profileData.brandLogo,
                brand_primary_color: profileData.primaryColor,
                brand_secondary_color: profileData.secondaryColor,
                brand_font: profileData.brandFont,
                preferences: profileData.preferences,
                integrations: profileData.integrations,
                updated_at: new Date().toISOString()
            })
            .eq('id', userId)
            .select()
            .single();

        if (error) throw error;
        return data;
    } catch (error) {
        console.error('Error updating user profile:', error);
        throw error;
    }
};

// Update user password
export const updateUserPassword = async (newPassword: string) => {
    try {
        const { error } = await supabase.auth.updateUser({
            password: newPassword
        });

        if (error) throw error;
        return true;
    } catch (error) {
        console.error('Error updating password:', error);
        throw error;
    }
};
