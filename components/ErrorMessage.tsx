import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

interface ErrorMessageProps {
    message: string;
    onRetry?: () => void;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message, onRetry }) => {
    return (
        <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4 p-8">
            <div className="flex items-center justify-center w-16 h-16 bg-red-100 rounded-full">
                <AlertCircle className="w-8 h-8 text-red-600" />
            </div>
            <div className="text-center space-y-2">
                <h3 className="text-lg font-semibold text-gray-900">Something went wrong</h3>
                <p className="text-gray-600 max-w-md">{message}</p>
            </div>
            {onRetry && (
                <button
                    onClick={onRetry}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                >
                    <RefreshCw className="w-4 h-4 mr-2" />
                    Try Again
                </button>
            )}
        </div>
    );
};

export default ErrorMessage;
