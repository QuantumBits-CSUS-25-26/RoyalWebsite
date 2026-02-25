import { Navbar, Container, NavItem, Nav, NavbarBrand, Button, NavbarToggler, Collapse } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import Logo from '../images/logo.png';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGaugeSimpleHigh, faUsers, faScrewdriverWrench, faFileInvoiceDollar, faEnvelope, faUsersGear, faAlignLeft } from '@fortawesome/free-solid-svg-icons';
import { faCalendarCheck } from '@fortawesome/free-regular-svg-icons';
import { useState } from 'react';


export default function AdminSideBar() {

    const [isOpen, setIsOpen] = useState(false);
    const toggle = () => setIsOpen(v => !v);
    const closeMenu = () => setIsOpen(false);

    return (
        <>
            <Navbar className="adminTopbar d-md-none" expand={false}>
                <NavbarBrand href='/'>
                    <img src={Logo} alt='business logo' style={{ height: '85px'}} />
                </NavbarBrand>
                <NavbarToggler onClick={toggle} />
                <Collapse isOpen={isOpen} navbar>
                    <Nav navbar className='adminTopbarNav'>
                        <NavItem><NavLink className='nav-link' to='/admin' end onClick={closeMenu}>Dashboard</NavLink></NavItem>
                        <NavItem><NavLink className="nav-link" to="/admin/customers" onClick={closeMenu}>Customer List</NavLink></NavItem>
                        <NavItem><NavLink className="nav-link" to="/admin/appointments" onClick={closeMenu}>Appointments</NavLink></NavItem>
                        <NavItem><NavLink className="nav-link" to="/admin/services" onClick={closeMenu}>Services</NavLink></NavItem>
                        <NavItem><NavLink className="nav-link" to="/admin/invoices" onClick={closeMenu}>Invoices</NavLink></NavItem>
                        <NavItem><NavLink className="nav-link" to="/admin/messages" onClick={closeMenu}>Messages</NavLink></NavItem>
                        <NavItem><NavLink className="nav-link" to="/admin/management" onClick={closeMenu}>Employee Management</NavLink></NavItem>
                    </Nav>
                </Collapse>
            </Navbar>
            <div className='adminNav d-none d-md-flex'>
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
                                <NavLink className='nav-link' to='/admin/invoices'>
                                    <Button type='btn' className='navButton'>
                                        <FontAwesomeIcon icon={faFileInvoiceDollar} /> Invoices
                                    </Button>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className='nav-link' to='/admin/messages'>
                                    <Button type='btn' className='navButton'>
                                        <FontAwesomeIcon icon={faEnvelope} /> Messages
                                    </Button>
                                </NavLink>
                            </NavItem>
                            <NavItem>
                                <NavLink className='nav-link' to='/admin/management'>
                                    <Button type='btn' className='navButton' >
                                        <FontAwesomeIcon icon={faUsersGear} />Employee Management
                                    </Button>
                                </NavLink>
                            </NavItem>
                        </Nav>
                    </Container>
                </Navbar>
            </div>
        </>

    )
}

