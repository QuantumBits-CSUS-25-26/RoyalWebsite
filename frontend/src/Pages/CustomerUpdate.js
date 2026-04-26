import './Homepage.css';
import '../App.css';
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import AuthErrorPage from "../Components/AuthErrorPage/AuthErrorPage";
import { API_BASE_URL } from "../config";

const CustomerUpdate = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);

  const token = localStorage.getItem("authToken") || sessionStorage.getItem("authToken");

  const isAuthorized = () => {
    return !!token;
  };

  const formatPhoneNumber = (value) => {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 10);

    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}-${digits.slice(3)}`;
    return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  };

  const mergeUpdatedUserIntoStorage = (updatedProfile) => {
    const mergeOne = (storage) => {
      const raw = storage.getItem("user");
      if (!raw) return;

      try {
        const existingUser = JSON.parse(raw);
        const mergedUser = {
          ...existingUser,
          first_name: updatedProfile.first_name,
          last_name: updatedProfile.last_name,
          email: updatedProfile.email,
          phone: updatedProfile.phone,
          customer_id: updatedProfile.customer_id ?? existingUser.customer_id,
          created_at: updatedProfile.created_at ?? existingUser.created_at
        };
        storage.setItem("user", JSON.stringify(mergedUser));
      } catch (e) {
        console.error("Failed to merge updated user into storage:", e);
      }
    };

    mergeOne(localStorage);
    mergeOne(sessionStorage);
  };

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(
          `${API_BASE_URL}/api/customers/me/`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );

        const user = response.data;

        setFormValues((prev) => ({
          ...prev,
          firstName: user.first_name || '',
          lastName: user.last_name || '',
          email: user.email || '',
          phoneNumber: formatPhoneNumber(user.phone || '')
        }));
      } catch (err) {
        console.error("Failed to load user:", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchUser();
    } else {
      setLoading(false);
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormValues((prev) => ({
      ...prev,
      [name]: name === "phoneNumber" ? formatPhoneNumber(value) : value
    }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const nextErrors = {};
    const phoneDigits = formValues.phoneNumber.replace(/\D/g, '');

    if (!formValues.firstName.trim()) nextErrors.firstName = "First name required";
    if (!formValues.lastName.trim()) nextErrors.lastName = "Last name required";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formValues.email)) nextErrors.email = "Invalid email";
    if (phoneDigits.length !== 10) nextErrors.phoneNumber = "Invalid phone number";
    if (formValues.password && formValues.password.length < 8) nextErrors.password = "Password must be 8+ chars";
    if (formValues.password !== formValues.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    try {
      const payload = {
        first_name: formValues.firstName,
        last_name: formValues.lastName,
        email: formValues.email,
        phone: phoneDigits,
        ...(formValues.password ? { password: formValues.password } : {})
      };

      const response = await axios.put(
        `${API_BASE_URL}/api/customers/me/`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`
          }
        }
      );

      console.log("Customer updated:", response.data);

      mergeUpdatedUserIntoStorage(response.data);

      setFormValues((prev) => ({
        ...prev,
        phoneNumber: formatPhoneNumber(response.data.phone || phoneDigits),
        password: '',
        confirmPassword: ''
      }));

      navigate("/dashboard");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed");
    }
  };

  if (!isAuthorized()) return <AuthErrorPage />;

  if (loading) return <div className="text-center mt-5">Loading...</div>;

  return (
    <div className="customerUpdate">
      <Row className="justify-content-center">
        <Col md="10" sm="12">
          <Form className="updateForm fs-3 p-4 rounded-3 mt-4" onSubmit={handleUpdate}>
            <div className="my-4">Update Account Information</div>

            <FormGroup className="mx-5 px-5 my-3 text-start">
              <Label>First Name</Label>
              <Input
                name="firstName"
                value={formValues.firstName}
                onChange={handleChange}
                invalid={!!errors.firstName}
              />
              {errors.firstName && <div className="text-danger">{errors.firstName}</div>}
            </FormGroup>

            <FormGroup className="mx-5 px-5 my-3 text-start">
              <Label>Last Name</Label>
              <Input
                name="lastName"
                value={formValues.lastName}
                onChange={handleChange}
                invalid={!!errors.lastName}
              />
              {errors.lastName && <div className="text-danger">{errors.lastName}</div>}
            </FormGroup>

            <FormGroup className="mx-5 px-5 my-3 text-start">
              <Label>Email</Label>
              <Input
                name="email"
                value={formValues.email}
                onChange={handleChange}
                invalid={!!errors.email}
              />
              {errors.email && <div className="text-danger">{errors.email}</div>}
            </FormGroup>

            <FormGroup className="mx-5 px-5 my-3 text-start">
              <Label>Phone</Label>
              <Input
                name="phoneNumber"
                value={formValues.phoneNumber}
                onChange={handleChange}
                invalid={!!errors.phoneNumber}
                placeholder="123-456-7890"
              />
              {errors.phoneNumber && <div className="text-danger">{errors.phoneNumber}</div>}
            </FormGroup>

            <FormGroup className="mx-5 px-5 my-3 text-start">
              <Label>New Password</Label>
              <Input
                type="password"
                name="password"
                value={formValues.password}
                onChange={handleChange}
                invalid={!!errors.password}
              />
              {errors.password && <div className="text-danger">{errors.password}</div>}
            </FormGroup>

            <FormGroup className="mx-5 px-5 my-3 text-start">
              <Label>Confirm Password</Label>
              <Input
                type="password"
                name="confirmPassword"
                value={formValues.confirmPassword}
                onChange={handleChange}
                invalid={!!errors.confirmPassword}
              />
              {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
            </FormGroup>

            <Button type="submit" className="btn btn-lg my-4 py-4">
              Update
            </Button>
          </Form>
        </Col>
      </Row>
    </div>
  );
};

export default CustomerUpdate;