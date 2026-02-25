import AdminSideBar from "../../Components/AdminSideBar"



const DisplayService = ({ service }) => {
  const { title, img, cost, description } = service;
  return (
    <div className="service-management-card">
      <h5 style={{ color: '#2F6DAB' }}>{title}</h5>
      <p>Cost: {cost}</p>
      <p>Description: {description}</p>
    </div>
  )
}


const sampleServices = {
  1: {
      title: "Oil Changes",
      cost: "$29.99",
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
  2: {
      title: "Brake Repairs",
      cost: "$29.99",
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
  3: {
      title: "Suspension Work",
      cost: "$49.99",
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
  4: {
      title: "Vehicle Inspections",
      cost: "$79.99",
      description: "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.",
  },
}


const ServicesManagement = () => {
  return (
    <div>
      <AdminSideBar />
      <div className="adminCustomers">
        <div className="admin-dashboard-header">
          <span className="admin-dashboard-title">Services Management</span>
        </div>
        <div className="service-management">
          {Object.values(sampleServices).map((service, index) => (
            //DisplayService
            <DisplayService key={index} service={service} />
          ))}
        </div>
      </div>
    </div>
  )
}

export default ServicesManagement