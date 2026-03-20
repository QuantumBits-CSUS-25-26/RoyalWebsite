import AdminSideBar from "../../Components/AdminSideBar"
import {useState, useEffect} from 'react';
import AddEmployeeForm from "../EmployeeManagmentPopups/AddEmployee";
import RemoveEmployeeForm from "../EmployeeManagmentPopups/RemoveEmployee";
import EditEmployeeForm from "../EmployeeManagmentPopups/EditEmployee";
import '../EmployeeManagementPopup.css';

const DisplayEmployee = ({ employee }) => {
  const name = employee.name || `${employee.first_name || ''} ${employee.last_name || ''}`;
  const { email, phone } = employee;
  return (
    <div className="employee-card">
      <h5 style={{ color: '#2F6DAB' }}>{name}</h5>
      <p>Email: <a href={`mailto:${email}`}>{email}</a></p>
      <p>Phone: <a href={`tel:${phone}`}>{phone}</a></p>
    </div>
  )
}

const Management = () => {
    const[employees, setEmployees] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [showRemoveForm, setShowRemoveForm] = useState(false);
    const [showEditForm, setShowEditForm] = useState(false);

    useEffect(() => {
      console.log('Fetching employees...');
      fetch('/api/admin/employees/', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      })
      .then(async res => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || 'Failed to fetch employees');
        }
      const list = 
        Array.isArray(data) ? data :
        Array.isArray(data.employees) ? data.employees :
        Array.isArray(data.results) ? data.results :
        [];
      setEmployees(list);
      })
      .catch(err => {
        console.error('Failed to fetch employees:', err);
        setEmployees([]);
      });
    }, []);


    // Add employee via backend
    const handleAdd = (data) => {
      fetch('/api/admin/employees/create/', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          first_name: data.firstName,
          last_name: data.lastName,
          email: data.email,
          phone: data.phone,
          role: data.role || 'employee',
          password: data.password, 
        })
      })
      .then(res => {
        if (!res.ok) throw new Error('Failed to add employee');
        return res.json();
      })
      .then(newEmployee => {
        setEmployees(prev => [...prev, newEmployee]);
      })
      .catch(err => alert('Error adding employee: ' + err.message));
    };

    // Remove employee via backend
    const handleRemove = async (employeeId) => {
      const res = await fetch(`/api/admin/employees/${employeeId}/delete/`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });

    if (!res.ok) {
      let msg = 'Failed to remove employee';
      try {
        const data = await res.json();
        msg = data?.detail || data?.message || msg;
      } catch {}
      throw new Error(msg);
    }
    setEmployees(prev => prev.filter(e => (e.employee_id ?? e.id) !== employeeId));
    }
    

    // Edit employee via backend
    const handleEdit = async (employeeId, updatedData) => {
      const res = await fetch(`/api/admin/employees/${employeeId}/edit/`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(updatedData)
      });

      if (!res.ok) {
        let msg = 'Failed to edit employee';
        try {
          const data = await res.json();
          msg = data?.detail || data?.message || msg;
        } catch {}
        throw new Error(msg);
      }

      const updatedEmployee = await res.json();
      setEmployees(prev => prev.map(e => (e.employee_id ?? e.id) === employeeId ? updatedEmployee : e));
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
            <button onClick={() => setShowEditForm(true)} className="buttonPrimary">Edit Employee</button>
            <EditEmployeeForm visible={showEditForm} onClose={() => setShowEditForm(false)} onEdit={handleEdit} employee = {employees} />     
        </div>
    </div>
  )
}

export default Management