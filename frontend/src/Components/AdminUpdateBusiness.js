import {
  Button,
  Modal,
  ModalHeader,
  ModalBody,
  ModalFooter,
  Form,
  FormGroup,
  Label,
  Input,
} from "reactstrap";
import { useEffect, useState } from "react";
import { API_BASE_URL } from "../config";

const AdminUpdateBusiness = ({
  visible,
  onClose,
  businessInfo,
  setBusinessInfo,
}) => {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    email: "",
    hours: "",
    address: "",
  });

  useEffect(() => {
    setFormData({
      name: businessInfo?.name || "",
      phone: businessInfo?.phone || "",
      email: businessInfo?.email || "",
      hours: businessInfo?.hours || "",
      address: businessInfo?.address || "",
    });
  }, [businessInfo, visible]);

  const handleChange = (e) => {
    const { id, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [id]: value,
    }));
  };

  const handleSave = async () => {
    if (!businessInfo || !businessInfo.info_id) {
      console.error("Business info is missing or invalid:", businessInfo);
      return;
    }
    try {
      const token = localStorage.getItem("token");

      const response = await fetch(
        `${API_BASE_URL}/api/business-info/${businessInfo.info_id}/`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            // Authorization: `Bearer ${token}`
          },
          body: JSON.stringify(formData),
        },
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Update failed:", errorData);
        return;
      }

      const updatedData = await response.json();
      setBusinessInfo(updatedData[0]);
      onClose();
    } catch (error) {
      console.error("Error updating business information:", error);
    }
  };

  return (
    <Modal isOpen={visible} toggle={onClose}>
      <ModalHeader>Edit Business Information</ModalHeader>
      <ModalBody>
        <Form>
          <FormGroup>
            <Label for="name">Business Name</Label>
            <Input
              type="text"
              id="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="Enter business name"
            />
          </FormGroup>
          <FormGroup>
            <Label for="phone">Phone Number</Label>
            <Input
              type="text"
              id="phone"
              value={formData.phone}
              onChange={handleChange}
              placeholder="Enter business phone number"
            />
          </FormGroup>
          <FormGroup>
            <Label for="email">Email</Label>
            <Input
              type="email"
              id="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter business email"
            />
          </FormGroup>
          <FormGroup>
            <Label for="hours">Hours</Label>
            <Input
              type="text"
              id="hours"
              value={formData.hours}
              onChange={handleChange}
              placeholder="Enter business hours"
            />
          </FormGroup>
          <FormGroup>
            <Label for="address">Address</Label>
            <Input
              type="text"
              id="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Enter business address"
            />
          </FormGroup>
        </Form>
      </ModalBody>
      <ModalFooter>
        <Button color="secondary" onClick={onClose}>
          Cancel
        </Button>
        <Button color="primary" onClick={handleSave}>
          Save Changes
        </Button>
      </ModalFooter>
    </Modal>
  );
};

export default AdminUpdateBusiness;
