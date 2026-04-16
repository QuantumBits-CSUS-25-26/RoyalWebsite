import React from "react";
import "./AppStepOne.css";

const AppStepOne = ({ vehicleInfo = {}, onVehicleChange = () => {}, errors = {} }) => {
    const { year = '', manufacturer = '', model = '', license_plate = '' } = vehicleInfo;

    return (
        <div className="app-step-one">
            <h1>Vehicle Information</h1>

            <div className="vehicle-card">
                <div className="vehicle-form">
                <label>
                    Year
                    <input
                        type="text"
                        name="year"
                        value={year}
                        onChange={(e) => onVehicleChange('year', e.target.value)}
                        placeholder="e.g. 2020"
                    />
                </label>

                <label>
                    Manufacturer
                    <input
                        type="text"
                        name="manufacturer"
                        value={manufacturer}
                        onChange={(e) => onVehicleChange('manufacturer', e.target.value)}
                        placeholder="e.g. Toyota"
                    />
                </label>

                <label>
                    Model
                    <input
                        type="text"
                        name="model"
                        value={model}
                        onChange={(e) => onVehicleChange('model', e.target.value)}
                        placeholder="e.g. Camry"
                    />
                </label>

                <label>
                    License Plate
                    <input
                        type="text"
                        name="license_plate"
                        value={license_plate}
                        onChange={(e) => onVehicleChange('license_plate', e.target.value)}
                        placeholder="e.g. ABC1234"
                    />
                </label>
                {errors.license_plate && (
                    <div className="field-error" style={{color:'red', marginTop:6}}>
                        {errors.license_plate}
                    </div>
                )}
                </div>
            </div>
        </div>
    );
}

export default AppStepOne;