import React, { useState} from 'react';
import '../EmployeeManagementPopup.css';

export default function RemoveEmployeeForm({ visible, onClose, onRemove, employee = [] }) {
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

    const reset = () => {
      setSelectedId('');
      setError('');
    }
  

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select an employee to remove');
      return;
    }
    setConfirming(true);
  };

  const handleConfirm = () => {
    onRemove(Number(selectedId));
    setConfirming(false);
    reset();
    onClose();
  };

  const handleCancelConfirm = () => {
    setConfirming(false);
  };

  return (
    <div className="employee-overlay">
      <div className="employee-form">
        <h3>Remove Employee</h3>
        {error && <div className="error">{error}</div>}
        {!confirming ? (
          <form onSubmit={handleSubmit}>
            <div className="row">
              <select className="input" value={selectedId} onChange={e => setSelectedId(e.target.value)}>
                <option value="">-- Select employee --</option>
                {employee.map(emp => (
                  <option key={emp.id} value={emp.id}>{`${emp.id} - ${emp.name}`}</option>
                ))}
              </select>
            </div>
            <div className="actions">
              <button type="button" className="buttonGray" onClick={() => { setSelectedId(''); setError(''); onClose(); }}>Cancel</button>
              <button type="submit" className="buttonRed">Remove</button>
            </div>
          </form>
        ) : (
          <div>
            <p>Are you sure you want to remove <strong>{employee.find(e => String(e.id) === String(selectedId))?.name || ''}</strong> (ID: {selectedId})?</p>
            <div className="actions">
              <button type="button" className="buttonGray" onClick={handleCancelConfirm}>Cancel</button>
              <button type="button" className="buttonRed" onClick={handleConfirm}>Confirm Remove</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}