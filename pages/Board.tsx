import React, { useState, useMemo } from 'react';
import { useProject } from '../context/ProjectContext';
import { Status, Issue } from '../types';
import { PriorityIcon, TypeIcon } from '../components/ui/Icons';
import IssueModal from '../components/IssueModal';
import { Search, Filter } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const COLUMNS: Status[] = ['To Do', 'In Progress', 'In Review', 'Done'];

const Board: React.FC = () => {
  const { issues, updateIssueStatus, sprints, searchQuery, users, currentUser, isLoading, error, refreshData } = useProject();
  const [draggedIssueId, setDraggedIssueId] = useState<string | null>(null);
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [filterUser, setFilterUser] = useState<string>('all');

  // TEMPORARY: Show loading and error states
  if (isLoading) {
    return <LoadingSpinner message="Loading board..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refreshData} />;
  }

  const activeSprint = sprints.find(s => s.isActive);

  // Filter issues for the active sprint (or all if no active sprint logic enforced tightly)
  // and apply search/user filters
  const filteredIssues = useMemo(() => {
    return issues.filter(issue => {
      // 1. Must be in active sprint
      if (activeSprint && issue.sprintId !== activeSprint.id) return false;
      // 2. Search query
      if (searchQuery && !issue.title.toLowerCase().includes(searchQuery.toLowerCase()) && !issue.key.toLowerCase().includes(searchQuery.toLowerCase())) return false;
      // 3. User filter
      if (filterUser === 'me' && issue.assigneeId !== currentUser.id) return false;
      if (filterUser !== 'all' && filterUser !== 'me' && issue.assigneeId !== filterUser) return false;

      return true;
    });
  }, [issues, activeSprint, searchQuery, filterUser, currentUser]);

  const onDragStart = (e: React.DragEvent, issueId: string) => {
    setDraggedIssueId(issueId);
    e.dataTransfer.effectAllowed = 'move';
    // Transparent drag image or default
  };

  const onDragOver = (e: React.DragEvent) => {
    e.preventDefault(); // Necessary to allow dropping
  };

  // TEMPORARY: Async drag-and-drop handler - improve with optimistic updates in Phase 4
  const onDrop = async (e: React.DragEvent, status: Status) => {
    e.preventDefault();
    if (draggedIssueId) {
      try {
        await updateIssueStatus(draggedIssueId, status);
      } catch (error) {
        // Error already handled in context
        console.error('Error updating issue status:', error);
      }
      setDraggedIssueId(null);
    }
  };

  const getAssignee = (id?: string) => users.find(u => u.id === id);

  return (
    <div className="h-full flex flex-col">
      {/* Board Header */}
      <div className="px-6 py-5 flex flex-col md:flex-row items-start md:items-center justify-between border-b border-gray-100 bg-white">
        <div>
          <div className="flex items-center text-sm text-gray-500 mb-1">
            <span>Projects</span>
            <span className="mx-2">/</span>
            <span>FlowSync Core</span>
            <span className="mx-2">/</span>
            <span className="text-gray-900 font-medium">{activeSprint?.name || 'Kanban Board'}</span>
          </div>
          <h1 className="text-2xl font-bold text-gray-900">{activeSprint?.name || 'Active Sprint'}</h1>
        </div>

        <div className="mt-4 md:mt-0 flex items-center space-x-3">
          {/* Quick Filters */}
          <div className="flex items-center -space-x-2 mr-4">
            {users.slice(0, 4).map(u => (
              <img
                key={u.id}
                src={u.avatarUrl}
                alt={u.name}
                title={u.name}
                className={`w-8 h-8 rounded-full border-2 border-white cursor-pointer hover:z-10 transition-transform hover:scale-110 ${filterUser === u.id ? 'ring-2 ring-blue-500 z-10' : ''}`}
                onClick={() => setFilterUser(filterUser === u.id ? 'all' : u.id)}
              />
            ))}
            <button
              onClick={() => setFilterUser(filterUser === 'me' ? 'all' : 'me')}
              className={`ml-3 px-3 py-1.5 text-xs font-medium rounded-full transition-colors border ${filterUser === 'me' ? 'bg-blue-100 text-blue-800 border-blue-200' : 'text-gray-600 bg-gray-50 border-gray-200 hover:bg-gray-100'}`}
            >
              Only My Issues
            </button>
            {filterUser !== 'all' && (
              <button
                onClick={() => setFilterUser('all')}
                className="ml-2 text-xs text-gray-500 underline hover:text-gray-800"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Kanban Columns */}
      <div className="flex-1 overflow-x-auto overflow-y-hidden bg-white p-6">
        <div className="flex h-full space-x-6 min-w-max">
          {COLUMNS.map(status => {
            const columnIssues = filteredIssues.filter(i => i.status === status);
            return (
              <div
                key={status}
                className="flex flex-col w-80 bg-slate-50/80 rounded-xl border border-slate-200/60 max-h-full"
                onDragOver={onDragOver}
                onDrop={(e) => onDrop(e, status)}
              >
                {/* Column Header */}
                <div className="p-4 flex items-center justify-between sticky top-0 bg-slate-50/80 backdrop-blur-sm rounded-t-xl z-10">
                  <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center">
                    {status}
                    <span className="ml-2 bg-slate-200 text-slate-600 rounded-full px-2 py-0.5 text-[10px] min-w-[20px] text-center">
                      {columnIssues.length}
                    </span>
                  </h3>
                </div>

                {/* Column Body */}
                <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
                  {columnIssues.map(issue => {
                    const assignee = getAssignee(issue.assigneeId);
                    return (
                      <div
                        key={issue.id}
                        draggable
                        onDragStart={(e) => onDragStart(e, issue.id)}
                        onClick={() => setEditingIssueId(issue.id)}
                        className={`
                          group relative bg-white p-4 rounded-lg shadow-sm border border-slate-200 
                          cursor-grab active:cursor-grabbing hover:shadow-md hover:border-blue-300 transition-all duration-200
                          ${draggedIssueId === issue.id ? 'opacity-50' : 'opacity-100'}
                        `}
                      >
                        <div className="flex justify-between items-start mb-2">
                          <span className="text-xs text-slate-500 font-medium hover:underline cursor-pointer">{issue.key}</span>
                        </div>

                        <p className="text-sm font-medium text-slate-800 mb-3 line-clamp-2 leading-relaxed">
                          {issue.title}
                        </p>

                        <div className="flex items-center justify-between mt-auto">
                          <div className="flex items-center space-x-2">
                            <TypeIcon type={issue.type} className="w-4 h-4" />
                            <PriorityIcon priority={issue.priority} className="w-4 h-4" />
                            {issue.storyPoints && (
                              <span className="bg-slate-100 text-slate-600 text-xs px-1.5 py-0.5 rounded font-medium">
                                {issue.storyPoints}
                              </span>
                            )}
                          </div>
                          {assignee ? (
                            <img
                              src={assignee.avatarUrl}
                              alt={assignee.name}
                              className="w-6 h-6 rounded-full ring-2 ring-white"
                              title={`Assigned to ${assignee.name}`}
                            />
                          ) : (
                            <div className="w-6 h-6 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center">
                              <span className="text-[10px] text-slate-400">?</span>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  {columnIssues.length === 0 && (
                    <div className="h-32 border-2 border-dashed border-slate-200 rounded-lg flex items-center justify-center text-slate-400 text-sm">
                      Drop items here
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <IssueModal
        isOpen={!!editingIssueId}
        onClose={() => setEditingIssueId(null)}
        issueId={editingIssueId || undefined}
      />
    </div>
  );
};

export default Board;