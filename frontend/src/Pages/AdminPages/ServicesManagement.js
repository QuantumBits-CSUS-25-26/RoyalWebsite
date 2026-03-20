import AdminSideBar from "../../Components/AdminSideBar"
import ServicesManagementDelete from "../../Components/ServicesManagementDelete"
import ServicesManagementAdd from "../../Components/ServicesManagementAdd"
import ServicesManagementUpdate from "../../Components/ServicesManagementUpdate"
import { useState, useEffect, useCallback } from "react";
import { API_BASE_URL } from '../../config';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';



const DragHandle = () => (
  <span className="service-drag-handle" title="Drag to reorder">
    ⠿
  </span>
);

const DisplayService = ({ service, index }) => {
  return (
    <Draggable draggableId={String(service.service_id)} index={index}>
      {(provided, snapshot) => (
        <div
          className={`service-management-card${snapshot.isDragging ? ' dragging' : ''}`}
          ref={provided.innerRef}
          {...provided.draggableProps}
        >
          <div className="service-card-content">
            <h5 style={{ color: '#2F6DAB' }}>{service.name}</h5>
            <p>Cost: {service.cost ? `$${service.cost}` : 'N/A'}</p>
            <p>Description: {service.description}</p>
          </div>
          <div {...provided.dragHandleProps}>
            <DragHandle />
          </div>
        </div>
      )}
    </Draggable>
  )
}


const ServicesManagement = () => {

  const [activeServices, setActiveServices] = useState([]);
  const [inactiveServices, setInactiveServices] = useState([]);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAddFormOpen, setIsAddFormOpen] = useState(false);
  const [isUpdateFormOpen, setIsUpdateFormOpen] = useState(false);

  const allServices = [...activeServices, ...inactiveServices];

  const fetchServices = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/services/?all=true`);
      if (res.ok) {
        const data = await res.json();
        setActiveServices(data.filter(s => s.is_active).sort((a, b) => a.display_order - b.display_order));
        setInactiveServices(data.filter(s => !s.is_active).sort((a, b) => a.display_order - b.display_order));
      }
    } catch (err) {
      console.error('Failed to fetch services:', err);
    }
  }, []);

  useEffect(() => {
    fetchServices();
  }, [fetchServices]);

  const persistService = async (serviceId, updates) => {
    try {
      await fetch(`${API_BASE_URL}/api/services/${serviceId}/`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
    } catch (err) {
      console.error('Failed to update service:', err);
    }
  };

  const onDragEnd = (result) => {
    const { source, destination } = result;
    if (!destination) return;

    const sourceList = source.droppableId === 'active' ? [...activeServices] : [...inactiveServices];
    const destList = destination.droppableId === source.droppableId
      ? sourceList
      : destination.droppableId === 'active' ? [...activeServices] : [...inactiveServices];

    const [moved] = sourceList.splice(source.index, 1);

    const newIsActive = destination.droppableId === 'active';
    moved.is_active = newIsActive;

    if (source.droppableId === destination.droppableId) {
      sourceList.splice(destination.index, 0, moved);

      const updated = sourceList.map((s, i) => ({ ...s, display_order: i }));
      if (destination.droppableId === 'active') {
        setActiveServices(updated);
      } else {
        setInactiveServices(updated);
      }

      updated.forEach(s => persistService(s.service_id, { display_order: s.display_order, is_active: s.is_active }));
    } else {
      destList.splice(destination.index, 0, moved);

      const updatedSource = sourceList.map((s, i) => ({ ...s, display_order: i }));
      const updatedDest = destList.map((s, i) => ({ ...s, display_order: i }));

      if (source.droppableId === 'active') {
        setActiveServices(updatedSource);
        setInactiveServices(updatedDest);
      } else {
        setInactiveServices(updatedSource);
        setActiveServices(updatedDest);
      }

      [...updatedSource, ...updatedDest].forEach(s =>
        persistService(s.service_id, { display_order: s.display_order, is_active: s.is_active })
      );
    }
  };

  const handleOpenForm = () => {
    setIsFormOpen(true);
  }
  const handleCloseForm = () => {
    setIsFormOpen(false);
  }

  return (
    <section className="admin-dashboard">
      <AdminSideBar />
      <div className="admin-dashboard-content ms-md-5">
        <div className="admin-dashboard-header">
          <span className="admin-dashboard-title">Services Management</span>
        </div>

        <DragDropContext onDragEnd={onDragEnd}>
          <div className="service-zones">
            <div className="service-zone">
              <h4 className="service-zone-label active-label">Active Services</h4>
              <Droppable droppableId="active">
                {(provided, snapshot) => (
                  <div
                    className={`service-management service-drop-area${snapshot.isDraggingOver ? ' drop-hover' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {activeServices.length === 0 && (
                      <p className="service-zone-empty">Drag services here to activate them</p>
                    )}
                    {activeServices.map((service, index) => (
                      <DisplayService key={service.service_id} service={service} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>

            <div className="service-zone">
              <h4 className="service-zone-label inactive-label">Inactive Services</h4>
              <Droppable droppableId="inactive">
                {(provided, snapshot) => (
                  <div
                    className={`service-management service-drop-area inactive-area${snapshot.isDraggingOver ? ' drop-hover' : ''}`}
                    ref={provided.innerRef}
                    {...provided.droppableProps}
                  >
                    {inactiveServices.length === 0 && (
                      <p className="service-zone-empty">Drag services here to deactivate them</p>
                    )}
                    {inactiveServices.map((service, index) => (
                      <DisplayService key={service.service_id} service={service} index={index} />
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </div>
          </div>
        </DragDropContext>

        <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
          <button
            className="service-management-add-button"
            onClick={() => setIsAddFormOpen(true)}
            >
              Add Service
            </button>
          <button
            className="service-management-update-button"
            onClick={() => setIsUpdateFormOpen(true)}
            >
              Update Service
            </button>
          <button
            className="service-management-delete-button"
            onClick={handleOpenForm}
            >
              Delete Service
            </button>
        </div>
        <ServicesManagementAdd
          isOpen={isAddFormOpen}
          onClose={() => setIsAddFormOpen(false)}
          onServiceAdded={() => fetchServices()}
          services={allServices}
        />
        <ServicesManagementUpdate
          isOpen={isUpdateFormOpen}
          onClose={() => setIsUpdateFormOpen(false)}
          services={allServices}
          onServiceUpdated={() => fetchServices()}
        />
        <ServicesManagementDelete
          isOpen={isFormOpen}
          onClose={handleCloseForm}
          services={allServices}
          onServiceDeleted={() => fetchServices()}
        />
      </div>
    </section>
  )
}

export default ServicesManagement