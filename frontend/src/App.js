import './App.css';
import { Route, Routes } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import CustomerDashboard from './Pages/CustomerDashboard';
import Appointments from './Pages/Appointments';
import Services from './Pages/Services';
import News from './Pages/News';
import Login from './Pages/Login';
import AdminDashboard from './Pages/AdminDashboard';
import CustomerList from './Pages/AdminPages/CustomerList';
import AdminAppointments from './Pages/AdminPages/Appointments';
import AdminServices from './Pages/AdminPages/Services';
import Updates from './Pages/AdminPages/Updates';
import Invoices from './Pages/AdminPages/Invoices';
import Messages from './Pages/AdminPages/Messages';
import Settings from './Pages/AdminPages/Settings';
import CustomerLogin from './Pages/CustomerLogin';
import ServiceDetail from './Pages/ServiceDetail';
import CustomerCreation from './Pages/CustomerCreation';


function App() {
  return (
    <div className="App">
      <Routes>
        <Route path='/login' element={<CustomerLogin />} />
        <Route path='/' element={<Homepage />} />
        <Route path='/dashboard' element={<CustomerDashboard />} />
        <Route path='/account-creation' element={<CustomerCreation />} />
        <Route path='/appointments' element={<Appointments />} />
        <Route path='/services' element={<Services />} />
        <Route path="/service/:id" element={<ServiceDetail />} />
        <Route path='/news' element={<News />} />
        <Route path='/admin' element={<AdminDashboard />} />
        <Route path='/admin/customers' element={<CustomerList />} />
        <Route path='/admin/appointments' element={<AdminAppointments />} />
        <Route path='/admin/services' element={<AdminServices />} />
        <Route path='/admin/updates' element={<Updates />} />
        <Route path='/admin/invoices' element={<Invoices />} />
        <Route path='/admin/messages' element={<Messages />} />
        <Route path='/admin/settings' element={<Settings />} />
        <Route path='/admin/login' element={<Login />} />
      </Routes>
    </div>
  );
}

export default App;
