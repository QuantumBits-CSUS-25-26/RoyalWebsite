import AdminSideBar from "../../Components/AdminSideBar";
import { useState, useEffect } from "react";
import AddEmployeeForm from "../EmployeeManagmentPopups/AddEmployee";
import RemoveEmployeeForm from "../EmployeeManagmentPopups/RemoveEmployee";
import EditEmployeeForm from "../EmployeeManagmentPopups/EditEmployee";
import AuthErrorPage from "../../Components/AuthErrorPage/AuthErrorPage";
import "../EmployeeManagementPopup.css";
import { API_BASE_URL } from "../../config";

const DisplayEmployee = ({ employee }) => {
  const name =
    employee.name ||
    `${employee.first_name || ""} ${employee.last_name || ""}`.trim();
  const { email, phone, role } = employee;

  return (
    <div className="employee-card">
      <div className="employee-card-header">
        <div className="employee-card-summary">
          <h5>{name || "Unnamed Employee"}</h5>
          <div className="employee-card-info">
            <span>
              Email:{" "}
              {email ? <a href={`mailto:${email}`}>{email}</a> : "No email"}
            </span>
            <span>
              Phone:{" "}
              {phone ? <a href={`tel:${phone}`}>{phone}</a> : "No phone"}
            </span>
            {role && <span>Role: {role}</span>}
          </div>
        </div>
      </div>
    </div>
  );
};

const Management = () => {
  const getToken = () =>
    localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const parseStoredUser = () => {
    try {
      const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const storedUserRaw = parseStoredUser();
  const storedUser =
    storedUserRaw && storedUserRaw.employee
      ? storedUserRaw.employee
      : storedUserRaw;

  const isAuthorized = (user) => {
    if (!user) return false;
    if (user.is_admin || user.is_superuser) return true;
    if (user.role && user.role === "admin") return true;
    if (Array.isArray(user.roles) && user.roles.includes("admin")) return true;
    return false;
  };

  const [employees, setEmployees] = useState([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [showRemoveForm, setShowRemoveForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);

  useEffect(() => {
    fetch(`${API_BASE_URL}/api/admin/employees/`, {
      headers: {
        Authorization: `Bearer ${getToken()}`
      }
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) {
          throw new Error(data.detail || "Failed to fetch employees");
        }

        const list = Array.isArray(data)
          ? data
          : Array.isArray(data.employees)
            ? data.employees
            : Array.isArray(data.results)
              ? data.results
              : [];

        setEmployees(list);
      })
      .catch((err) => {
        console.error("Failed to fetch employees:", err);
        setEmployees([]);
      });
  }, []);

  const handleAdd = (data) => {
    fetch(`${API_BASE_URL}/api/admin/employees/create/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${getToken()}`
      },
      body: JSON.stringify({
        first_name: data.firstName,
        last_name: data.lastName,
        email: data.email,
        phone: data.phone,
        role: data.role || "employee",
        password: data.password
      })
    })
      .then((res) => {
        if (!res.ok) throw new Error("Failed to add employee");
        return res.json();
      })
      .then((newEmployee) => {
        setEmployees((prev) => [...prev, newEmployee]);
      })
      .catch((err) => alert("Error adding employee: " + err.message));
  };

  const handleRemove = async (employeeId) => {
    const res = await fetch(
      `${API_BASE_URL}/api/admin/employees/${employeeId}/delete/`,
      {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${getToken()}`
        }
      }
    );

    if (!res.ok) {
      let msg = "Failed to remove employee";
      try {
        const data = await res.json();
        msg = data?.detail || data?.message || msg;
      } catch {}
      throw new Error(msg);
    }

    setEmployees((prev) =>
      prev.filter((e) => (e.employee_id ?? e.id) !== employeeId)
    );
  };

  const handleEdit = async (employeeId, updatedData) => {
    const res = await fetch(
      `${API_BASE_URL}/api/admin/employees/${employeeId}/edit/`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${getToken()}`
        },
        body: JSON.stringify(updatedData)
      }
    );

    if (!res.ok) {
      let msg = "Failed to edit employee";
      try {
        const data = await res.json();
        msg = data?.detail || data?.message || msg;
      } catch {}
      throw new Error(msg);
    }

    const updatedEmployee = await res.json();
    setEmployees((prev) =>
      prev.map((e) =>
        (e.employee_id ?? e.id) === employeeId ? updatedEmployee : e
      )
    );
  };

  if (!isAuthorized(storedUser)) return <AuthErrorPage />;

  return (
    <section className="admin-dashboard">
      <AdminSideBar />

      <div className="admin-dashboard-content ms-md-5">
        <div className="admin-dashboard-header">
          <span className="admin-dashboard-title">Management</span>
        </div>

        <div className="employee-list">
          {employees.length > 0 ? (
            employees.map((employee) => (
              <DisplayEmployee
                key={employee.employee_id ?? employee.id}
                employee={employee}
              />
            ))
          ) : (
            <div className="employee-card">
              <div className="employee-card-header">
                <div className="employee-card-summary">
                  <h5>No employees found.</h5>
                </div>
              </div>
            </div>
          )}
        </div>

        <div style={{ display: "flex", gap: "8px", marginTop: "8px", flexWrap: "wrap" }}>
          <button
            onClick={() => setShowAddForm(true)}
            className="buttonPrimary"
          >
            Add Employee
          </button>

          <button
            onClick={() => setShowRemoveForm(true)}
            className="buttonRed"
          >
            Remove Employee
          </button>

          <button
            onClick={() => setShowEditForm(true)}
            className="buttonPrimary"
          >
            Edit Employee
          </button>
        </div>

        <AddEmployeeForm
          visible={showAddForm}
          onClose={() => setShowAddForm(false)}
          onAdd={handleAdd}
        />

        <RemoveEmployeeForm
          visible={showRemoveForm}
          onClose={() => setShowRemoveForm(false)}
          onRemove={handleRemove}
          employee={employees}
        />

        <EditEmployeeForm
          visible={showEditForm}
          onClose={() => setShowEditForm(false)}
          onEdit={handleEdit}
          employee={employees}
        />
      </div>
    </section>
  );
};

export default Management;