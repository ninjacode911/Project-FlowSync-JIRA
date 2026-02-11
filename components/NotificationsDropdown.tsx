import React, { useState, useRef, useEffect } from 'react';
import { Bell, Check, X, Trash2 } from 'lucide-react';
import { useProject } from '../context/ProjectContext';

interface Notification {
    id: string;
    type: 'issue_assigned' | 'issue_commented' | 'sprint_started' | 'sprint_completed' | 'mention';
    title: string;
    message: string;
    timestamp: string;
    read: boolean;
    issueId?: string;
    sprintId?: string;
}

const NotificationsDropdown: React.FC = () => {
    const { currentUser } = useProject();
    const [isOpen, setIsOpen] = useState(false);
    const [notifications, setNotifications] = useState<Notification[]>([
        {
            id: '1',
            type: 'issue_assigned',
            title: 'New issue assigned',
            message: 'FS-101: Implement user authentication has been assigned to you',
            timestamp: new Date(Date.now() - 1000 * 60 * 30).toISOString(), // 30 mins ago
            read: false,
            issueId: 'FS-101',
        },
        {
            id: '2',
            type: 'issue_commented',
            title: 'New comment',
            message: 'Sarah Chen commented on FS-98: Design system components',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2 hours ago
            read: false,
            issueId: 'FS-98',
        },
        {
            id: '3',
            type: 'sprint_started',
            title: 'Sprint started',
            message: 'Sprint 3 has been started',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(), // 1 day ago
            read: true,
            sprintId: 'sprint-3',
        },
        {
            id: '4',
            type: 'mention',
            title: 'You were mentioned',
            message: 'Alex mentioned you in a comment on FS-95',
            timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(), // 2 days ago
            read: true,
            issueId: 'FS-95',
        },
    ]);

    const dropdownRef = useRef<HTMLDivElement>(null);

    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen]);

    const unreadCount = notifications.filter(n => !n.read).length;

    const handleMarkAsRead = (id: string) => {
        setNotifications(prev =>
            prev.map(n => (n.id === id ? { ...n, read: true } : n))
        );
    };

    const handleMarkAllAsRead = () => {
        setNotifications(prev => prev.map(n => ({ ...n, read: true })));
    };

    const handleDelete = (id: string) => {
        setNotifications(prev => prev.filter(n => n.id !== id));
    };

    const handleClearAll = () => {
        setNotifications([]);
    };

    const formatTimestamp = (timestamp: string) => {
        const now = Date.now();
        const time = new Date(timestamp).getTime();
        const diff = now - time;

        const minutes = Math.floor(diff / (1000 * 60));
        const hours = Math.floor(diff / (1000 * 60 * 60));
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));

        if (minutes < 1) return 'Just now';
        if (minutes < 60) return `${minutes}m ago`;
        if (hours < 24) return `${hours}h ago`;
        if (days < 7) return `${days}d ago`;
        return new Date(timestamp).toLocaleDateString();
    };

    const getNotificationIcon = (type: Notification['type']) => {
        switch (type) {
            case 'issue_assigned':
                return '📋';
            case 'issue_commented':
                return '💬';
            case 'sprint_started':
                return '🚀';
            case 'sprint_completed':
                return '✅';
            case 'mention':
                return '👤';
            default:
                return '🔔';
        }
    };

    return (
        <div className="relative" ref={dropdownRef}>
            {/* Bell Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="relative p-2 text-slate-400 hover:text-slate-600 transition-colors rounded-full hover:bg-slate-100"
            >
                <Bell size={20} />
                {unreadCount > 0 && (
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
                )}
            </button>

            {/* Dropdown */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-96 bg-white rounded-lg shadow-xl border border-gray-200 z-50">
                    {/* Header */}
                    <div className="px-4 py-3 border-b border-gray-200 flex items-center justify-between">
                        <div>
                            <h3 className="text-sm font-semibold text-gray-900">Notifications</h3>
                            {unreadCount > 0 && (
                                <p className="text-xs text-gray-500">{unreadCount} unread</p>
                            )}
                        </div>
                        <div className="flex items-center space-x-2">
                            {unreadCount > 0 && (
                                <button
                                    onClick={handleMarkAllAsRead}
                                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                                >
                                    Mark all read
                                </button>
                            )}
                            {notifications.length > 0 && (
                                <button
                                    onClick={handleClearAll}
                                    className="text-xs text-red-600 hover:text-red-700 font-medium"
                                >
                                    Clear all
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Notifications List */}
                    <div className="max-h-96 overflow-y-auto">
                        {notifications.length === 0 ? (
                            <div className="px-4 py-8 text-center">
                                <Bell size={32} className="mx-auto text-gray-300 mb-2" />
                                <p className="text-sm text-gray-500">No notifications</p>
                                <p className="text-xs text-gray-400 mt-1">You're all caught up!</p>
                            </div>
                        ) : (
                            notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={`group px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition-colors ${!notification.read ? 'bg-blue-50/30' : ''
                                        }`}
                                >
                                    <div className="flex items-start space-x-3">
                                        {/* Icon */}
                                        <div className="flex-shrink-0 text-xl mt-0.5">
                                            {getNotificationIcon(notification.type)}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between">
                                                <div className="flex-1">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {notification.title}
                                                    </p>
                                                    <p className="text-sm text-gray-600 mt-0.5 line-clamp-2">
                                                        {notification.message}
                                                    </p>
                                                    <p className="text-xs text-gray-400 mt-1">
                                                        {formatTimestamp(notification.timestamp)}
                                                    </p>
                                                </div>

                                                {/* Actions */}
                                                <div className="flex items-center space-x-1 ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                    {!notification.read && (
                                                        <button
                                                            onClick={() => handleMarkAsRead(notification.id)}
                                                            className="p-1 text-blue-600 hover:bg-blue-100 rounded"
                                                            title="Mark as read"
                                                        >
                                                            <Check size={14} />
                                                        </button>
                                                    )}
                                                    <button
                                                        onClick={() => handleDelete(notification.id)}
                                                        className="p-1 text-red-600 hover:bg-red-100 rounded"
                                                        title="Delete"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            {/* Unread indicator */}
                                            {!notification.read && (
                                                <div className="absolute left-2 top-1/2 -translate-y-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>

                    {/* Footer */}
                    {notifications.length > 0 && (
                        <div className="px-4 py-2 border-t border-gray-200 bg-gray-50">
                            <button className="w-full text-center text-xs text-blue-600 hover:text-blue-700 font-medium py-1">
                                View all notifications
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default NotificationsDropdown;
