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
import { useAuth } from './AuthContext';

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
  const { user: authUser } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [sprints, setSprints] = useState<Sprint[]>([]);
  const [issues, setIssues] = useState<Issue[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');

  // Map auth user to currentUser format
  const currentUser: User = authUser ? {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    avatarUrl: authUser.avatarUrl || `https://api.dicebear.com/7.x/avataaars/svg?seed=${authUser.name}`,
    role: authUser.role,
  } : {
    id: '',
    name: '',
    email: '',
    avatarUrl: '',
  };

  // TEMPORARY: Loading and error states
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // TEMPORARY: Load initial data from API
  const loadData = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);

      // Parallel API calls
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

      // Set current project if not set and projects exist
      if (!currentProjectId && projectsData.length > 0) {
        setCurrentProjectId(projectsData[0].id);
      }
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

  // Create issue with API call
  const createIssue = useCallback(async (newIssueData: Partial<Issue>) => {
    try {
      if (!currentProjectId) {
        throw new Error('No project selected');
      }

      const createdIssue = await issueService.createIssue({
        ...newIssueData,
        projectId: currentProjectId,
        reporterId: currentUser.id,
      });

      setIssues((prev) => [...prev, createdIssue]);
    } catch (err: any) {
      console.error('Error creating issue:', err);
      alert(err.message || 'Failed to create issue');
      throw err;
    }
  }, [currentUser.id, currentProjectId]);

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

  // Create sprint with API call
  const createSprint = useCallback(async (sprintData: Partial<Sprint>) => {
    try {
      if (!currentProjectId) {
        throw new Error('No project selected');
      }

      const newSprint = await sprintService.createSprint({
        ...sprintData,
        projectId: currentProjectId,
      });

      // Map backend response to frontend format
      const formattedSprint: Sprint = {
        ...newSprint,
        isActive: newSprint.isActive || false,
        isCompleted: newSprint.isCompleted || false,
      };

      setSprints((prev) => [...prev, formattedSprint]);
    } catch (err: any) {
      console.error('Error creating sprint:', err);
      alert(err.message || 'Failed to create sprint');
      throw err;
    }
  }, [currentProjectId]);

  // Start sprint
  const startSprint = useCallback(async (sprintId: string) => {
    try {
      // Use the API endpoint to start sprint
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sprints/${sprintId}/start`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to start sprint');
      }

      const updatedSprint = await response.json();

      // Update local state
      setSprints((prev) =>
        prev.map((s) =>
          s.id === sprintId
            ? { ...s, isActive: true, isCompleted: false }
            : { ...s, isActive: false }
        )
      );
    } catch (err: any) {
      console.error('Error starting sprint:', err);
      alert(err.message || 'Failed to start sprint');
      await loadData(); // Revert on error
    }
  }, [loadData]);

  // Complete sprint
  const completeSprint = useCallback(async (sprintId: string) => {
    try {
      // Use the API endpoint to complete sprint
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:5000/api'}/sprints/${sprintId}/complete`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
          },
        }
      );

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete sprint');
      }

      const updatedSprint = await response.json();

      // Update local state
      setSprints((prev) =>
        prev.map((s) =>
          s.id === sprintId ? { ...s, isActive: false, isCompleted: true } : s
        )
      );

      // Reload issues to reflect backlog changes
      await loadData();
    } catch (err: any) {
      console.error('Error completing sprint:', err);
      alert(err.message || 'Failed to complete sprint');
      await loadData(); // Revert on error
    }
  }, [loadData]);

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