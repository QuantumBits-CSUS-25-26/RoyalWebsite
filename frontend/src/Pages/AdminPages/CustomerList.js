import AdminSideBar from "../../Components/AdminSideBar"


const DisplayCustomer = ({ customer }) => {
  const { name, email, phone, nextService, vehicleList, servicesList } = customer;
  return (
    <div className="customer-card">
      <h5 style={{ color: '#2F6DAB' }}>{name}</h5>
      <p>Email: <a href={`mailto:${email}`}>{email}</a></p>
      <p>Phone: <a href={`tel:${phone}`}>{phone}</a></p>
      {vehicleList && vehicleList.length > 0 && (
      <div className="dropdown">
        <button className="dropbtn">Vehicles</button>
        <div className="dropdown-content">
          {vehicleList.map((vehicle, index) => (
             <div key={index}>
              <p>Make: {vehicle.make} Model: {vehicle.model} Year: {vehicle.year}</p>
            </div>
          ))}
        </div>
      </div>
      )}
      {servicesList && servicesList.length > 0 && (
      <div className="dropdown">
        <button className="dropbtn">Service History</button>
        <div className="dropdown-content">
          {servicesList.map((service, index) => (
            <p key={index}>{service.date} - {service.type}</p>
          ))}
        </div>
      </div>
      )}
      {nextService && <p>Next Service: {nextService}</p>}
    </div>
  )
}

const sampleVehicleList1 = [
  { make: "Toyota", model: "Camry", year: 2018 },
  { make: "Honda", model: "Civic", year: 2020 },
  { make: "Ford", model: "F-150", year: 2019 }
];
const sampleVehicleList2 = [
  { make: "Chevrolet", model: "Malibu", year: 2017 },
];
const sampleServicesList1 = [
  { date: "2023-01-15", type: "Oil Change" },
  { date: "2023-03-10", type: "Tire Rotation" },
  { date: "2023-06-20", type: "Brake Inspection" }
];
const sampleServicesList2 = [
  { date: "2023-02-20", type: "Battery Replacement" },
  { date: "2023-05-15", type: "Wheel Alignment" }
];
const sampleCustomers = [
  { name: "John Doe", email: "john@example.com", phone: "123-456-7890", vehicleList: sampleVehicleList1, servicesList: sampleServicesList1 },
  { name: "Jane Smith", email: "jane@example.com", phone: "987-654-3210", vehicleList: sampleVehicleList1, servicesList: sampleServicesList1 },
  { name: "Bob Johnson", email: "bob@example.com", phone: "555-123-4567",  nextService: "2023-09-15", vehicleList: sampleVehicleList2, servicesList: sampleServicesList2 },
  { name: "Alice Brown", email: "alice@example.com", phone: "444-555-6666"},
  { name: "Charlie Davis", email: "charlie@example.com", phone: "333-222-1111",  nextService: "2023-11-05", vehicleList: sampleVehicleList1, servicesList: sampleServicesList1 },
  { name: "Emily Wilson", email: "emily@example.com", phone: "222-333-4444",  nextService: "2023-12-01", vehicleList: sampleVehicleList2, servicesList: sampleServicesList2 },
  { name: "David Lee", email: "david@example.com", phone: "111-222-3333", vehicleList: sampleVehicleList1 }
];

const CustomerList = () => {
  return (
    <div>
      <AdminSideBar />
      <div className="adminCustomers">
        <div className="admin-dashboard-header">
          <span className="admin-dashboard-title">Customer List</span>
        </div>
        <div className="customer-list">
          {sampleCustomers.map((customer, index) => (
            <DisplayCustomer key={index} customer={customer} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default CustomerList