// ============================================
// ⚠️ TEMPORARY - Replace in Phase 4
// This file has been updated to use API calls
// TODO: Add proper error handling, caching, optimistic updates
// ============================================

import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { AppState, Issue, Status, Priority, IssueType, User, Project, Sprint } from '../types';
import { issueService } from '../src/services/issueService';
import { userService } from '../src/services/userService';
import { projectService } from '../src/services/projectService';
import { sprintService } from '../src/services/sprintService';
import { commentService } from '../src/services/commentService';

// TEMPORARY: Extended interface with loading/error states
interface ProjectContextType extends AppState {
  createIssue: (issue: Partial<Issue>) => Promise<void>;
  updateIssueStatus: (issueId: string, status: Status) => Promise<void>;
  updateIssue: (issue: Issue) => Promise<void>;
  deleteIssue: (issueId: string) => Promise<void>;
  addComment: (issueId: string, content: string) => Promise<void>;
  // TEMPORARY: Sprint management functions
  createSprint: (sprint: Partial<Sprint>) => Promise<void>;
  startSprint: (sprintId: string) => Promise<void>;
  completeSprint: (sprintId: string) => Promise<void>;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  // TEMPORARY: Loading and error states
  isLoading: boolean;
  error: string | null;
  refreshData: () => Promise<void>;
}

const ProjectContext = createContext<ProjectContextType | undefined>(undefined);

export const ProjectProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // TEMPORARY: Basic state structure - replace with proper state management in Phase 4
  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentUser, setCurrentUser] = useState<User>({
    id: 'u1',
    name: 'Alex Rivera',
    email: 'alex@flowsync.com',
    avatarUrl: 'https://picsum.photos/100/100?random=1',
  });
  const [currentProjectId] = useState<string>('p1');
  const [searchQuery, setSearchQuery] = useState('');

  // TEMPORARY: Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TEMPORARY: Load initial data from API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // TEMPORARY: Parallel API calls - replace with proper data fetching in Phase 4
      const [usersData, projectsData, sprintsData, issuesData] = await Promise.all([
        userService.fetchUsers(),
        projectService.fetchProjects(),
        sprintService.fetchSprints(),
        issueService.fetchIssues(),
      ]);

      setUsers(usersData);
      setProjects(projectsData);
      setSprints(sprintsData);
      setIssues(issuesData);
    } catch (err) {
      // TEMPORARY: Basic error handling - replace with proper error handling in Phase 4
      console.error('Error loading data:', err);
      setError('Failed to load data. Please refresh the page.');
    } finally {
      setIsLoading(false);
    }
  }, []);

  // TEMPORARY: Load data on mount
  useEffect(() => {
    loadData();
  }, [loadData]);

  // TEMPORARY: Create issue with API call
  const createIssue = useCallback(async (newIssueData: Partial<Issue>) => {
    try {
      // TEMPORARY: Replace with proper validation and error handling
      const createdIssue = await issueService.createIssue({
        ...newIssueData,
        reporterId: currentUser.id,
      });

      setIssues((prev) => [...prev, createdIssue]);
    } catch (err) {
      console.error('Error creating issue:', err);
      // TEMPORARY: Replace with proper error notification in Phase 7
      alert('Failed to create issue');
    }
  }, [currentUser.id]);

  // TEMPORARY: Update issue status with API call
  const updateIssueStatus = useCallback(async (issueId: string, status: Status) => {
    try {
      // TEMPORARY: Optimistic update - improve in Phase 4
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId ? { ...issue, status, updatedAt: new Date().toISOString() } : issue
        )
      );

      await issueService.updateIssueStatus(issueId, status);
    } catch (err) {
      console.error('Error updating issue status:', err);
      // TEMPORARY: Revert on error - improve in Phase 4
      await loadData();
    }
  }, [loadData]);

  // TEMPORARY: Update issue with API call
  const updateIssue = useCallback(async (updatedIssue: Issue) => {
    try {
      // TEMPORARY: Optimistic update - improve in Phase 4
      setIssues((prev) =>
        prev.map((issue) => (issue.id === updatedIssue.id ? updatedIssue : issue))
      );

      await issueService.updateIssue(updatedIssue.id, updatedIssue);
    } catch (err) {
      console.error('Error updating issue:', err);
      // TEMPORARY: Revert on error - improve in Phase 4
      await loadData();
    }
  }, [loadData]);

  // TEMPORARY: Delete issue with API call
  const deleteIssue = useCallback(async (issueId: string) => {
    try {
      // TEMPORARY: Optimistic delete - improve in Phase 4
      setIssues((prev) => prev.filter((issue) => issue.id !== issueId));

      await issueService.deleteIssue(issueId);
    } catch (err) {
      console.error('Error deleting issue:', err);
      // TEMPORARY: Revert on error - improve in Phase 4
      await loadData();
    }
  }, [loadData]);

  // TEMPORARY: Add comment with API call
  const addComment = useCallback(async (issueId: string, content: string) => {
    try {
      const newComment = await commentService.createComment(issueId, currentUser.id, content);

      // TEMPORARY: Update local state - improve in Phase 4
      setIssues((prev) =>
        prev.map((issue) =>
          issue.id === issueId
            ? { ...issue, comments: [...(issue.comments || []), newComment] }
            : issue
        )
      );
    } catch (err) {
      console.error('Error adding comment:', err);
      alert('Failed to add comment');
    }
  }, [currentUser.id]);

  // TEMPORARY: Create sprint with API call
  const createSprint = useCallback(async (sprintData: Partial<Sprint>) => {
    try {
      const newSprint = await sprintService.createSprint(sprintData);
      setSprints((prev) => [...prev, newSprint]);
    } catch (err) {
      console.error('Error creating sprint:', err);
      alert('Failed to create sprint');
      throw err;
    }
  }, []);

  // TEMPORARY: Start sprint - set isActive to true, ensure only one active
  const startSprint = useCallback(async (sprintId: string) => {
    try {
      // First, deactivate all other sprints
      const updatedSprints = sprints.map(s => ({
        ...s,
        isActive: s.id === sprintId
      }));

      setSprints(updatedSprints);

      // Update via API
      await sprintService.updateSprint(sprintId, { isActive: true });

      // Deactivate others via API
      const otherActiveSprints = sprints.filter(s => s.isActive && s.id !== sprintId);
      await Promise.all(
        otherActiveSprints.map(s => sprintService.updateSprint(s.id, { isActive: false }))
      );
    } catch (err) {
      console.error('Error starting sprint:', err);
      alert('Failed to start sprint');
      await loadData(); // Revert on error
    }
  }, [sprints, loadData]);

  // TEMPORARY: Complete sprint - set isCompleted to true, move incomplete issues to backlog
  const completeSprint = useCallback(async (sprintId: string) => {
    try {
      // Update sprint status
      await sprintService.updateSprint(sprintId, {
        isActive: false,
        isCompleted: true
      });

      setSprints((prev) =>
        prev.map((s) =>
          s.id === sprintId ? { ...s, isActive: false, isCompleted: true } : s
        )
      );

      // Move incomplete issues to backlog
      const incompleteIssues = issues.filter(
        i => i.sprintId === sprintId && i.status !== 'Done'
      );

      await Promise.all(
        incompleteIssues.map(issue =>
          issueService.updateIssue(issue.id, { ...issue, sprintId: undefined })
        )
      );

      setIssues((prev) =>
        prev.map((issue) =>
          incompleteIssues.find(i => i.id === issue.id)
            ? { ...issue, sprintId: undefined }
            : issue
        )
      );
    } catch (err) {
      console.error('Error completing sprint:', err);
      alert('Failed to complete sprint');
      await loadData(); // Revert on error
    }
  }, [issues, loadData]);

  // TEMPORARY: Return context value with all required fields
  return (
    <ProjectContext.Provider
      value={{
        // State
        users,
        projects,
        sprints,
        issues,
        currentUser,
        currentProjectId,
        // Functions
        createIssue,
        updateIssueStatus,
        updateIssue,
        deleteIssue,
        addComment,
        // TEMPORARY: Sprint management
        createSprint,
        startSprint,
        completeSprint,
        searchQuery,
        setSearchQuery,
        // TEMPORARY: Loading and error states
        isLoading,
        error,
        refreshData: loadData,
      }}
    >
      {children}
    </ProjectContext.Provider>
  );
};

export const useProject = () => {
  const context = useContext(ProjectContext);
  if (!context) {
    throw new Error('useProject must be used within a ProjectProvider');
  }
  return context;
};