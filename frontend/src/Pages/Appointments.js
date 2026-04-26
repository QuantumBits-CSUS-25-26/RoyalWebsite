import React, { useState } from 'react';
import ContactInfoS4 from "../Components/ContactInfoS4";
import AppStepOne from './AppointmentComponents/AppStepOne'
import AppStepTwo from "./AppointmentComponents/AppStepTwo";
import AppStepThree from './AppointmentComponents/AppStepThree'
import '../App.css';
import { API_BASE_URL } from "../config";

const Appointments = () => {
  const [contactInfo, setContactInfo] = useState({
    fname: '',
    lname: '',
    email: '',
    phone: '',
    notifPref: {
      email: false,
      text: false
    }
  });

  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  const [vehicleInfo, setVehicleInfo] = useState({
    year: '',
    manufacturer: '',
    model: '',
    license_plate: ''
  });

  const [appointment, setAppointment] = useState({
    selectedDate: null,
    selectedTime: null
  });

  const [vehicleErrors, setVehicleErrors] = useState({});
  const [submitError, setSubmitError] = useState('');
  const [submitSuccess, setSubmitSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  function handleFieldChange(e) {
    const { name, value } = e.target;
    setContactInfo((prev) => ({ ...prev, [name]: value }));
  }

  function handleNotifChange(e) {
    const { name, checked } = e.target;
    setContactInfo((prev) => ({
      ...prev,
      notifPref: {
        ...prev.notifPref,
        [name]: checked
      }
    }));
  }

  function handleVehicleChange(field, value) {
    setVehicleInfo((prev) => ({ ...prev, [field]: value }));
  }

  function handleSelectDate(date) {
    setAppointment((prev) => ({
      ...prev,
      selectedDate: date,
      selectedTime: null
    }));
  }

  function handleSelectTime(time) {
    setAppointment((prev) => ({ ...prev, selectedTime: time }));
  }

  function validateVehicle() {
    const errs = {};
    const plate = (vehicleInfo.license_plate || '').trim();

    if (!plate) {
      errs.license_plate = 'License plate is required.';
    } else if (!/^[A-Z0-9-]{1,10}$/i.test(plate)) {
      errs.license_plate = 'Invalid license plate format.';
    }

    setVehicleErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function formatLocalDate(date) {
    if (!date) return null;
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }

  function createAppointmentPayload() {
    return {
      contact: {
        first_name: contactInfo.fname.trim(),
        last_name: contactInfo.lname.trim(),
        email: contactInfo.email.trim(),
        phone: contactInfo.phone.trim(),
        notify_email: !!contactInfo.notifPref.email,
        notify_text: !!contactInfo.notifPref.text
      },
      vehicle: {
        year: vehicleInfo.year,
        manufacturer: vehicleInfo.manufacturer.trim(),
        model: vehicleInfo.model.trim(),
        license_plate: vehicleInfo.license_plate.trim()
      },
      appointment: {
        date: formatLocalDate(appointment.selectedDate),
        time: appointment.selectedTime
      },
      service_type: 'General Service'
    };
  }

  async function handleSubmit(e) {
    e.preventDefault();

    setSubmitError('');
    setSubmitSuccess('');

    if (!contactInfo.fname.trim() || !contactInfo.lname.trim() || !contactInfo.email.trim()) {
      setSubmitError('First name, last name, and email are required.');
      return;
    }

    if (!appointment.selectedDate || !appointment.selectedTime) {
      setSubmitError('Please select a date and time.');
      return;
    }

    if (!validateVehicle()) {
      setSubmitError('Please fix the vehicle information.');
      return;
    }

    const payload = createAppointmentPayload();
    const token = localStorage.getItem('authToken') || sessionStorage.getItem('authToken');

    setSubmitting(true);

    try {
      const response = await fetch(`${API_BASE_URL}/api/appointments/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json().catch(() => ({}));
      console.log('Appointment create response:', data);

      if (!response.ok) {
        throw new Error(
          data.detail ||
          data.scheduled_at?.[0] ||
          data.vehicle?.[0] ||
          'Failed to create appointment.'
        );
      }

      setSubmitSuccess('Appointment booked successfully.');

      setContactInfo({
        fname: '',
        lname: '',
        email: '',
        phone: '',
        notifPref: {
          email: false,
          text: false
        }
      });

      setVehicleInfo({
        year: '',
        manufacturer: '',
        model: '',
        license_plate: ''
      });

      setAppointment({
        selectedDate: null,
        selectedTime: null
      });

      setVehicleErrors({});
    } catch (err) {
      console.error('Appointment submit error:', err);
      setSubmitError(err.message || 'Something went wrong while booking the appointment.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="app-background">
      <AppStepOne
        vehicleInfo={vehicleInfo}
        onVehicleChange={handleVehicleChange}
        errors={vehicleErrors}
      />
      <AppStepTwo 
          contactInfo={contactInfo}
          onFieldChange={handleFieldChange}
          onNotifChange={handleNotifChange}
      />
      <AppStepThree
        selectedDate={appointment.selectedDate}
        selectedTime={appointment.selectedTime}
        onSelectDate={handleSelectDate}
        onSelectTime={handleSelectTime}
      />

      {submitError && (
        <div className="text-danger mb-3" role="alert">
          {submitError}
        </div>
      )}

      {submitSuccess && (
        <div className="text-success mb-3" role="status">
          {submitSuccess}
        </div>
      )}

      <ContactInfoS4
        contactInfo={contactInfo}
        onFieldChange={handleFieldChange}
        onNotifChange={handleNotifChange}
        onSubmit={handleSubmit}
        submitting={submitting}
      />
    </div>
  );
};

export default Appointments;