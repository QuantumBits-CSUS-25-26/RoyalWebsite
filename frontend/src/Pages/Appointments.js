import React, {useState} from 'react';
import ContactInfoS4 from "../Components/ContactInfoS4";
import AppStepOne from './AppointmentComponents/AppStepOne'
import AppStepTwo from "./AppointmentComponents/AppStepTwo";
import AppStepThree from './AppointmentComponents/AppStepThree'
import '../App.css';
import { API_BASE_URL } from "../config";

const Appointments = () => {
  const [contactInfo, setContactInfo] = useState({
    fname:'',
    lname:'',
    email:'',
    phone:'',
    notifPref:{
      email:false,
      text:false
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

  function handleFieldChange(e){
    const {name, value} = e.target;
    setContactInfo(prev=> ({ ...prev, [name]: value}));
  }

  function handleNotifChange(e){
    const {name, checked} = e.target;
    setContactInfo(prev=> ({...prev, notifPref: {...prev.notifPref, [name]: checked}}))
  };

  function handleVehicleChange(field, value){
    setVehicleInfo(prev => ({...prev, [field]: value}));
  }

  function handleSelectDate(date){
    setAppointment(prev => ({...prev, selectedDate: date}));
  }

  function handleSelectTime(time){
    setAppointment(prev => ({...prev, selectedTime: time}));
  }

  function validateVehicle(){
    const errs = {};
    const plate = (vehicleInfo.license_plate || '').trim();
    if(!plate){
      errs.license_plate = 'License plate is required.';
    } else {
      // simple alphanumeric + hyphen validation, 1-10 chars
      const ok = /^[A-Z0-9-]{1,10}$/i.test(plate);
      if(!ok) errs.license_plate = 'Invalid license plate format.';
    }
    setVehicleErrors(errs);
    return Object.keys(errs).length === 0;
  }

  function createAppointmentPayload(){
    return {
      contact: {
        first_name: contactInfo.fname,
        last_name: contactInfo.lname,
        email: contactInfo.email,
        phone: contactInfo.phone,
        notify_email: !!contactInfo.notifPref.email,
        notify_text: !!contactInfo.notifPref.text
      },
      vehicle: {
        year: vehicleInfo.year,
        manufacturer: vehicleInfo.manufacturer,
        model: vehicleInfo.model,
        license_plate: vehicleInfo.license_plate
      },
      appointment: {
        date: appointment.selectedDate ? appointment.selectedDate.toISOString().split('T')[0] : null,
        time: appointment.selectedTime || null
      },
      // Step two from RW-61 was not merged in this version of main so 'General Service' will serve as a placeholder until merging can be resolved
      created_at: new Date().toISOString(),
      service_type: 'General Service'
    };
  }

  async function handleSubmit(e){
    if(e && e.preventDefault) e.preventDefault();
    // client-side validation
    const vehicleValid = validateVehicle();
    if(!vehicleValid){
      return; // stop submit
    }

    const payload = createAppointmentPayload();
    console.log('Submitting payload', payload);
    try{
      const res = await fetch(`${API_BASE_URL}/api/appointments/`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(payload)
      });
      if(!res.ok) throw new Error('Network response was not ok');
      const data = await res.json();
      console.log('Server response', data);
    }catch(err){
      console.error('Submit error', err);
    }
  }

  return (
    <div>
      Appointments
        <AppStepOne 
          vehicleInfo={vehicleInfo} 
          onVehicleChange={handleVehicleChange}
          errors={vehicleErrors} />
      <AppStepTwo 
          contactInfo={contactInfo}
          onFieldChange={handleFieldChange}
          onNotifChange={handleNotifChange}
      />
      <AppStepThree 
          selectedDate={appointment.selectedDate} 
          selectedTime={appointment.selectedTime} 
          onSelectDate={handleSelectDate} 
          onSelectTime={handleSelectTime} />
      <ContactInfoS4 
          contactInfo={contactInfo}
          onFieldChange={handleFieldChange}
          onNotifChange={handleNotifChange}
          onSubmit={handleSubmit}
      />
    </div>
  )
}

export default Appointments