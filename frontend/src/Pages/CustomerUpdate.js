import './Homepage.css';
import '../App.css';
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useState } from 'react';
import axios from "axios";

const currentEntries = [
  {
    id: 1,
    firstName: "John",
    lastName: "Doe",
    email: "john.doe@example.com",
    phoneNumber: "123-456-7890",
    password: "examplePassword"
  }
];

const CustomerUpdate = () => {
  const navigate = useNavigate();

  const [formValues, setFormValues] = useState({
    firstName: currentEntries[0].firstName,
    lastName: currentEntries[0].lastName,
    email: currentEntries[0].email,
    phoneNumber: currentEntries[0].phoneNumber,
    password: '',
    confirmPassword: ''
  });

  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormValues(prev => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();

    const nextErrors = {};

    if (!formValues.firstName) nextErrors.firstName = "First name required";
    if (!formValues.lastName) nextErrors.lastName = "Last name required";
    if (!formValues.email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) nextErrors.email = "Invalid email";
    if (!formValues.phoneNumber.match(/^\d{3}-\d{3}-\d{4}$/)) nextErrors.phoneNumber = "Invalid phone number";
    if (formValues.password && formValues.password.length < 8) nextErrors.password = "Password must be 8+ chars";
    if (formValues.password !== formValues.confirmPassword) nextErrors.confirmPassword = "Passwords do not match";

    setErrors(nextErrors);
    if (Object.keys(nextErrors).length) return;

    // Send API
    try {
      const response = await axios.put(
          `http://127.0.0.1:8000/api/customers/update/${currentEntries[0].id}/`,
          formValues
      );
      console.log("Customer updated:", response.data);
      alert("Update successful!");
      // Optionally navigate
      // navigate("/dashboard");
    } catch (err) {
      console.error("Update failed:", err);
      alert("Update failed");
    }
  };

  return (
      <div className="customerUpdate">
        <div className="title">
          <Row className='justify-content-center'>
            <Col md='10' sm='2'>
              <Form className='updateForm fs-3 p-4' onSubmit={handleUpdate}>
                <div className=' my-4'>Update Account Information</div>

                <FormGroup className='mx-5 px-5 my-3 text-start'>
                  <Label for="firstName">First Name</Label>
                  <Input
                      id="firstName"
                      name="firstName"
                      placeholder="Enter First Name"
                      type="text"
                      value={formValues.firstName}
                      onChange={handleChange}
                      invalid={!!errors.firstName}
                  />
                  {errors.firstName && <div className="text-danger">{errors.firstName}</div>}
                </FormGroup>

                <FormGroup className='mx-5 px-5 my-3 text-start'>
                  <Label for="lastName">Last Name</Label>
                  <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Enter Last Name"
                      type="text"
                      value={formValues.lastName}
                      onChange={handleChange}
                      invalid={!!errors.lastName}
                  />
                  {errors.lastName && <div className="text-danger">{errors.lastName}</div>}
                </FormGroup>

                <FormGroup className='mx-5 px-5 my-3 text-start'>
                  <Label for="email">Email</Label>
                  <Input
                      id="email"
                      name="email"
                      placeholder="Enter Email"
                      type="email"
                      value={formValues.email}
                      onChange={handleChange}
                      invalid={!!errors.email}
                  />
                  {errors.email && <div className="text-danger">{errors.email}</div>}
                </FormGroup>

                <FormGroup className='mx-5 px-5 my-3 text-start'>
                  <Label for="phoneNumber">Phone Number</Label>
                  <Input
                      id="phoneNumber"
                      name="phoneNumber"
                      placeholder="123-456-7890"
                      type="tel"
                      value={formValues.phoneNumber}
                      onChange={handleChange}
                      invalid={!!errors.phoneNumber}
                  />
                  {errors.phoneNumber && <div className="text-danger">{errors.phoneNumber}</div>}
                </FormGroup>

                <FormGroup className='mx-5 px-5 my-3 text-start'>
                  <Label for="password">New Password</Label>
                  <Input
                      id="password"
                      name="password"
                      placeholder="Enter New Password"
                      type="password"
                      value={formValues.password}
                      onChange={handleChange}
                      invalid={!!errors.password}
                  />
                  {errors.password && <div className="text-danger">{errors.password}</div>}
                </FormGroup>

                <FormGroup className='mx-5 px-5 my-3 text-start'>
                  <Label for="confirmPassword">Confirm New Password</Label>
                  <Input
                      id="confirmPassword"
                      name="confirmPassword"
                      placeholder="Confirm Password"
                      type="password"
                      value={formValues.confirmPassword}
                      onChange={handleChange}
                      invalid={!!errors.confirmPassword}
                  />
                  {errors.confirmPassword && <div className="text-danger">{errors.confirmPassword}</div>}
                </FormGroup>

                <Button type='submit' className='btn btn-lg my-4 py-4'>
                  Update
                </Button>
              </Form>
            </Col>
          </Row>
        </div>
      </div>
  );
};

export default CustomerUpdate;
