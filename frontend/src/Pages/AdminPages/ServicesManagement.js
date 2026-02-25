import AdminSideBar from "../../Components/AdminSideBar"
import ServicesManagementDelete from "../../Components/ServicesManagementDelete"
import ServicesManagementAdd from "../../Components/ServicesManagementAdd"
import { useState, useEffect } from "react";
import { API_BASE_URL } from '../../config';



const DisplayService = ({ service }) => {
  return (
    <div className="service-management-card">
      <h5 style={{ color: '#2F6DAB' }}>{service.name}</h5>
      <p>Cost: {service.cost ? `$${service.cost}` : 'N/A'}</p>
      <p>Description: {service.description}</p>
    </div>
  )
}


const ServicesManagement = () => {

  const [services, setServices] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);

  const fetchServices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/`);
      if (res.ok) {
        const data = await res.json();
        setServices(data);
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  };

  useEffect(() => {
    fetchServices();
  }, []);

  const handleOpenForm = () => {
    setIsFormOpen(true);
  }
  const handleCloseForm = () => {
    setIsFormOpen(false);
  }

  return (
    <div>
      <AdminSideBar />
      <div className="adminCustomers">
        <div className="admin-dashboard-header">
          <span className="admin-dashboard-title">Services Management</span>
        </div>
        <div className="service-management">
          {services.map((service) => (
            <DisplayService key={service.service_id} service={service} />
          ))}
        </div>
        <button
          className="service-management-add-button"
          onClick={() => setIsAddFormOpen(true)}
          >
            Add Service
          </button>
        <button
          className="service-management-delete-button"
          onClick={handleOpenForm}
          >
            Delete Service
          </button>
        <ServicesManagementAdd
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
          onServiceAdded={() => fetchServices()}
        />
        <ServicesManagementDelete
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          services={services}
          onServiceDeleted={() => fetchServices()}
        />
      </div>
    </div>
  )
}

export default ServicesManagement