import React, {useState} from 'react';
import ContactInfoS4 from "../Components/ContactInfoS4";
import React from 'react'
import AppStepOne from './AppointmentComponents/AppStepOne'
import AppStepThree from './AppointmentComponents/AppStepThree'

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
  function handleFieldChange(e){
    const {name, value} = e.target;
    setContactInfo(prev=> ({ ...prev, [name]: value}));
  }
  function handleNotifChange(e){
    const {name, checked} = e.target;
    setContactInfo(prev=> ({...prev, notifPref: {...prev.notifPref, [name]: checked}}))
  };
  function handleSubmit(e){
    console.log("Submitting: ", contactInfo);
  }
  return (
    <div>
      Appointments
      <AppStepOne />
      <AppStepThree />
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