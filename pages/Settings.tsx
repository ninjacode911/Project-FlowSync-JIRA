import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { User, Bell, Lock, Palette, Globe, Save, Camera } from 'lucide-react';

const Settings: React.FC = () => {
    const { currentUser, isLoading, error, refreshData } = useProject();

    const [activeTab, setActiveTab] = useState<'profile' | 'preferences' | 'notifications' | 'security'>('profile');
    const [isSaving, setIsSaving] = useState(false);

    // Profile settings
    const [profileData, setProfileData] = useState({
        name: currentUser.name,
        email: currentUser.email,
        role: currentUser.role,
        avatarUrl: currentUser.avatarUrl,
    });

    // Preferences
    const [preferences, setPreferences] = useState({
        theme: 'light',
        language: 'en',
        timezone: 'UTC',
        dateFormat: 'MM/DD/YYYY',
        emailNotifications: true,
        pushNotifications: true,
    });

    // Notification settings
    const [notificationSettings, setNotificationSettings] = useState({
        issueAssigned: true,
        issueCommented: true,
        issueMentioned: true,
        sprintStarted: true,
        sprintCompleted: true,
        dailyDigest: false,
        weeklyReport: true,
    });

    const handleSaveProfile = async () => {
        setIsSaving(true);
        try {
            // TEMPORARY: In real app, this would call API to update user profile
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Profile updated successfully!');
        } catch (err) {
            alert('Failed to update profile');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSavePreferences = async () => {
        setIsSaving(true);
        try {
            // TEMPORARY: In real app, this would save to user preferences
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Preferences saved successfully!');
        } catch (err) {
            alert('Failed to save preferences');
        } finally {
            setIsSaving(false);
        }
    };

    const handleSaveNotifications = async () => {
        setIsSaving(true);
        try {
            // TEMPORARY: In real app, this would save notification settings
            await new Promise(resolve => setTimeout(resolve, 1000));
            alert('Notification settings saved successfully!');
        } catch (err) {
            alert('Failed to save notification settings');
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
                    <div className="flex gap-6">
                        {/* Sidebar */}
                        <div className="w-64 flex-shrink-0">
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
                                                <img
                                                    src={profileData.avatarUrl}
                                                    alt="Profile"
                                                    className="w-20 h-20 rounded-full border-2 border-gray-200"
                                                />
                                                <button className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                                    <Camera size={16} className="mr-2" />
                                                    Change Photo
                                                </button>
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
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md bg-gray-50 text-gray-500"
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
                                                onChange={(e) => setPreferences({ ...preferences, theme: e.target.value })}
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
                                                onChange={(e) => setPreferences({ ...preferences, language: e.target.value })}
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
                                                onChange={(e) => setPreferences({ ...preferences, timezone: e.target.value })}
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
                                                onChange={(e) => setPreferences({ ...preferences, dateFormat: e.target.value })}
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

                                                <label className="flex items-center justify-between py-2">
                                                    <span className="text-sm text-gray-700">When an issue is assigned to me</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.issueAssigned}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, issueAssigned: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>

                                                <label className="flex items-center justify-between py-2">
                                                    <span className="text-sm text-gray-700">When someone comments on my issue</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.issueCommented}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, issueCommented: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>

                                                <label className="flex items-center justify-between py-2">
                                                    <span className="text-sm text-gray-700">When I'm mentioned in a comment</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.issueMentioned}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, issueMentioned: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>
                                            </div>

                                            {/* Sprint Notifications */}
                                            <div className="border-b border-gray-200 pb-4">
                                                <h3 className="text-sm font-medium text-gray-900 mb-3">Sprint Notifications</h3>

                                                <label className="flex items-center justify-between py-2">
                                                    <span className="text-sm text-gray-700">When a sprint starts</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.sprintStarted}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, sprintStarted: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>

                                                <label className="flex items-center justify-between py-2">
                                                    <span className="text-sm text-gray-700">When a sprint is completed</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.sprintCompleted}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, sprintCompleted: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>
                                            </div>

                                            {/* Digest Notifications */}
                                            <div>
                                                <h3 className="text-sm font-medium text-gray-900 mb-3">Digest Emails</h3>

                                                <label className="flex items-center justify-between py-2">
                                                    <span className="text-sm text-gray-700">Daily digest of activity</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.dailyDigest}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, dailyDigest: e.target.checked })}
                                                        className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                                                    />
                                                </label>

                                                <label className="flex items-center justify-between py-2">
                                                    <span className="text-sm text-gray-700">Weekly progress report</span>
                                                    <input
                                                        type="checkbox"
                                                        checked={notificationSettings.weeklyReport}
                                                        onChange={(e) => setNotificationSettings({ ...notificationSettings, weeklyReport: e.target.checked })}
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
                                                        placeholder="Enter new password"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <div>
                                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                                        Confirm New Password
                                                    </label>
                                                    <input
                                                        type="password"
                                                        placeholder="Confirm new password"
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                    />
                                                </div>

                                                <button
                                                    className="px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                                                >
                                                    Update Password
                                                </button>
                                            </div>
                                        </div>

                                        {/* Two-Factor Authentication */}
                                        <div className="border-t border-gray-200 pt-6">
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Two-Factor Authentication</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Add an extra layer of security to your account
                                            </p>
                                            <button className="px-6 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50">
                                                Enable 2FA
                                            </button>
                                        </div>

                                        {/* Active Sessions */}
                                        <div className="border-t border-gray-200 pt-6 mt-6">
                                            <h3 className="text-sm font-medium text-gray-900 mb-2">Active Sessions</h3>
                                            <p className="text-sm text-gray-600 mb-4">
                                                Manage your active sessions across devices
                                            </p>
                                            <div className="bg-gray-50 rounded-md p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <p className="text-sm font-medium text-gray-900">Current Session</p>
                                                        <p className="text-xs text-gray-500">Windows • Chrome • Last active: Now</p>
                                                    </div>
                                                    <span className="px-2 py-1 text-xs font-medium text-green-700 bg-green-100 rounded">Active</span>
                                                </div>
                                            </div>
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
