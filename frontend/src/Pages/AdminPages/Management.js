import AdminSideBar from "../../Components/AdminSideBar"
import {useState} from 'react';
import AddEmployeeForm from "../EmployeeManagmentPopups/AddEmployee";
import RemoveEmployeeForm from "../EmployeeManagmentPopups/RemoveEmployee";
import '../EmployeeManagementPopup.css';

const DisplayEmployee = ({ employee }) => {
    const { name, email, phone} = employee;
    return (
        <div className="employee-card">
            <h5 style={{ color: '#2F6DAB' }}>{name}</h5>
            <p>Email: <a href={`mailto:${email}`}>{email}</a></p>
            <p>Phone: <a href={`tel:${phone}`}>{phone}</a></p>
        </div>
    )
}

const Management = () => {
    const[employees, setEmployees] = useState([
    { id: 1, name: "John Doe", email: "john@example.com", phone: "123-456-7890" },
    { id: 2, name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210" },
    { id: 3, name: "Bob Johnson", email: "bob@example.com", phone: "555-123-4567" }
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
  };

  return (
    <div>
        <AdminSideBar />
        <div className='management'>
            <div className="admin-dashboard-header">
                <span className="admin-dashboard-title">Management</span>
            </div>
            <div className="employee-list">
                {employees.map((employee, index) => (
                    <DisplayEmployee key={index} employee={employee} />
                ))}
            </div>
            <button onClick={() => setShowAddForm(true)} className="buttonPrimary">Add Employee</button>
                  <AddEmployeeForm visible={showAddForm} onClose={() => setShowAddForm(false)} onAdd={handleAdd} />
            <button onClick={() => setShowRemoveForm(true)} className="buttonRed">Remove Employee</button>
            <RemoveEmployeeForm visible={showRemoveForm} onClose={() => setShowRemoveForm(false)} onRemove={handleRemove} employee = {employees} />
        </div>
    </div>
  )
}

export default Management