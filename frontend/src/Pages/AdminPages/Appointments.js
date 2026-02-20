import React, {useState} from "react";
import "./Appointments.css";
import AdminSideBar from "../../Components/AdminSideBar";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";

const initialAppointments = [
    {
        id: 1,
        user: "Najaf Ali Mohammady",
        phone: "916-000-0000",
        vehicle: "Toyota Camry 2016",
        name: "Brake Work",
        description: "Brake inspection",
        date: "2026-02-20",
        time: "10:20 AM",
        status : "upcoming",
    },
    {
        id: 1,
        user: "Najaf Ali Mohammady",
        phone: "916-000-0000",
        vehicle: "Toyota Camry 2016",
        name: "Brake Work",
        description: "Brake inspection",
        date: "2026-02-20",
        time: "01:20 PM",
        status : "complete",
    },
    {
        id: 2,
        user: "Najaf Ali Mohammady",
        phone: "916-000-0000",
        vehicle: "Toyota Camry 2016",
        name: "Oil Change",
        description: "Oil and oil filter replacement",
        date: "2026-02-21",
        time: "01:20 PM",
        status : "reschedule",
    },
    {
        id: 3,
        user: "Najaf Ali Mohammady",
        phone: "916-000-0000",
        vehicle: "Toyota Camry 2016",
        name: "Tune Up",
        description: "Full vehicle tune up",
        paymentStatus: "Paid",
        date: "2026-02-22",
        time: "10:20 AM",
        status : "reschedule",
    },
];
const initialUsers = [
    { id: 1, name: "Najaf Ali Mohammady", phone: "916-000-0000" },
    { id: 2, name: "John", phone: "916-000-0000" },
    { id: 3, name: "Mike", phone: "916-000-0000" },
];
const initialSatus = [
    { id: 1, name: "upcoming",  },
    { id: 2, name: "reschedule",  },
    { id: 3, name: "complete",  },
];

const Appointments = () => {
    const [appointments, setAppointments] = useState(initialAppointments);
    const [tooltip, setTooltip] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [showOptionModal, setOptionModal] = useState(false);

    const [newAppointment, setNewAppointment] = useState({
        name: "",
        description: "",
        user: "",
        phone: "",
        vehicle: "",
        date: "",
        time: "",
        status: "upcoming",
    });

    /* ---------------- Handlers ---------------- */

    const handleCreate = () => {
        if (!newAppointment.name || !newAppointment.date) {
            alert("Title and Date are required");
            return;
        }

        setAppointments((prev) => [
            ...prev,
            {id: Date.now(), ...newAppointment},
        ]);

        setShowModal(false);
        setNewAppointment({
            name: "",
            description: "",
            user: "",
            phone: "",
            vehicle: "",
            date: "",
            time: "",
            paymentStatus: "Pending",
        });
    };

    const handleUpdate = (appointment) => {
        console.log("Update:", appointment);
        // open update modal later
    };

    const handleDelete = (id) => {
        if (window.confirm("Delete this appointment?")) {
            setAppointments((prev) => prev.filter((a) => a.id !== id));
            setTooltip(null);
        }
    };

    /* ---------------- Calendar Events ---------------- */

    const events = appointments.map((item) => ({
        id: item.id,
        title: item.name,
        date: item.date,
        backgroundColor:
            item.status === "complete" ? "#22c55e" : "#f97316",
        extendedProps: {...item},
    }));

    return (
        <section className="admin-dashboard">
            <AdminSideBar/>

            <div className="admin-dashboard-content">
                <div className="admin-dashboard-header">
                    <span className="admin-dashboard-title">Appointments</span>

                    <button className="btn-create" onClick={() => setShowModal(true)}>
                        + New Appointment
                    </button>
                </div>

                <div className="admin-content">
                    <FullCalendar
                        plugins={[dayGridPlugin]}
                        initialView="dayGridMonth"
                        events={events}
                        eventMouseEnter={(info) => {
                            const data = info.event.extendedProps;
                            setTooltip({
                                ...data,
                                title: info.event.title,
                                x: info.jsEvent.pageX,
                                y: info.jsEvent.pageY,
                            });
                        }}
                        eventMouseLeave={() => setOptionModal(true)}
                    />

                    {/* ---------- Option Modal ---------- */}
                    {showOptionModal && (
                        <div className="modal-overlay">

                            <div style={{
                                position: "absolute",
                                background: "#111827",
                                color: "#fff",
                                padding: "40px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                zIndex: 1000,
                                width: "380px",
                            }} >
                                <h3>Option Appointment</h3>
                                <div className="modal-body mt-5" >
                                    <div><span>User:</span> {tooltip.user}</div>
                                    <div><span>Phone:</span> {tooltip.phone}</div>
                                    <div><span>Vehicle:</span> {tooltip.vehicle}</div>
                                    <div><span>Time:</span> {tooltip.time}</div>
                                    <strong>{tooltip.title}</strong>
                                    <p style={{margin: "6px 0"}}>{tooltip.description}</p>
                                    {/* User Select */}
                                    <select  className="modal-select">
                                        <option value="">Select Status</option>
                                        {initialSatus.map((status) => (
                                            <option key={status.id} value={status.id}>
                                                {status.name}
                                            </option>
                                        ))}
                                    </select>



                                </div>

                                <div className="modal-actions">
                                    <button className="btn btn-primary" onClick={handleCreate}>
                                        Save
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setOptionModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                        // <div
                        //     style={{
                        //         position: "absolute",
                        //         top: tooltip.y + 10,
                        //         left: tooltip.x + 10,
                        //         background: "#111827",
                        //         color: "#fff",
                        //         padding: "10px",
                        //         borderRadius: "8px",
                        //         fontSize: "13px",
                        //         zIndex: 1000,
                        //         width: "220px",
                        //     }}
                        // >

                        //
                        //     <div className="tooltip-actions">
                        //         <button className="btn-update">
                        //            Status
                        //         </button>
                        //
                        //         <button
                        //             className="btn-update"
                        //             onClick={() => handleUpdate(tooltip)}
                        //         >
                        //             Update
                        //         </button>
                        //
                        //         <button
                        //             className="btn-delete"
                        //             onClick={() => handleDelete(tooltip.id)}
                        //         >
                        //             Delete
                        //         </button>
                        //     </div>
                        // </div>


                    )}

                    {/* ---------- Create Modal ---------- */}
                    {showModal && (
                        <div className="modal-overlay">

                            <div style={{
                                position: "absolute",
                                background: "#111827",
                                color: "#fff",
                                padding: "40px",
                                borderRadius: "8px",
                                fontSize: "13px",
                                zIndex: 1000,
                                width: "750px",
                            }} >
                                <h3>Create Appointment</h3>
                                <div className="modal-body mt-5" >
                                    {/* User Select */}
                                    <select  className="modal-select">
                                        <option value="">Select user</option>
                                        {initialUsers.map((user) => (
                                            <option key={user.id} value={user.id}>
                                                {user.name} ({user.phone})
                                            </option>
                                        ))}
                                    </select>

                                    {/* Appointment Select */}
                                    <select className="modal-select">
                                        <option value="">Select Appointment</option>
                                        {initialAppointments.map((appointment) => (
                                            <option key={appointment.name} value={appointment.name}>
                                                {appointment.name}
                                            </option>
                                        ))}
                                    </select>

                                    {/* Date */}
                                    <input
                                        type="datetime-local"
                                        className="modal-input"
                                        value={newAppointment.datetime}
                                        onChange={(e) =>
                                            setNewAppointment({
                                                ...newAppointment,
                                                datetime: e.target.value,
                                            })
                                        }
                                    />

                                </div>

                                <div className="modal-actions">
                                    <button className="btn btn-primary" onClick={handleCreate}>
                                        Save
                                    </button>
                                    <button
                                        className="btn btn-secondary"
                                        onClick={() => setShowModal(false)}
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}


                </div>
            </div>
        </section>
    );
};

export default Appointments;
