import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define the shape of our preferences
interface UserPreferences {
    theme: 'light' | 'dark' | 'auto';
    language: string;
    timezone: string;
    dateFormat: string;
}

interface NotificationSettings {
    issueAssigned: boolean;
    issueCommented: boolean;
    issueMentioned: boolean;
    sprintStarted: boolean;
    sprintCompleted: boolean;
    dailyDigest: boolean;
    weeklyReport: boolean;
}

interface PreferencesContextType {
    preferences: UserPreferences;
    notificationSettings: NotificationSettings;
    updatePreferences: (newPrefs: Partial<UserPreferences>) => void;
    updateNotificationSettings: (newSettings: Partial<NotificationSettings>) => void;
    isLoading: boolean;
}

const defaultPreferences: UserPreferences = {
    theme: 'light',
    language: 'en',
    timezone: 'UTC',
    dateFormat: 'MM/DD/YYYY',
};

const defaultNotifications: NotificationSettings = {
    issueAssigned: true,
    issueCommented: true,
    issueMentioned: true,
    sprintStarted: true,
    sprintCompleted: true,
    dailyDigest: false,
    weeklyReport: true,
};

const PreferencesContext = createContext<PreferencesContextType | undefined>(undefined);

export const PreferencesProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [preferences, setPreferences] = useState<UserPreferences>(defaultPreferences);
    const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>(defaultNotifications);
    const [isLoading, setIsLoading] = useState(true);

    // Load from localStorage on mount
    useEffect(() => {
        const loadSettings = () => {
            try {
                const storedPrefs = localStorage.getItem('user_preferences');
                if (storedPrefs) {
                    setPreferences({ ...defaultPreferences, ...JSON.parse(storedPrefs) });
                }

                const storedNotify = localStorage.getItem('user_notifications');
                if (storedNotify) {
                    setNotificationSettings({ ...defaultNotifications, ...JSON.parse(storedNotify) });
                }
            } catch (error) {
                console.error('Failed to load preferences:', error);
            } finally {
                setIsLoading(false);
            }
        };

        loadSettings();
    }, []);

    // Apply Theme Side Effect
    useEffect(() => {
        const root = window.document.documentElement;
        const isDark =
            preferences.theme === 'dark' ||
            (preferences.theme === 'auto' && window.matchMedia('(prefers-color-scheme: dark)').matches);

        if (isDark) {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }
    }, [preferences.theme]);

    const updatePreferences = (newPrefs: Partial<UserPreferences>) => {
        setPreferences((prev) => {
            const updated = { ...prev, ...newPrefs };
            localStorage.setItem('user_preferences', JSON.stringify(updated));
            return updated;
        });
    };

    const updateNotificationSettings = (newSettings: Partial<NotificationSettings>) => {
        setNotificationSettings((prev) => {
            const updated = { ...prev, ...newSettings };
            localStorage.setItem('user_notifications', JSON.stringify(updated));
            return updated;
        });
    };

    return (
        <PreferencesContext.Provider
            value={{
                preferences,
                notificationSettings,
                updatePreferences,
                updateNotificationSettings,
                isLoading,
            }}
        >
            {children}
        </PreferencesContext.Provider>
    );
};

export const usePreferences = () => {
    const context = useContext(PreferencesContext);
    if (context === undefined) {
        throw new Error('usePreferences must be used within a PreferencesProvider');
    }
    return context;
};
