import React, { useState } from 'react';
import { X, Calendar, Target } from 'lucide-react';
import { Sprint } from '../types';

interface SprintModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCreateSprint: (sprint: Partial<Sprint>) => Promise<void>;
}

const SprintModal: React.FC<SprintModalProps> = ({ isOpen, onClose, onCreateSprint }) => {
    const [formData, setFormData] = useState({
        name: '',
        goal: '',
        startDate: '',
        endDate: '',
    });
    const [isSubmitting, setIsSubmitting] = useState(false);

    if (!isOpen) return null;

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Validation
        if (!formData.name.trim()) {
            alert('Sprint name is required');
            return;
        }

        if (!formData.startDate || !formData.endDate) {
            alert('Start and end dates are required');
            return;
        }

        if (new Date(formData.endDate) <= new Date(formData.startDate)) {
            alert('End date must be after start date');
            return;
        }

        setIsSubmitting(true);
        try {
            await onCreateSprint({
                name: formData.name,
                goal: formData.goal,
                startDate: formData.startDate,
                endDate: formData.endDate,
                isActive: false,
                isCompleted: false,
            });

            // Reset form
            setFormData({
                name: '',
                goal: '',
                startDate: '',
                endDate: '',
            });

            onClose();
        } catch (error) {
            console.error('Error creating sprint:', error);
            alert('Failed to create sprint. Please try again.');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
                {/* Header */}
                <div className="flex items-center justify-between p-4 border-b border-gray-100">
                    <h2 className="text-xl font-semibold text-gray-800">Create Sprint</h2>
                    <button
                        onClick={onClose}
                        disabled={isSubmitting}
                        className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors disabled:opacity-50"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-4 space-y-4">
                    {/* Sprint Name */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sprint Name *
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            placeholder="e.g., Sprint 1, Q1 Sprint"
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Sprint Goal */}
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Sprint Goal
                        </label>
                        <textarea
                            value={formData.goal}
                            onChange={(e) => setFormData({ ...formData, goal: e.target.value })}
                            placeholder="What do you want to achieve in this sprint?"
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            disabled={isSubmitting}
                        />
                    </div>

                    {/* Date Range */}
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date *
                            </label>
                            <input
                                type="date"
                                value={formData.startDate}
                                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSubmitting}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date *
                            </label>
                            <input
                                type="date"
                                value={formData.endDate}
                                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                                disabled={isSubmitting}
                            />
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-2 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Calendar size={16} className={`mr-2 ${isSubmitting ? 'animate-pulse' : ''}`} />
                            {isSubmitting ? 'Creating...' : 'Create Sprint'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SprintModal;
