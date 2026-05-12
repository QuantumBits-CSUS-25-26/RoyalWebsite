import React, { useState, useEffect } from 'react';
import { Modal, ModalHeader, ModalBody, Button, FormGroup, Label, Input, Row, Col } from 'reactstrap';

import '../App.css';

const MAINTENANCE_SERVICES =[
    'Oil Change',
    'Tire Rotation',
    'Brake Inspection',
    'Battery Check',
    'Fluid Check',
];

const VehicleInfoPopup =({ isOpen, onClose, vehicles, appointments = [] }) =>{
    const vehicleList = vehicles && vehicles.length > 0 ? vehicles : [];
    const [selectedVehicleId, setSelectedVehicleId] = useState(vehicleList[0] ? String(vehicleList[0].vehicle_id) : '');

    useEffect(() => {
        if (vehicleList.length > 0) {
            setSelectedVehicleId(String(vehicleList[0].vehicle_id));
        } else {
            setSelectedVehicleId('');
        }
    }, [vehicleList]);

    const handleSelect = (e) => {
        setSelectedVehicleId(e.target.value);
    };

    const selectedVehicle = vehicleList.find(v => String(v.vehicle_id) === String(selectedVehicleId));
    const vehicleAppointments = appointments.filter(
        (appt) => appt.vehicle && String(appt.vehicle.vehicle_id) === String(selectedVehicleId)
    );

    return(
        <Modal isOpen={isOpen} toggle={onClose} size="lg" backdrop="static" centered className="vehicle-popup-modal">
            <ModalHeader>
                Customer Vehicles
                <button className="custom-close-btn" onClick={onClose} aria-label="Close" type="button">
                    ×
                </button>
            </ModalHeader>
            <ModalBody>
                <Row>
                    <Col md={5}>
                        <FormGroup>
                        <Label for="vehicleSelect">Select Vehicle</Label>
                        <Input
                            type="select"
                            id="vehicleSelect"
                            value={selectedVehicleId}
                            onChange={handleSelect}
                        >
                            {vehicleList.map((v) =>(
                            <option key={v.vehicle_id} value={String(v.vehicle_id)}>
                                {v.year} {v.make} {v.model} ({v.license_plate})
                            </option>
                            ))}
                        </Input>
                        </FormGroup>
                    </Col>
                    <Col md={7}>
                        {selectedVehicle ?(
                            <div className="vehicle-info">
                                <h5>Vehicle Information</h5>
                                <ul>
                                    <li><strong>Make:</strong> {selectedVehicle.make}</li>
                                    <li><strong>Model:</strong> {selectedVehicle.model}</li>
                                    <li><strong>Year:</strong> {selectedVehicle.year}</li>
                                    <li><strong>License Plate:</strong> {selectedVehicle.license_plate}</li>
                                </ul>
                                <div style={{ borderTop: '1px solid #eee', marginTop: 16, paddingTop: 8 }}>
                                    <h6>Service History</h6>
                                    {vehicleAppointments.length === 0 ? (
                                        <div>No service history for this vehicle.</div>
                                    ) : (
                                        <ul>
                                            {vehicleAppointments.map((appt, idx) =>(
                                                <li key={appt.id || idx}>
                                                    {appt.scheduled_at ? appt.scheduled_at.split('T')[0] : '-'}: {appt.service_type} {appt.cost ? `($${appt.cost})` : ''}
                                                </li>
                                            ))}
                                        </ul>
                                    )}
                                    <h6 className="mt-3">Maintenance Checklist</h6>
                                    <ul>
                                        {MAINTENANCE_SERVICES.map(service =>{
                                            const found = vehicleAppointments.some(
                                                h => h.service_type && h.service_type.toLowerCase().includes(service.toLowerCase())
                                            );
                                            return(
                                            <li key={service}>
                                                {found ? '✅' : '⚠️'} {service}
                                            </li>
                                            );
                                        })}
                                    </ul>
                                </div>
                            </div>
                        ) : (
                        <div>No vehicle selected.</div>
                        )}
                    </Col>
                </Row>
                <div className="d-flex justify-content-end mt-4">
                <Button color="secondary" onClick={onClose}>Close</Button>
                </div>
            </ModalBody>
        </Modal>
    );
};

export default VehicleInfoPopup;
