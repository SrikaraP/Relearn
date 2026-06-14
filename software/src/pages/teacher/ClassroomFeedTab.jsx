import React, { useState } from 'react';
import { MessageSquare, Paperclip, Send, Calendar, CheckCircle } from 'lucide-react';

const ClassroomFeedTab = () => {
  const [posts, setPosts] = useState([
    {
      id: 1,
      type: 'announcement',
      author: 'You',
      time: '2 hours ago',
      content: 'Welcome to the new semester! Please ensure you have uploaded your recent notes so the AI can begin analyzing your knowledge gaps.',
      attachments: []
    },
    {
      id: 2,
      type: 'assignment',
      author: 'You',
      time: 'Yesterday',
      content: 'Chapter 4 Physics Assessment',
      dueDate: 'Friday, 11:59 PM',
      submissions: 12,
      totalStudents: 24,
      attachments: [{ name: 'Ch4_Practice.pdf', type: 'pdf' }]
    }
  ]);

  const [newPost, setNewPost] = useState('');

  const handlePost = (e) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    const post = {
      id: Date.now(),
      type: 'announcement',
      author: 'You',
      time: 'Just now',
      content: newPost,
      attachments: []
    };

    setPosts([post, ...posts]);
    setNewPost('');
  };

  return (
    <div className="classroom-feed animate-fade-in">
      <div className="tab-header mb-5">
        <h2 className="dashboard-title">Classroom Feed</h2>
        <p className="subtitle">Share announcements, assignments, and resources directly with your linked students.</p>
      </div>

      <div className="feed-container" style={{ maxWidth: '800px' }}>
        
        {/* Create Post Box */}
        <div className="create-post glass-panel mb-5 p-4">
          <form onSubmit={handlePost}>
            <textarea 
              className="form-control mb-3" 
              placeholder="Announce something to your class..."
              rows="3"
              value={newPost}
              onChange={(e) => setNewPost(e.target.value)}
              style={{ background: 'var(--bg-primary)', resize: 'none' }}
            ></textarea>
            <div className="flex-between">
              <button type="button" className="btn btn-outline btn-icon"><Paperclip size={18}/></button>
              <button type="submit" className="btn btn-primary" disabled={!newPost.trim()}><Send size={18} className="mr-2"/> Post</button>
            </div>
          </form>
        </div>

        {/* Feed Posts */}
        <div className="posts-list" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {posts.map(post => (
            <div key={post.id} className="post-card glass-panel p-4">
              <div className="post-header flex-align mb-3">
                <div className="avatar bg-primary text-white mr-3" style={{ width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  {post.author.charAt(0)}
                </div>
                <div>
                  <h4 className="mb-0">{post.author} <span className="text-secondary text-sm" style={{ fontWeight: 'normal' }}>posted a new {post.type}</span></h4>
                  <span className="text-xs text-secondary">{post.time}</span>
                </div>
              </div>

              <div className="post-content mb-3">
                <p>{post.content}</p>
                {post.dueDate && (
                  <div className="mt-3 p-3 glass-panel-alt flex-between" style={{ borderLeft: '4px solid var(--accent-primary)' }}>
                    <div>
                      <h5 className="mb-1 flex-align"><Calendar size={16} className="mr-2 text-accent" /> Due: {post.dueDate}</h5>
                      <span className="text-sm text-secondary">Make sure to grade via Assessment Engine.</span>
                    </div>
                    <div className="text-right">
                      <span className="text-2xl font-bold">{post.submissions}/{post.totalStudents}</span>
                      <span className="text-xs block text-secondary">Turned In</span>
                    </div>
                  </div>
                )}
              </div>

              {post.attachments && post.attachments.length > 0 && (
                <div className="post-attachments mt-3 pt-3 border-top flex-align gap-2">
                  {post.attachments.map((att, idx) => (
                    <div key={idx} className="badge badge-outline flex-align px-3 py-2">
                      <Paperclip size={14} className="mr-2" /> {att.name}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ClassroomFeedTab;
