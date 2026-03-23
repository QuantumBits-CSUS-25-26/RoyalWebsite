import React from 'react';
import AdminSideBar from '../../Components/AdminSideBar';
import './Messages.css';
import AuthErrorPage from "../../Components/AuthErrorPage/AuthErrorPage";

// Sample messages (Contact Us form fields) – UI only, no database
const SAMPLE_MESSAGES = [
  {
    id: 1,
    fname: 'Sarah',
    lname: 'Miller',
    email: 'sarah.miller@email.com',
    phone: '555-123-4567',
    message: 'I need a quote for a full brake pad replacement on a 2019 Honda Civic. When can I bring it in?',
    responseRequested: true,
    currentCustomer: false,
    receivedAt: '2024-03-08T14:30:00Z',
  },
  {
    id: 2,
    fname: 'James',
    lname: 'Chen',
    email: 'j.chen@email.com',
    phone: '555-987-6543',
    message: 'Great service last time. I\'d like to schedule my next oil change for the week of March 18.',
    responseRequested: true,
    currentCustomer: true,
    receivedAt: '2024-03-07T09:15:00Z',
  },
  {
    id: 3,
    fname: 'Maria',
    lname: 'Garcia',
    email: 'maria.g@email.com',
    phone: '555-456-7890',
    message: 'Do you do state inspections? What\'s the cost and how long does it take?',
    responseRequested: true,
    currentCustomer: false,
    receivedAt: '2024-03-06T16:45:00Z',
  },
  {
    id: 4,
    fname: 'David',
    lname: 'Kim',
    email: 'david.kim@email.com',
    phone: '555-321-6549',
    message: 'My check engine light came on after you did the oil change. Can someone call me to discuss?',
    responseRequested: true,
    currentCustomer: true,
    receivedAt: '2024-03-05T11:20:00Z',
  },
  {
    id: 5,
    fname: 'Emily',
    lname: 'Thompson',
    email: 'emily.t@email.com',
    phone: '555-789-0123',
    message: 'Just wanted to say thanks – the team was very professional and my car runs great.',
    responseRequested: false,
    currentCustomer: true,
    receivedAt: '2024-03-04T08:00:00Z',
  },
];

function formatMessageDate(isoString) {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}


const Messages = () => {
  // determine authorization from stored user object
  const parseStoredUser = () => {
    try {
      const raw = localStorage.getItem("user") || sessionStorage.getItem("user");
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
    }
  };

  const storedUser = parseStoredUser();

  const isAuthorized = (user) => {
    // if a token exists assume authenticated and allow; stored user may not be saved by login flow
    const token = sessionStorage.getItem("authToken") || localStorage.getItem("authToken");
    if (!user && token) return true;
    if (!user) return false;
    if (user.is_employee || user.is_staff || user.is_admin || user.is_superuser) return true;
    if (user.role && (user.role === "employee" || user.role === "admin")) return true;
    if (Array.isArray(user.roles) && (user.roles.includes("employee") || user.roles.includes("admin"))) return true;
    return false;
  };

  

  // Reverse chronological order (newest first)
  const sortedMessages = [...SAMPLE_MESSAGES].sort(
    (a, b) => new Date(b.receivedAt) - new Date(a.receivedAt)
  );
  if (!isAuthorized(storedUser)) return <AuthErrorPage />;
  return (
    <div className="admin-messages-page">
      <AdminSideBar />
      <div className="admin-messages-content ms-md-5">
        <div className="admin-dashboard-header">
          <span className="admin-dashboard-title">View Messages</span>
        </div>
        <p className="admin-messages-description">
          Messages received from the Contact Us form. Newest first.
        </p>
        <div className="messages-table-wrapper">
          <table className="messages-table">
            <thead>
              <tr>
                <th scope="col">Date</th>
                <th scope="col">Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Message</th>
                <th scope="col">Response requested</th>
                <th scope="col">Current customer</th>
              </tr>
            </thead>
            <tbody>
              {sortedMessages.map((msg) => (
                <tr key={msg.id}>
                  <td className="messages-date">{formatMessageDate(msg.receivedAt)}</td>
                  <td className="messages-name">{`${msg.fname} ${msg.lname}`}</td>
                  <td className="messages-email">
                    <a href={`mailto:${msg.email}`}>{msg.email}</a>
                  </td>
                  <td className="messages-phone">
                    <a href={`tel:${msg.phone}`}>{msg.phone}</a>
                  </td>
                  <td className="messages-message">{msg.message}</td>
                  <td className="messages-flag">{msg.responseRequested ? 'Yes' : 'No'}</td>
                  <td className="messages-flag">{msg.currentCustomer ? 'Yes' : 'No'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="messages-cards">
          {sortedMessages.map((msg) => (
            <div key={msg.id} className="message-card">
              <div className="message-card-header">
                <span className="message-card-name">{`${msg.fname} ${msg.lname}`}</span>
                <span className="message-card-date">{formatMessageDate(msg.receivedAt)}</span>
              </div>
              <div className="message-card-body">
                <p><a href={`mailto:${msg.email}`}>{msg.email}</a></p>
                <p><a href={`tel:${msg.phone}`}>{msg.phone}</a></p>
                <p className="message-card-text">{msg.message}</p>
                <p className="message-card-flags">
                  Response requested: {msg.responseRequested ? 'Yes' : 'No'} · Current customer: {msg.currentCustomer ? 'Yes' : 'No'}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Messages;
