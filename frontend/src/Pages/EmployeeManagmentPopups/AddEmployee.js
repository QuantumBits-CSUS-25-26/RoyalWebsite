import React, { useState } from 'react';
import '../EmployeeManagementPopup.css';

export default function AddEmployeeForm({ visible, onClose, onAdd }) {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');

  if (!visible) return null;

  const reset = () => {
    setFirstName('');
    setLastName('');
    setPhone('');
    setEmail('');
    setPassword('');
    setConfirmPassword('');
    setError('');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!firstName || !lastName || !phone || !email || !password || !confirmPassword) {
      setError('Please fill all fields');
      return;
    }
    
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError('Please enter a valid email');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    
    const digits = phone.replace(/\D/g, '');
    if (digits.length !== 10) {
      setError('Phone number must be valid');
      return;
    }
    
    const formattedPhone = `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    onAdd({ firstName, lastName, phone: formattedPhone, email, password });
    reset();
    onClose();
  };

  return (
    <div className="employee-overlay">
      <div className="employee-form">
        <h3>Add New Employee</h3>
        {error && <div className="error">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="row">
            <input placeholder="First name" value={firstName} onChange={e => setFirstName(e.target.value)} className="input" />
            <input placeholder="Last name" value={lastName} onChange={e => setLastName(e.target.value)} className="input" />
          </div>
          <div className="row">
            <input placeholder="Phone Number e.g. (999) 555-1234" value={phone} onChange={e => setPhone(e.target.value)} className="input" />
          </div>
          <div className="row">
            <input placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="input" />
          </div>
          <div className="row">
            <input placeholder="Password" type="password" value={password} onChange={e => setPassword(e.target.value)} className="input" />
          </div>
            <div className="row">
            <input placeholder="Confirm Password" type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input" />
          </div>
          <div className="actions">
            <button type="button" onClick={() => { reset(); onClose(); }} className="buttonGray">Cancel</button>
            <button type="submit" className="buttonPrimary">Add</button>
          </div>
        </form>
      </div>
    </div>
  );
};
