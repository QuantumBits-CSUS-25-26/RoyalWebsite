import React, { useMemo, useState } from 'react';
import '../EmployeeManagementPopup.css';

export default function RemoveEmployeeForm({ visible, onClose, onRemove, employee = [] }) {
  const [selectedId, setSelectedId] = useState('');
  const [error, setError] = useState('');
  const [confirming, setConfirming] = useState(false);

  const normalizedEmployees = useMemo(() => {
    return (Array.isArray(employee) ? employee : []).map((emp) => {
      const id = emp.employee_id ?? emp.id;
      const name =
        emp.name ??
        `${emp.first_name ?? ''} ${emp.last_name ?? ''}`.trim() ??
        '';
      return { ...emp, _id: id, _displayName: name };
    });
  }, [employee]);

  const reset = () => {
    setSelectedId('');
    setError('');
    setConfirming(false);
  };

  if (!visible) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!selectedId) {
      setError('Please select an employee to remove');
      return;
    }
    setError('');
    setConfirming(true);
  };

  const selectedEmp = normalizedEmployees.find(
    (e) => String(e._id) === String(selectedId)
  );

  const handleConfirm = async () => {
    if (!selectedId) return;

    try {
      // IMPORTANT: pass the real id to your parent
      await onRemove(Number(selectedId));
      reset();
      onClose();
    } catch (err) {
      // only works if onRemove throws; see note below
      setError(err?.message || 'Failed to remove employee');
      setConfirming(false);
    }
  };

  return (
    <div className="employee-overlay">
      <div className="employee-form">
        <h3>Remove Employee</h3>

        {error && <div className="error">{error}</div>}

        {!confirming ? (
          <form onSubmit={handleSubmit}>
            <div className="row">
              <select
                className="input"
                value={selectedId}
                onChange={(e) => setSelectedId(e.target.value)}
              >
                <option value="">-- Select employee --</option>

                {normalizedEmployees.map((emp) => (
                  <option key={emp._id} value={emp._id}>
                    {`${emp._id} - ${emp._displayName || emp.email || ''}`}
                  </option>
                ))}
              </select>
            </div>

            <div className="actions">
              <button
                type="button"
                className="buttonGray"
                onClick={() => {
                  reset();
                  onClose();
                }}
              >
                Cancel
              </button>
              <button type="submit" className="buttonRed">
                Remove
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p>
              Are you sure you want to remove{' '}
              <strong>{selectedEmp?._displayName || ''}</strong> (ID: {selectedId})?
            </p>
            <div className="actions">
              <button type="button" className="buttonGray" onClick={() => setConfirming(false)}>
                Cancel
              </button>
              <button type="button" className="buttonRed" onClick={handleConfirm}>
                Confirm Remove
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}