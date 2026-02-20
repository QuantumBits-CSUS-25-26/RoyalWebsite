import React, { useState } from 'react';
import './EmployeeManagementPopup.css';
import AddEmployeeForm from './EmployeeManagmentPopups/AddEmployee';
import RemoveEmployeeForm from './EmployeeManagmentPopups/RemoveEmployee';

const EmployeeManagementTest = () => {
  const [employees, setEmployees] = useState([
    { id: 1, name: 'Alice Johnson', phone: '(999)555-1234', email: 'alice@example.com' },
    { id: 2, name: 'Bob Newby', phone: '(999)555-5678', email: 'bob@example.com' },
    { id: 3, name: 'Charlie Brown', phone: '(999)555-9012', email: 'charlie@example.com' }
  ]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRemoveForm, setShowRemoveForm] = useState(false);

  const handleAdd = (data) => {
    const nextId = employees.length ? Math.max(...employees.map(e => e.id)) + 1 : 1;
    const newEmployee = {
      id: nextId,
      name: `${data.firstName} ${data.lastName}`,
      phone: data.phone,
      email: data.email,
      // Temporary password storage - be sure in real application to handle securely
      password: data.password,
    };
    setEmployees(prev => [...prev, newEmployee]);
  };
  const handleRemove = (employeeId) => {
    setEmployees(prev => prev.filter(e => e.id !== employeeId));
  }
  const formatPhone = (phone) => {
    if (!phone) return '';
    const digits = phone.toString().replace(/\D/g, '');
    if (digits.length === 10) return `(${digits.slice(0,3)}) ${digits.slice(3,6)}-${digits.slice(6)}`;
    return phone;
  };

  return (
    <div>
      <h1>Employee Management</h1>
      <button onClick={() => setShowAddForm(true)} className="buttonPrimary">Add Employee</button>
      <button onClick={() => setShowRemoveForm(true)} className="buttonRed">Remove Employee</button>
      <ul>
        {employees.map(employee => (
          <li key={employee.id} className="listItem">
            <div><strong>{employee.name}</strong></div>
            <div>{employee.position}</div>
            <div>{formatPhone(employee.phone) || ''} {employee.email ? `• ${employee.email}` : ''}</div>
          </li>
        ))}
      </ul>
      <AddEmployeeForm visible={showAddForm} onClose={() => setShowAddForm(false)} onAdd={handleAdd} />
      <RemoveEmployeeForm visible={showRemoveForm} onClose={() => setShowRemoveForm(false)} onRemove={handleRemove} employees={employees} />
    </div>
  );
};

export default EmployeeManagementTest;
