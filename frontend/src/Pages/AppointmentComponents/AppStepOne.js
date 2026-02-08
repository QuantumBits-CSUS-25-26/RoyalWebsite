import React, { useState } from "react";
import "./AppStepOne.css";


const AppStepOne = () => {
    const [year, setYear] = useState("");
    const [manufacturer, setManufacturer] = useState("");
    const [model, setModel] = useState("");
    const [engine, setEngine] = useState("");

    return (
        <div className="app-step-one">
            <h1>Step 1. Vehicle Information</h1>

            <div className="vehicle-card">
                <div className="vehicle-form">
                <label>
                    Year
                    <input
                        type="text"
                        name="year"
                        value={year}
                        onChange={(e) => setYear(e.target.value)}
                        placeholder="e.g. 2020"
                    />
                </label>

                <label>
                    Manufacturer
                    <input
                        type="text"
                        name="manufacturer"
                        value={manufacturer}
                        onChange={(e) => setManufacturer(e.target.value)}
                        placeholder="e.g. Toyota"
                    />
                </label>

                <label>
                    Model
                    <input
                        type="text"
                        name="model"
                        value={model}
                        onChange={(e) => setModel(e.target.value)}
                        placeholder="e.g. Camry"
                    />
                </label>

                <label>
                    Engine
                    <input
                        type="text"
                        name="engine"
                        value={engine}
                        onChange={(e) => setEngine(e.target.value)}
                        placeholder="e.g. 2.5L I4"
                    />
                </label>
                </div>
            </div>
        </div>
    );
}

export default AppStepOne;