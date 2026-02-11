import React, { useState } from 'react';
import { useProject } from '../context/ProjectContext';
import { PriorityIcon, TypeIcon, StatusIcon } from '../components/ui/Icons';
import IssueModal from '../components/IssueModal';
import SprintModal from '../components/SprintModal';
import { ChevronDown, ChevronRight, MoreHorizontal, Search, Plus, Play, CheckCircle } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

const Backlog: React.FC = () => {
  const { issues, sprints, currentUser, users, searchQuery, isLoading, error, refreshData, createSprint, startSprint, completeSprint } = useProject();
  const [editingIssueId, setEditingIssueId] = useState<string | null>(null);
  const [isSprintModalOpen, setIsSprintModalOpen] = useState(false);

  // TEMPORARY: Show loading and error states
  if (isLoading) {
    return <LoadingSpinner message="Loading backlog..." />;
  }

  if (error) {
    return <ErrorMessage message={error} onRetry={refreshData} />;
  }

  // Group issues by sprint
  const activeSprint = sprints.find(s => s.isActive);
  const futureSprints = sprints.filter(s => !s.isActive && !s.isCompleted);

  const getIssuesForSprint = (sprintId?: string) => {
    return issues.filter(i => {
      if (sprintId === 'backlog') return !i.sprintId;
      return i.sprintId === sprintId;
    }).filter(i => {
      if (!searchQuery) return true;
      return i.title.toLowerCase().includes(searchQuery.toLowerCase()) || i.key.toLowerCase().includes(searchQuery.toLowerCase());
    });
  };

  const activeSprintIssues = activeSprint ? getIssuesForSprint(activeSprint.id) : [];
  const backlogIssues = getIssuesForSprint('backlog');

  const getAssignee = (id?: string) => users.find(u => u.id === id);

  const IssueListItem: React.FC<{ issue: any }> = ({ issue }) => {
    const assignee = getAssignee(issue.assigneeId);
    return (
      <div
        onClick={() => setEditingIssueId(issue.id)}
        className="group flex items-center py-2 px-4 bg-white hover:bg-slate-50 border-b border-slate-100 last:border-b-0 cursor-pointer transition-colors"
      >
        <div className="flex items-center space-x-3 flex-1 min-w-0">
          <TypeIcon type={issue.type} className="w-4 h-4 flex-shrink-0" />
          <span className="text-sm font-medium text-slate-500 w-16 flex-shrink-0 group-hover:underline">{issue.key}</span>
          <span className="text-sm text-slate-800 truncate">{issue.title}</span>
        </div>

        <div className="flex items-center space-x-6 pl-4">
          {/* Status Badge */}
          <div className="flex items-center w-28">
            <span className={`text-xs px-2 py-1 rounded font-medium uppercase truncate w-full text-center
                ${issue.status === 'Done' ? 'bg-green-100 text-green-700' :
                issue.status === 'In Progress' ? 'bg-blue-100 text-blue-700' :
                  'bg-slate-100 text-slate-700'
              }
             `}>
              {issue.status}
            </span>
          </div>

          <PriorityIcon priority={issue.priority} className="w-4 h-4" />

          <div className="w-8 flex justify-center">
            {assignee ? (
              <img src={assignee.avatarUrl} title={assignee.name} className="w-6 h-6 rounded-full" alt="Assignee" />
            ) : (
              <div className="w-6 h-6 rounded-full bg-slate-200" />
            )}
          </div>

          <div className="w-6 flex justify-center">
            <span className="text-xs bg-slate-100 text-slate-600 px-1.5 py-0.5 rounded-full font-medium">
              {issue.storyPoints || '-'}
            </span>
          </div>

          <button className="text-slate-400 hover:text-slate-600 p-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <MoreHorizontal size={16} />
          </button>
        </div>
      </div>
    );
  };

  const SprintSection: React.FC<{ sprint?: any; issues: any[]; title: string; isBacklog?: boolean }> = ({ sprint, issues, title, isBacklog }) => {
    const [isExpanded, setIsExpanded] = useState(true);
    const totalPoints = issues.reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);
    const completedPoints = issues.filter(i => i.status === 'Done').reduce((acc, curr) => acc + (curr.storyPoints || 0), 0);

    return (
      <div className="mb-8 rounded-lg border border-slate-200 bg-slate-50/50 overflow-hidden">
        <div
          className="flex items-center justify-between p-4 bg-slate-100 cursor-pointer select-none"
          onClick={() => setIsExpanded(!isExpanded)}
        >
          <div className="flex items-center space-x-2">
            {isExpanded ? <ChevronDown size={16} className="text-slate-500" /> : <ChevronRight size={16} className="text-slate-500" />}
            <h3 className="text-sm font-bold text-slate-800">{title}</h3>
            <span className="text-xs text-slate-500 font-medium">({issues.length} issues)</span>
          </div>

          <div className="flex items-center space-x-4">
            {!isBacklog && (
              <div className="flex items-center text-xs text-slate-500 space-x-1">
                <span className="bg-slate-200 px-2 py-1 rounded-full">{completedPoints}</span>
                <span>/</span>
                <span className="bg-slate-200 px-2 py-1 rounded-full">{totalPoints}</span>
                <span className="ml-1">Story Points</span>
              </div>
            )}

            {isBacklog && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsSprintModalOpen(true);
                }}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded transition-colors"
              >
                <Plus size={14} className="mr-1" />
                Create Sprint
              </button>
            )}

            {sprint && !sprint.isActive && !sprint.isCompleted && (
              <button
                onClick={async (e) => {
                  e.stopPropagation();
                  if (confirm(`Start sprint "${sprint.name}"?`)) {
                    await startSprint(sprint.id);
                  }
                }}
                className="flex items-center px-3 py-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 rounded transition-colors"
              >
                <Play size={14} className="mr-1" />
                Start Sprint
              </button>
            )}

            {sprint?.isActive && (
              <>
                <span className="px-2 py-1 text-xs font-bold text-blue-700 bg-blue-100 rounded uppercase tracking-wide">
                  Active
                </span>
                <button
                  onClick={async (e) => {
                    e.stopPropagation();
                    if (confirm(`Complete sprint "${sprint.name}"? Incomplete issues will be moved to backlog.`)) {
                      await completeSprint(sprint.id);
                    }
                  }}
                  className="flex items-center px-3 py-1.5 text-xs font-medium text-purple-700 bg-purple-50 hover:bg-purple-100 border border-purple-200 rounded transition-colors"
                >
                  <CheckCircle size={14} className="mr-1" />
                  Complete Sprint
                </button>
              </>
            )}
          </div>
        </div>

        {isExpanded && (
          <div className="bg-white min-h-[50px]">
            {issues.length > 0 ? (
              issues.map(issue => <IssueListItem key={issue.id} issue={issue} />)
            ) : (
              <div className="p-8 text-center text-sm text-slate-400 border-t border-slate-100">
                No issues in this sprint. Drag issues from the backlog here.
              </div>
            )}

            <div className="p-2 border-t border-slate-100 hover:bg-slate-50 cursor-pointer group">
              <button
                onClick={() => setEditingIssueId(null)} // Not quite right, need logic to open create modal prepopulated. 
                className="flex items-center text-sm text-slate-500 group-hover:text-blue-600 transition-colors w-full px-2"
              >
                <span className="text-xl mr-2 font-light">+</span> Create Issue
              </button>
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold text-slate-900">Backlog</h1>
        <div className="flex space-x-2">
          {/* Can add more header actions here */}
        </div>
      </div>

      {activeSprint && (
        <SprintSection
          sprint={activeSprint}
          issues={activeSprintIssues}
          title={`${activeSprint.name} ${activeSprint.goal ? `- ${activeSprint.goal}` : ''}`}
        />
      )}

      {futureSprints.map(sprint => (
        <SprintSection
          key={sprint.id}
          sprint={sprint}
          issues={getIssuesForSprint(sprint.id)}
          title={sprint.name}
        />
      ))}

      <SprintSection
        issues={backlogIssues}
        title="Backlog"
        isBacklog={true}
      />

      {/* Re-using Issue Modal for edit, need to handle Create properly if triggered from list */}
      <IssueModal
        isOpen={!!editingIssueId}
        onClose={() => setEditingIssueId(null)}
        issueId={editingIssueId || undefined}
      />

      {/* Sprint Modal for creating new sprints */}
      <SprintModal
        isOpen={isSprintModalOpen}
        onClose={() => setIsSprintModalOpen(false)}
        onCreateSprint={createSprint}
      />
    </div>
  );
};

export default Backlog;