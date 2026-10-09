import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchAdminMessages, markAdminMessageRead } from '../../redux/thunks/adminThunks';

const AdminMessages = () => {
  const dispatch = useDispatch();
  const { messages, messagesUnreadCount, loading, error } = useSelector((state) => state.admin);

  useEffect(() => {
    dispatch(fetchAdminMessages());
  }, [dispatch]);

  const handleMarkRead = (messageId) => {
    dispatch(markAdminMessageRead(messageId));
  };

  return (
    <div className="admin-messages-page">
      <h2>Messages ({messagesUnreadCount} unread)</h2>

      {loading && <p className="loading-text">Loading messages...</p>}
      {error && <p className="error-text">{error}</p>}

      {!loading && !error && messages.length === 0 && (
        <p className="empty-text">No messages yet.</p>
      )}

      {!loading && !error && messages.length > 0 && (
        <div className="admin-messages-list">
          {messages.map((msg) => (
            <div key={msg._id} className={`admin-message-card ${msg.isRead ? '' : 'unread'}`}>
              <div className="admin-message-header">
                <div>
                  <strong>{msg.subject}</strong>
                  <p className="admin-message-meta">{msg.name} ({msg.email}) — {new Date(msg.createdAt).toLocaleString('en-IN')}</p>
                </div>
                {!msg.isRead && (
                  <button type="button" onClick={() => handleMarkRead(msg._id)}>
                    Mark as Read
                  </button>
                )}
              </div>
              <p className="admin-message-body">{msg.message}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminMessages;