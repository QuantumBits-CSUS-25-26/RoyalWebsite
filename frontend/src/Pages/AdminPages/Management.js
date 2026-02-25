import AdminSideBar from "../../Components/AdminSideBar"

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

const sampleEmployees = [
    { name: "John Doe", email: "john@example.com", phone: "123-456-7890" },
    { name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210" },
    { name: "Bob Johnson", email: "bob@example.com", phone: "555-123-4567" }
];

const Management = () => {
  return (
    <div>
        <AdminSideBar />
        <div className='management'>
            <div className="admin-dashboard-header">
                <span className="admin-dashboard-title">Management</span>
            </div>
            <div className="employee-list">
                {sampleEmployees.map((employee, index) => (
                    <DisplayEmployee key={index} employee={employee} />
                ))}
            </div>
        </div>
    </div>
  )
}

export default Management