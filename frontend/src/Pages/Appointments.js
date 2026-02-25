import React, { useState } from "react";
import AppStepOne from "./AppointmentComponents/AppStepOne";
import AppStepTwo from "./AppointmentComponents/AppStepTwo";
import AppStepThree from "./AppointmentComponents/AppStepThree";

const Appointments = () => {
  const [step, setStep] = useState(1);
  const [selectedServiceId, setSelectedServiceId] = useState("");

  return (
    <div>
      {step === 1 && <AppStepOne onNext={() => setStep(2)} />}

      {step === 2 && (
        <AppStepTwo
          selectedServiceId={selectedServiceId}
          setSelectedServiceId={setSelectedServiceId}
          onBack={() => setStep(1)}
          onNext={() => setStep(3)}
        />
      )}

      {step === 3 && (
        <AppStepThree
          selectedServiceId={selectedServiceId}
          onBack={() => setStep(2)}
        />
      )}
    </div>
  );
};

export default Appointments;
