import { Navbar, Container, NavItem, Nav, NavbarBrand, Button } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import Logo from '../images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGaugeSimpleHigh, faUsers, faScrewdriverWrench, faBullhorn, faFileInvoiceDollar, faEnvelope, faGear } from '@fortawesome/free-solid-svg-icons';
import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons';

const AdminSideBar = () => {
  return (
    <div className='adminNav'>
        <Navbar className='navbar rounded'>                    
            <NavbarBrand className='ms-5 ps-2' href='/'>
                <img src={Logo} alt='business logo' style={{ height: '85px', marginLeft: '30px' }} />
            </NavbarBrand>
            <Container>
                <Nav vertical>
                    <NavItem>
                        <NavLink className='nav-link' to='/admin' end>
                            <Button type='btn' className='navButton'>
                                <FontAwesomeIcon icon={faGaugeSimpleHigh} /> Dashboard
                            </Button>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className='nav-link' to='/admin/customers'>
                            <Button type='btn' className='navButton'>
                                <FontAwesomeIcon icon={faUsers} /> Customer List
                            </Button>
                        </NavLink>
                    </NavItem>     
                    <NavItem>
                        <NavLink className='nav-link' to='/admin/appointments'>
                            <Button type='btn' className='navButton' >
                                <FontAwesomeIcon icon={faCalendarCheck} /> Appointments
                            </Button>
                        </NavLink>
                    </NavItem>     
                    <NavItem>
                        <NavLink className='nav-link' to='/admin/services'>
                            <Button type='btn' className='navButton'>
                                 <FontAwesomeIcon icon={faScrewdriverWrench} /> Services
                            </Button>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className='nav-link' to='/admin/updates'>
                            <Button type='btn' className='navButton'>
                                 <FontAwesomeIcon icon={faBullhorn} /> Updates
                            </Button>
                        </NavLink>
                    </NavItem>
                         <NavItem>
                    <NavLink className='nav-link' to='/admin/invoices'>
                            <Button type='btn' className='navButton'>
                                <FontAwesomeIcon icon={faFileInvoiceDollar}/> Invoices
                            </Button>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className='nav-link' to='/admin/messages'>
                            <Button type='btn' className='navButton'>
                                <FontAwesomeIcon icon={faEnvelope}/> Messages
                            </Button>
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className='nav-link' to='/admin/settings'>
                            <Button type='btn' className='navButton' >
                                <FontAwesomeIcon icon={faGear}/> Settings
                            </Button>
                        </NavLink>
                    </NavItem>
                </Nav>
            </Container>
        </Navbar>
    </div>
  )
}

export default AdminSideBar