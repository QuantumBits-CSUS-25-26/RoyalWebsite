import React, { useState } from 'react';
import { Modal, ModalHeader, ModalBody, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { API_BASE_URL } from '../config';

const NewVehiclePopUp = ({ isOpen, onClose, onVehicleAdded }) =>{
  const [newVehicle, setNewVehicle] = useState({ make: '', model: '', year: '', license_plate: '' });
  const [vehicleError, setVehicleError] = useState('');
  const [addingVehicle, setAddingVehicle] = useState(false);

  const handleNewVehicleChange = (e) =>{
    const { name, value } = e.target;
    setNewVehicle((v) => ({ ...v, [name]: value }));
  };

  const handleAddVehicle = async (e) =>{
    e.preventDefault();
    setVehicleError('');
    setAddingVehicle(true);

    const token = localStorage.getItem('authToken');

    if (!token) {
      setVehicleError('You are not logged in. Please log in again.');
      setAddingVehicle(false);
      return;
    }

    try {
      const response = await fetch(`${API_BASE_URL}/api/vehicles/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          make: newVehicle.make,
          model: newVehicle.model,
          year: Number(newVehicle.year),
          license_plate: newVehicle.license_plate,
        })
      });

      const err = await response.json().catch(() => ({}));

      if (!response.ok){
        setVehicleError(err.detail || 'Failed to add vehicle.');
        setAddingVehicle(false);
        return;
      }

      setNewVehicle({ make: '', model: '', year: '', license_plate: '' });
      setAddingVehicle(false);
      if (onVehicleAdded) onVehicleAdded();
      if (onClose) onClose();
    } catch (err) {
      setVehicleError('Network error.');
      setAddingVehicle(false);
    }
  };

  return(
    <Modal isOpen={isOpen} toggle={onClose} size="md" backdrop="static" centered>
      <ModalHeader toggle={onClose}>Add New Vehicle</ModalHeader>
      <ModalBody>
        <Form onSubmit={handleAddVehicle}>
          <FormGroup>
            <Label for="make">Make</Label>
            <Input id="make" name="make" value={newVehicle.make} onChange={handleNewVehicleChange} required />
          </FormGroup>
          <FormGroup>
            <Label for="model">Model</Label>
            <Input id="model" name="model" value={newVehicle.model} onChange={handleNewVehicleChange} required />
          </FormGroup>
          <FormGroup>
            <Label for="year">Year</Label>
            <Input id="year" name="year" type="number" value={newVehicle.year} onChange={handleNewVehicleChange} required min="1900" max="2100" />
          </FormGroup>
          <FormGroup>
            <Label for="license_plate">License Plate</Label>
            <Input id="license_plate" name="license_plate" value={newVehicle.license_plate} onChange={handleNewVehicleChange} required />
          </FormGroup>
          {vehicleError && <div className="text-danger mb-2">{vehicleError}</div>}
          <div className="d-flex justify-content-end">
            <Button color="secondary" onClick={onClose} className="me-2" type="button">Cancel</Button>
            <Button color="primary" type="submit" disabled={addingVehicle}>{addingVehicle ? 'Adding...' : 'Add Vehicle'}</Button>
          </div>
        </Form>
      </ModalBody>
    </Modal>
  );
};

export default NewVehiclePopUp;
