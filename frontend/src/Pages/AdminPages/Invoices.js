import AdminSideBar from "../../Components/AdminSideBar";
import { Row, Col, Button, Form, FormGroup, Label, Input } from 'reactstrap';
import { useState, useEffect } from "react";
import { API_BASE_URL } from '../../config';

const sampleInvoices = [
  { customer: "John Doe", vehicle: "Toyota Camry", date: "2023-10-15", services: "Oil Change" , status: "Paid"},
  { customer: "Jane Smith", vehicle: "Honda Civic", date: "2023-10-20", services: "Brake Inspection" , status: "Pending"},
  { customer: "Bob Johnson", vehicle: "Chevrolet Malibu", date: "2023-10-25", services: "Body Work" , status: "Paid"},
  { customer: "John Brown", vehicle: "Hyundai Sonata", date: "2023-10-30", services: "Wheel Alignment" , status: "Pending"},
  { customer: "Charlie Smith", vehicle: "Nissan Altima", date: "2023-11-05", services: "Body Work" , status: "Paid"},
  { customer: "Emily Wilson", vehicle: "Hyundai Elantra", date: "2023-11-10", services: "Transmission Repair" , status: "Pending"}
]


const DisplayInvoice = ({ invoice }) => {
  return (
    <div className="invoice-card">
      <p style={{ color: '#2F6DAB' }}>{invoice.customer}</p>
      <p>Vehicle:<br />{invoice.vehicle}</p>
      <p>Date:<br />{invoice.date}</p>
      <p>Services:<br />{invoice.services}</p>
      <p>Status:<br />{invoice.status}</p>
    </div>
  )
}

function filterInvoices(invoices, searchValue) {
  const lowerCaseSearch = String(searchValue).toLowerCase();

  return invoices.filter(item => {
    const values = Object.values(item);
    return values.some(value => {
      return String(value).toLowerCase().includes(lowerCaseSearch);
    });
  });
}




const Invoices = () => {

  const [invoices, setInvoices] = useState(sampleInvoices);
  const [searchValue1, setValue1] = useState("Paid");
  const [searchValue2, setValue2] = useState("Pending");
  const [filteredList1, setFilteredList1] = useState(filterInvoices(invoices, searchValue1));
  const [filteredList2, setFilteredList2] = useState(filterInvoices(invoices, searchValue2));


  /* TODO: after database setup
  const fetchInvoices = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/invoices/`);
      if (res.ok) {
        const data = await res.json();
        setInvoices(data);
      }
    } catch (err) {
      console.error('Failed to fetch invoices:', err);
    }
  };
 
  useEffect(() => {
    fetchServices();
  }, []);
  */




  //TODO: change to handleSearch1 and handleSearch2
  
  const handleSearch1 = async (e) => {
    e.preventDefault();

    setFilteredList1(filterInvoices(invoices, searchValue1));
    
  }
  const handleSearch2 = async (e) => {
    e.preventDefault();

    setFilteredList2(filterInvoices(invoices, searchValue2));
    
  }
  
 

  return (
    <div>
      <AdminSideBar />         
      <div className='invoices'>
      <div className="admin-dashboard-header">
          <span className="admin-dashboard-title">Invoices</span>
      </div>
        <div className="invoice-table">
          <div className="invoice-table-columns">
            <div className="invoice-table-content">
              <div className="invoice-table-content-search">
                <Input
                  id="value1"
                  name="value1"
                  placeholder={searchValue1}
                  type="text"
                  style={{ width: '70vh', height: '50px' }}
                  value={searchValue1}
                  onChange={(e) => setValue1(e.target.value)}
                />
                <Button
                  type="button"
                  className='btn'
                  onClick={handleSearch1}
                >
                  Search
                </Button>
              </div>
              {filteredList1.map((invoice) => (
                <DisplayInvoice  invoice={invoice} />
              ))}
            </div>
          </div>
          <div className="invoice-table-columns">
            <div className="invoice-table-content">
              <div className="invoice-table-content-search">
                <Input
                  id="value2"
                  name="value2"
                  placeholder={searchValue2}
                  type="text"
                  style={{ width: '70vh', height: '50px' }}
                  value={searchValue2}
                  onChange={(e) => setValue2(e.target.value)}
                />
                <Button
                  type="button"
                  className='btn'
                  onClick={handleSearch2}
                >
                  Search
                </Button>
              </div>
              {filteredList2.map((invoice) => (
                <DisplayInvoice invoice={invoice} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Invoices
