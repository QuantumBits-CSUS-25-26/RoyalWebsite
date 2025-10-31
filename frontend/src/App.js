import './App.css';
import { Route, Routes } from 'react-router-dom';
import Homepage from './Pages/Homepage';
import CustomerDashboard from './Pages/CustomerDashboard';
import Appointments from './Pages/Appointments';
import Services from './Pages/Services';
import News from './Pages/News';
import Login from './Pages/Login';
import AdminDashboard from './Pages/AdminDashboard';
import InfoBar from './Components/InfoBar'; 

function App() {
  return (
    <>
      <InfoBar /> {}
      <div className="App">
        <Routes>
          <Route path='/login' element={<Login />} />
          <Route path='/' element={<Homepage />} />
          <Route path='/dashboard' element={<CustomerDashboard />} />
          <Route path='/appointments' element={<Appointments />} />
          <Route path='/services' element={<Services />} />
          <Route path='/news' element={<News />} />
          <Route path='/admin' element={<AdminDashboard />} />
        </Routes>
      </div>
    </>
  );
}

export default App;
