import React, { useState, useEffect } from 'react';
import { useProject } from '../context/ProjectContext';
import { useAuth } from '../context/AuthContext';
import { usePreferences } from '../context/PreferencesContext';
import { userService } from '../src/services/userService';
import { User, Bell, Lock, Palette, Save, Camera, CheckCircle2, AlertCircle } from 'lucide-react';

const Settings: React.FC = () => {
    // We use useAuth for current user data and refresh, as it's the source of truth for the session
    const { user: currentUser, refreshUser } = useAuth();
    const { refreshData } = useProject(); // To refresh global project data if needed

    // Global Preferences State
    const { preferences, notificationSettings, updatePreferences, updateNotificationSettings } = usePreferences();

    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile');
    const [isSaving, setIsSaving] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: '',
        email: '',
        role: '',
        avatarUrl: '',
    });

    // Load user data into form when currentUser changes
    useEffect(() => {
        if (currentUser) {
            setProfileData({
                name: currentUser.name,
                email: currentUser.email,
                role: currentUser.role,
                avatarUrl: currentUser.avatarUrl || '',
            });
        }
    }, [currentUser]);

    // Security (Password Change)
    const [passwordData, setPasswordData] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });

    // Clear messages after 3 seconds
    useEffect(() => {
        if (message) {
            const timer = setTimeout(() => setMessage(null), 3000);
            return () => clearTimeout(timer);
        }
    }, [message]);

    const handleSaveProfile = async () => {
        if (!currentUser) return;
        setIsSaving(true);
        setMessage(null);
        try {
            await userService.updateProfile({
                name: profileData.name,
                email: profileData.email,
            });

            // Refresh local user context to update UI immediately
            if (refreshUser) await refreshUser();

            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to update profile' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            // Context handles persistence to localStorage automatically when updatePreferences is called
            // But if we want to give feedback that it's "Saved", we can just show the message
            // or we could force a save here if the context wasn't auto-saving (but it is).
            // To simulate the "Action" of saving for the user:
            await new Promise(resolve => setTimeout(resolve, 500));
            setMessage({ type: 'success', text: 'Preferences saved!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save preferences' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNotifications = async () => {
        setIsSaving(true);
        setMessage(null);
        try {
            // Context handles persistence
            await new Promise(resolve => setTimeout(resolve, 500));
            setMessage({ type: 'success', text: 'Notification settings saved!' });
        } catch (err) {
            setMessage({ type: 'error', text: 'Failed to save notification settings' });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePasswordChange = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            setMessage({ type: 'error', text: 'New passwords do not match' });
            return;
        }
        if (passwordData.newPassword.length < 6) {
            setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
            return;
        }

        setIsSaving(true);
        setMessage(null);
        try {
            await userService.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword,
            });

            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (err: any) {
            console.error(err);
            setMessage({ type: 'error', text: err.response?.data?.error || 'Failed to change password' });
        } finally {
            setIsSaving(false);
        }
    };

    const tabs = [
        { id: 'profile', label: 'Profile', icon: User },
        { id: 'preferences', label: 'Preferences', icon: Palette },
        { id: 'notifications', label: 'Notifications', icon: Bell },
        { id: 'security', label: 'Security', icon: Lock },
    ];

    if (!currentUser) return <div className="p-6">Loading...</div>;

    return (
        <div className="h-full flex flex-col bg-slate-50">
            {/* Header */}
            <div className="px-6 py-5 bg-white border-b border-gray-100">
                <div className="flex items-center text-sm text-gray-500 mb-1">
                    <span>Settings</span>
                </div>
                <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-auto">
                <div className="max-w-6xl mx-auto p-6">
                    {message && (
                        <div className={`mb-6 p-4 rounded-lg flex items-center ${message.type === 'success' ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
                            {message.type === 'success' ? <CheckCircle2 size={20} className="mr-2" /> : <AlertCircle size={20} className="mr-2" />}
                            {message.text}
                        </div>
                    )}

                    <div className="flex flex-col md:flex-row gap-6">
                        {/* Sidebar */}
                        <div className="w-full md:w-64 flex-shrink-0">
                            <nav className="space-y-1">
                                {tabs.map((tab) => {
                                    const Icon = tab.icon;
                                    return (
                                        <button
                                            key={tab.id}
                                            onClick={() => setActiveTab(tab.id as any)}
                                            className={`w-full flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors ${activeTab === tab.id
                                                ? 'bg-blue-50 text-blue-700'
                                                : 'text-gray-700 hover:bg-gray-100'
                                                }`}
                                        >
                                            <Icon size={18} className="mr-3" />
                                            {tab.label}
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>

                        {/* Main Content */}
                        <div className="flex-1">
                            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                                {/* Profile Tab */}
                                {activeTab === 'profile' && (
                                    <div className="p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Profile Information</h2>

                                        {/* Avatar */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Profile Picture
                                            </label>
                                            <div className="flex items-center space-x-4">
                                                {profileData.avatarUrl ? (
                                                    <img
                                                        src={profileData.avatarUrl}
                                                        alt="Profile"
                                                        className="w-20 h-20 rounded-full border-2 border-gray-200 object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-20 h-20 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center border-2 border-white shadow-sm">
                                                        <span className="text-white font-bold text-3xl">
                                                            {profileData.name.charAt(0)}
                                                        </span>
                                                    </div>
                                                )}
                                                <div>
                                                    <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 mb-1" disabled>
                                                        <Camera size={16} className="mr-2" />
                                                        Change Photo
                                                    </button>
                                                    <p className="text-xs text-slate-400">Gravatar supported via email</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Name */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Full Name
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.name}
                                                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Email */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Email Address
                                            </label>
                                            <input
                                                type="email"
                                                value={profileData.email}
                                                onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                        </div>

                                        {/* Role */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Role
                                            </label>
                                            <input
                                                type="text"
                                                value={profileData.role}
                                                disabled
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500 capitalize"
                                            />
                                            <p className="mt-1 text-xs text-gray-500">Contact your administrator to change your role</p>
                                        </div>

                                        {/* Save Button */}
                                        <button
                                            onClick={handleSaveProfile}
                                            disabled={isSaving}
                                            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save size={16} className={`mr-2 ${isSaving ? 'animate-pulse' : ''}`} />
                                            {isSaving ? 'Saving...' : 'Save Changes'}
                                        </button>
                                    </div>
                                )}

                                {/* Preferences Tab */}
                                {activeTab === 'preferences' && (
                                    <div className="p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Preferences</h2>

                                        {/* Theme */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Theme
                                            </label>
                                            <select
                                                value={preferences.theme}
                                                onChange={(e) => updatePreferences({ theme: e.target.value as any })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="light">Light</option>
                                                <option value="dark">Dark</option>
                                                <option value="auto">Auto (System)</option>
                                            </select>
                                        </div>

                                        {/* Language */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Language
                                            </label>
                                            <select
                                                value={preferences.language}
                                                onChange={(e) => updatePreferences({ language: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="en">English</option>
                                                <option value="es">Spanish</option>
                                                <option value="fr">French</option>
                                                <option value="de">German</option>
                                            </select>
                                        </div>

                                        {/* Timezone */}
                                        <div className="mb-4">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Timezone
                                            </label>
                                            <select
                                                value={preferences.timezone}
                                                onChange={(e) => updatePreferences({ timezone: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="UTC">UTC</option>
                                                <option value="America/New_York">Eastern Time</option>
                                                <option value="America/Chicago">Central Time</option>
                                                <option value="America/Los_Angeles">Pacific Time</option>
                                                <option value="Europe/London">London</option>
                                                <option value="Asia/Tokyo">Tokyo</option>
                                            </select>
                                        </div>

                                        {/* Date Format */}
                                        <div className="mb-6">
                                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                                Date Format
                                            </label>
                                            <select
                                                value={preferences.dateFormat}
                                                onChange={(e) => updatePreferences({ dateFormat: e.target.value })}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            >
                                                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                                                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                                                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                                            </select>
                                        </div>

                                        {/* Save Button */}
                                        <button
                                            onClick={handleSavePreferences}
                                            disabled={isSaving}
                                            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save size={16} className={`mr-2 ${isSaving ? 'animate-pulse' : ''}`} />
                                            {isSaving ? 'Saving...' : 'Save Preferences'}
                                        </button>
                                    </div>
                                )}

                                {/* Notifications Tab */}
                                {activeTab === 'notifications' && (
                                    <div className="p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Notification Settings</h2>

                                        <div className="space-y-4 mb-6">
                                            {/* Issue Notifications */}
                                            <div className="border-b border-gray-200 pb-4">
                                                <h3 className="text-sm font-medium text-gray-900 mb-3">Issue Notifications</h3>

                                                <label className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50 px-2 rounded -mx-2">
                                                    <span className="text-sm text-gray-700">When an issue is assigned to me</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.issueAssigned}
                                                        onChange={(e) => updateNotificationSettings({ issueAssigned: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>

                                                <label className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50 px-2 rounded -mx-2">
                                                    <span className="text-sm text-gray-700">When someone comments on my issue</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.issueCommented}
                                                        onChange={(e) => updateNotificationSettings({ issueCommented: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>

                                                <label className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50 px-2 rounded -mx-2">
                                                    <span className="text-sm text-gray-700">When I'm mentioned in a comment</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.issueMentioned}
                                                        onChange={(e) => updateNotificationSettings({ issueMentioned: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>
                                            </div>

                                            {/* Sprint Notifications */}
                                            <div className="border-b border-gray-200 pb-4">
                                                <h3 className="text-sm font-medium text-gray-900 mb-3">Sprint Notifications</h3>

                                                <label className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50 px-2 rounded -mx-2">
                                                    <span className="text-sm text-gray-700">When a sprint starts</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.sprintStarted}
                                                        onChange={(e) => updateNotificationSettings({ sprintStarted: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>

                                                <label className="flex items-center justify-between py-2 cursor-pointer hover:bg-slate-50 px-2 rounded -mx-2">
                                                    <span className="text-sm text-gray-700">When a sprint is completed</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.sprintCompleted}
                                                        onChange={(e) => updateNotificationSettings({ sprintCompleted: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>
                                            </div>
                                        </div>

                                        {/* Save Button */}
                                        <button
                                            onClick={handleSaveNotifications}
                                            disabled={isSaving}
                                            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            <Save size={16} className={`mr-2 ${isSaving ? 'animate-pulse' : ''}`} />
                                            {isSaving ? 'Saving...' : 'Save Settings'}
                                        </button>
                                    </div>
                                )}

                                {/* Security Tab */}
                                {activeTab === 'security' && (
                                    <div className="p-6">
                                        <h2 className="text-lg font-semibold text-gray-900 mb-6">Security Settings</h2>

                                        {/* Change Password */}
                                        <div className="mb-6">
                                            <h3 className="text-sm font-medium text-gray-900 mb-4">Change Password</h3>

                                            <div className="space-y-4">
                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Current Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.currentPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                        placeholder="Enter current password"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        placeholder="Enter new password (min. 6 chars)"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        placeholder="Confirm new password"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <button
                                                    onClick={handlePasswordChange}
                                                    disabled={isSaving || !passwordData.currentPassword || !passwordData.newPassword}
                                                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                                >
                                                    {isSaving ? 'Updating...' : 'Update Password'}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Two-Factor Authentication (Placeholder) */}
                                        <div className="border-t border-gray-200 pt-6 opacity-60">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-sm font-medium text-gray-900">Two-Factor Authentication</h3>
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Coming Soon</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Add an extra layer of security to your account
                                            </p>
                                            <button className="px-6 py-2 text-sm font-medium text-gray-500 bg-gray-100 border border-gray-200 rounded-md cursor-not-allowed" disabled>
                                                Enable 2FA
                                            </button>
                                        </div>

                                        {/* Active Sessions (Placeholder) */}
                                        <div className="border-t border-gray-200 pt-6 mt-6 opacity-60">
                                            <div className="flex justify-between items-center mb-2">
                                                <h3 className="text-sm font-medium text-gray-900">Active Sessions</h3>
                                                <span className="text-xs bg-slate-100 text-slate-500 px-2 py-0.5 rounded">Coming Soon</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Manage your active sessions across devices
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Settings;
