import React, { useState, useEffect } from 'react';
import { X, Save, Trash2, Link as LinkIcon, Paperclip, Send, MessageSquare, Play, CheckCircle, RotateCcw } from 'lucide-react';
import { useProject } from '../context/ProjectContext';
import { Issue, IssueType, Priority, Status, Comment } from '../types';
import { PriorityIcon, TypeIcon } from './ui/Icons';

interface IssueModalProps {
  isOpen: boolean;
  onClose: () => void;
  issueId?: string; // If present, edit mode. If null, create mode.
  initialStatus?: Status;
}

const IssueModal: React.FC<IssueModalProps> = ({ isOpen, onClose, issueId, initialStatus }) => {
  const { issues, users, createIssue, updateIssue, updateIssueStatus, deleteIssue, addComment, currentUser, sprints, currentProjectId } = useProject();
  const isViewer = currentUser?.role === 'VIEWER';

  // TEMPORARY: Loading states - improve in Phase 7
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isAddingComment, setIsAddingComment] = useState(false);

  const [formData, setFormData] = useState<Partial<Issue>>({
    title: '',
    description: '',
    type: 'Story',
    priority: 'Medium',
    status: initialStatus || 'To Do',
    assigneeId: '',
    storyPoints: 0,
    sprintId: '',
    linkedIssueIds: [],
    comments: [],
  });

  const [newComment, setNewComment] = useState('');

  const activeSprint = sprints.find(s => s.isActive)?.id;

  useEffect(() => {
    if (isOpen) {
      if (issueId) {
        const existingIssue = issues.find(i => i.id === issueId);
        if (existingIssue) {
          setFormData(JSON.parse(JSON.stringify(existingIssue))); // Deep copy to prevent mutating context directly
        }
      } else {
        setFormData({
          title: '',
          description: '',
          type: 'Story',
          priority: 'Medium',
          status: initialStatus || 'To Do',
          assigneeId: currentUser.id,
          storyPoints: 1,
          sprintId: activeSprint,
          linkedIssueIds: [],
          comments: [],
        });
      }
      setNewComment('');
    }
  }, [isOpen, issueId, issues, initialStatus, currentUser, activeSprint]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.title?.trim()) {
      alert('Title is required');
      return;
    }

    setIsSubmitting(true);
    try {
      if (issueId && formData.id) {
        await updateIssue({ ...formData, updatedAt: new Date().toISOString() } as Issue);
      } else {
        // Ensure projectId is set when creating
        if (!formData.projectId && currentProjectId) {
          formData.projectId = currentProjectId;
        }
        await createIssue(formData);
      }
      onClose();
    } catch (error: any) {
      console.error('Error saving issue:', error);
      alert(error.message || 'Failed to save issue. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (newStatus: Status) => {
    if (!issueId) return;
    setIsSubmitting(true);
    try {
      await updateIssueStatus(issueId, newStatus);
      // Update local state to reflect change immediately in the modal
      setFormData(prev => ({ ...prev, status: newStatus }));
    } catch (error) {
      console.error('Error updating status:', error);
      alert('Failed to update status');
    } finally {
      setIsSubmitting(false);
    }
  };

  // TEMPORARY: Async delete handler - add proper confirmation dialog in Phase 8
  const handleDelete = async () => {
    if (!issueId) return;

    if (!confirm('Are you sure you want to delete this issue? This action cannot be undone.')) {
      return;
    }

    setIsDeleting(true);
    try {
      await deleteIssue(issueId);
      onClose();
    } catch (error) {
      console.error('Error deleting issue:', error);
      alert('Failed to delete issue. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleLinkIssue = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedId = e.target.value;
    if (selectedId && !formData.linkedIssueIds?.includes(selectedId)) {
      setFormData({
        ...formData,
        linkedIssueIds: [...(formData.linkedIssueIds || []), selectedId]
      });
    }
    e.target.value = ''; // Reset select
  };

  const handleUnlinkIssue = (idToRemove: string) => {
    setFormData({
      ...formData,
      linkedIssueIds: formData.linkedIssueIds?.filter(id => id !== idToRemove)
    });
  };

  // TEMPORARY: Async comment handler - use API instead of local state
  const handleAddComment = async () => {
    if (!newComment.trim() || !formData.id) return;

    setIsAddingComment(true);
    try {
      await addComment(formData.id, newComment);

      // TEMPORARY: Update local formData to show new comment immediately
      // This will be replaced by refetching the issue in Phase 4
      const comment: Comment = {
        id: `c${Date.now()}`,
        userId: currentUser.id,
        content: newComment,
        createdAt: new Date().toISOString()
      };

      setFormData({
        ...formData,
        comments: [...(formData.comments || []), comment]
      });
      setNewComment('');
    } catch (error) {
      console.error('Error adding comment:', error);
      alert('Failed to add comment. Please try again.');
    } finally {
      setIsAddingComment(false);
    }
  };

  // Get eligible issues for linking (exclude current issue and already linked)
  const linkableIssues = issues.filter(i => i.id !== formData.id && !formData.linkedIssueIds?.includes(i.id));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-100 bg-white z-10">
          <div className="flex items-center space-x-3">
            {formData.type && <TypeIcon type={formData.type as IssueType} />}
            <h2 className="text-xl font-semibold text-gray-800">
              {issueId ? formData.key : 'Create Issue'}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            {issueId && !isViewer && (
              <button
                onClick={handleDelete}
                disabled={isDeleting || isSubmitting}
                className="p-2 text-red-500 hover:bg-red-50 rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                title={isDeleting ? 'Deleting...' : 'Delete Issue'}
              >
                <Trash2 size={20} className={isDeleting ? 'animate-pulse' : ''} />
              </button>
            )}
            <button onClick={onClose} className="p-2 text-gray-500 hover:bg-gray-100 rounded-md transition-colors">
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8">
          <form id="issue-form" onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">

            {/* Left Column: Main Details */}
            <div className="lg:col-span-2 space-y-6">
              <div className="space-y-4">
                <input
                  type="text"
                  required
                  className="w-full text-2xl font-semibold placeholder-gray-400 border-none focus:ring-0 p-0 text-slate-900"
                  placeholder="Issue Summary"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                  <textarea
                    rows={6}
                    className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-shadow text-sm leading-relaxed"
                    placeholder="Add a description..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  />
                </div>

                {/* Attachments Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Attachments</label>
                  <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors cursor-pointer">
                    <Paperclip className="text-gray-400 mb-2" size={24} />
                    <span className="text-sm text-gray-500">Drop files to attach, or <span className="text-blue-600">browse</span></span>
                  </div>
                </div>

                {/* Linked Issues Section */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Linked Issues</label>
                  <div className="space-y-2">
                    {formData.linkedIssueIds?.map(linkedId => {
                      const linkedIssue = issues.find(i => i.id === linkedId);
                      if (!linkedIssue) return null;
                      return (
                        <div key={linkedId} className="flex items-center justify-between p-3 bg-gray-50 border border-gray-200 rounded-md">
                          <div className="flex items-center space-x-3">
                            <TypeIcon type={linkedIssue.type} className="w-4 h-4" />
                            <span className="text-sm font-medium text-gray-500 strike-through">{linkedIssue.key}</span>
                            <span className="text-sm text-gray-800 line-through-if-done">{linkedIssue.title}</span>
                            <span className={`text-[10px] px-2 py-0.5 rounded-full uppercase font-bold tracking-wide ${linkedIssue.status === 'Done' ? 'bg-green-100 text-green-700' : 'bg-gray-200 text-gray-700'}`}>
                              {linkedIssue.status}
                            </span>
                          </div>
                          <button type="button" onClick={() => handleUnlinkIssue(linkedId)} className="text-gray-400 hover:text-red-500">
                            <X size={16} />
                          </button>
                        </div>
                      );
                    })}

                    <div className="relative">
                      <LinkIcon className="absolute left-3 top-2.5 text-gray-400 w-4 h-4" />
                      <select
                        className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white cursor-pointer"
                        onChange={handleLinkIssue}
                      >
                        <option value="">Link an issue...</option>
                        {linkableIssues.map(i => (
                          <option key={i.id} value={i.id}>{i.key}: {i.title}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Comments Section */}
                {issueId && (
                  <div className="pt-6 border-t border-gray-100">
                    <h3 className="text-sm font-medium text-gray-700 mb-4 flex items-center">
                      <MessageSquare size={16} className="mr-2" />
                      Comments
                    </h3>

                    <div className="space-y-6 mb-6">
                      {formData.comments?.map(comment => {
                        const commentUser = users.find(u => u.id === comment.userId) || currentUser;
                        return (
                          <div key={comment.id} className="flex space-x-3">
                            <img src={commentUser.avatarUrl} alt={commentUser.name} className="w-8 h-8 rounded-full" />
                            <div>
                              <div className="flex items-center space-x-2 mb-1">
                                <span className="text-sm font-semibold text-gray-900">{commentUser.name}</span>
                                <span className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleString()}</span>
                              </div>
                              <p className="text-sm text-gray-700 leading-relaxed">{comment.content}</p>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex space-x-3">
                      <img src={currentUser.avatarUrl} alt="Me" className="w-8 h-8 rounded-full" />
                      <div className="flex-1">
                        <textarea
                          className="w-full border border-gray-200 rounded-md p-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 min-h-[80px]"
                          placeholder="Add a comment..."
                          value={newComment}
                          onChange={(e) => setNewComment(e.target.value)}
                        />
                        <div className="flex justify-end mt-2">
                          <button
                            type="button"
                            onClick={handleAddComment}
                            disabled={!newComment.trim()}
                            className="px-3 py-1.5 bg-gray-100 text-gray-600 text-xs font-medium rounded-md hover:bg-gray-200 disabled:opacity-50 transition-colors"
                          >
                            Comment
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column: Meta Details */}
            <div className="lg:col-span-1 space-y-6">
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-100 space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Status</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value as Status })}
                  >
                    <option value="To Do">To Do</option>
                    <option value="In Progress">In Progress</option>
                    <option value="In Review">In Review</option>
                    <option value="Done">Done</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Assignee</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.assigneeId || ''}
                    onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })}
                  >
                    <option value="">Unassigned</option>
                    {users.map((u) => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Priority</label>
                  <div className="relative">
                    <select
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      value={formData.priority}
                      onChange={(e) => setFormData({ ...formData, priority: e.target.value as Priority })}
                    >
                      <option value="Highest">Highest</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                      <option value="Lowest">Lowest</option>
                    </select>
                    <div className="absolute left-3 top-2.5 pointer-events-none">
                      <PriorityIcon priority={formData.priority as Priority} className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Issue Type</label>
                  <div className="relative">
                    <select
                      className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 appearance-none bg-white"
                      value={formData.type}
                      onChange={(e) => setFormData({ ...formData, type: e.target.value as IssueType })}
                    >
                      <option value="Story">Story</option>
                      <option value="Task">Task</option>
                      <option value="Bug">Bug</option>
                      <option value="Epic">Epic</option>
                    </select>
                    <div className="absolute left-3 top-2.5 pointer-events-none">
                      <TypeIcon type={formData.type as IssueType} className="w-4 h-4" />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Story Points</label>
                  <input
                    type="number"
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    value={formData.storyPoints}
                    onChange={(e) => setFormData({ ...formData, storyPoints: parseInt(e.target.value) || 0 })}
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Sprint</label>
                  <select
                    className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    value={formData.sprintId || ''}
                    onChange={(e) => setFormData({ ...formData, sprintId: e.target.value })}
                  >
                    <option value="">Backlog</option>
                    {sprints.map((s) => (
                      <option key={s.id} value={s.id}>{s.name} {s.isActive ? '(Active)' : ''}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="text-xs text-gray-400 space-y-1 p-2">
                <p>Created {formData.createdAt ? new Date(formData.createdAt).toLocaleDateString() : 'Now'}</p>
                <p>Updated {formData.updatedAt ? new Date(formData.updatedAt).toLocaleDateString() : 'Now'}</p>
              </div>
            </div>
          </form>
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-gray-100 bg-white flex justify-between items-center">
          {/* Workflow Actions */}
          <div className="flex items-center space-x-2">
            {issueId && !isViewer && (
              <>
                {formData.status === 'To Do' && (
                  <button
                    onClick={() => handleStatusChange('In Progress')}
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-blue-700 bg-blue-50 rounded-md hover:bg-blue-100 border border-blue-200"
                    title="Start working on this issue"
                  >
                    <Play size={16} className="mr-2" />
                    Start Work
                  </button>
                )}

                {formData.status === 'In Progress' && (
                  <button
                    onClick={() => handleStatusChange('In Review')}
                    disabled={isSubmitting}
                    className="flex items-center px-4 py-2 text-sm font-medium text-purple-700 bg-purple-50 rounded-md hover:bg-purple-100 border border-purple-200"
                    title="Submit for review"
                  >
                    <Send size={16} className="mr-2" />
                    Submit for Review
                  </button>
                )}

                {formData.status === 'In Review' && (
                  // Only Admins, PMs, or the Reporter can review
                  (currentUser.role === 'ADMIN' || currentUser.role === 'PROJECT_MANAGER' || currentUser.id === formData.reporterId) && (
                    <>
                      <button
                        onClick={() => handleStatusChange('In Progress')}
                        disabled={isSubmitting}
                        className="flex items-center px-3 py-2 text-sm font-medium text-orange-700 bg-orange-50 rounded-md hover:bg-orange-100 border border-orange-200"
                        title="Request changes and move back to In Progress"
                      >
                        <RotateCcw size={16} className="mr-2" />
                        Request Changes
                      </button>
                      <button
                        onClick={() => handleStatusChange('Done')}
                        disabled={isSubmitting}
                        className="flex items-center px-4 py-2 text-sm font-medium text-green-700 bg-green-50 rounded-md hover:bg-green-100 border border-green-200"
                        title="Approve and mark as Done"
                      >
                        <CheckCircle size={16} className="mr-2" />
                        Approve
                      </button>
                    </>
                  )
                )}

                {formData.status === 'Done' && (
                  <button
                    onClick={() => handleStatusChange('To Do')}
                    disabled={isSubmitting}
                    className="flex items-center px-3 py-2 text-sm font-medium text-gray-700 bg-gray-50 rounded-md hover:bg-gray-100 border border-gray-200"
                    title="Reopen issue"
                  >
                    <RotateCcw size={16} className="mr-2" />
                    Reopen
                  </button>
                )}
              </>
            )}
          </div>

          <div className="flex items-center">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isDeleting}
              className="px-4 py-2 mr-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isViewer ? 'Close' : 'Cancel'}
            </button>
            {!isViewer && (
              <button
                onClick={handleSubmit}
                type="button"
                disabled={isSubmitting || isDeleting}
                className="flex items-center px-6 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Save size={16} className={`mr-2 ${isSubmitting ? 'animate-pulse' : ''}`} />
                {isSubmitting ? 'Saving...' : (issueId ? 'Save Changes' : 'Create Issue')}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default IssueModal;