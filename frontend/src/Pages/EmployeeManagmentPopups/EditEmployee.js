import React, { useMemo, useState } from 'react';
import '../EmployeeManagementPopup.css';

export default function EditEmployeeForm({ visible, onClose, onEdit, employee = [] }) {
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
      setError('Please select an employee to edit');
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
        await onEdit(Number(selectedId), {
            first_name: document.querySelector('input[placeholder="First name"]').value,
            last_name: document.querySelector('input[placeholder="Last name"]').value,
            phone: document.querySelector('input[placeholder="Phone Number e.g. (999) 555-1234"]').value,
            email: document.querySelector('input[placeholder="Email"]').value,
        });
        reset();
        onClose();
    } catch (err) {
        // only works if onEdit throws; see note below
        setError(err?.message || 'Failed to edit employee');
        setConfirming(false);
    }
  };

  return (
    <div className="employee-overlay">
      <div className="employee-form">
        <h3>Edit Employee</h3>

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
                Update
              </button>
            </div>
          </form>
        ) : (
          <div>
            <p>Editing employee: {selectedEmp?._displayName || selectedEmp?.email || ''}</p>
            {
                <div className="employee-form">
                    <div className="row">
                        <input placeholder="First name" defaultValue={selectedEmp?.first_name} className="input" />
                        <input placeholder="Last name" defaultValue={selectedEmp?.last_name} className="input" />
                    </div>
                    <div className="row">
                        <input placeholder="Phone Number e.g. (999) 555-1234" defaultValue={selectedEmp?.phone} className="input" />
                    </div>
                    <div className="row">
                        <input placeholder="Email" defaultValue={selectedEmp?.email} className="input" />
                    </div>
                </div>
            }
            <div className="actions">
                <button
                  type="button"
                  className="buttonGray"
                  onClick={() => setConfirming(false)}
                >
                  Cancel
                </button>
                <button type="button" className="buttonRed" onClick={handleConfirm}>
                  Confirm Update
                </button>
              </div>
          </div>
        )}
      </div>
    </div>
  );
}