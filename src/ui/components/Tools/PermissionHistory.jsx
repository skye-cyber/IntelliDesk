import { useSelector, useDispatch } from 'react-redux';
import { clearHistory } from '../../store/toolPermissionsSlice';

export const PermissionHistory = () => {
  const dispatch = useDispatch();

  // Access different parts of Redux state
  const permissionHistory = useSelector(state => state.toolPermissions.permissionHistory);
  const trustedTools = useSelector(state => state.toolPermissions.trustedTools);
  const settings = useSelector(state => state.toolPermissions.settings);
  const theme = useSelector(state => state.ui.theme);
  const notifications = useSelector(state => state.ui.notifications);

  // Or use selectors for derived data
  const stats = useSelector(state => ({
    total: state.toolPermissions.permissionHistory.length,
    allowed: state.toolPermissions.permissionHistory.filter(p => p.decision?.includes('allow')).length,
    denied: state.toolPermissions.permissionHistory.filter(p => p.decision?.includes('deny')).length,
    autoApproved: state.toolPermissions.permissionHistory.filter(p => p.autoApproved).length
  }));
  return (
    <div className="p-4">
      <h2>Permission History ({stats.total})</h2>
      <div className="stats">
        <p>✅ Allowed: {stats.allowed}</p>
        <p>❌ Denied: {stats.denied}</p>
        <p>🤖 Auto-approved: {stats.autoApproved}</p>
      </div>

      <div className="trusted-tools">
        <h3>Trusted Tools</h3>
        {Object.entries(trustedTools).map(([tool, decision]) => (
          <div key={tool}>
            {tool}: {decision}
          </div>
        ))}
      </div>

      <div className="history-list">
        {permissionHistory.map(request => (
          <div key={request.id} className="request-item">
            <strong>{request.toolName}</strong> - {request.decision}
            <small> {new Date(request.timestamp).toLocaleString()}</small>
          </div>
        ))}
      </div>

      <button onClick={() => dispatch(clearHistory())}>
        Clear History
      </button>
    </div>
  );
};
