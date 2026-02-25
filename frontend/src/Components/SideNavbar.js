import AccountSvg from './NavbarAssets/AccountButton.svg';
import HomeSvg from './NavbarAssets/HomeButton.svg';
import AppointmentSvg from './NavbarAssets/AppointmentButton.svg';
import ServicesSvg from './NavbarAssets/ServicesButton.svg';
import NewsSvg from './NavbarAssets/NewsButton.svg';
import { Navbar, Container, NavItem, Nav } from 'reactstrap';
import { NavLink } from 'react-router-dom';
import { useUi } from './ServicePopUp/UiContext';
import '../App.css';

const SideNavbar = () => {
  const { setServiceOpen, openServices } = useUi();


  return (
    <div className ="Navbar">
      <Navbar>
        <Container>
          <Nav vertical>
            <div class ="btn-group">
              <NavItem>
                <NavLink className='nav-link' to='/login' onClick={() => setServiceOpen(false)}>
                  <button>
                    <img src={AccountSvg} alt="AccountImage" style={{ height:30, width:30}}/>
                    Account
                  </button>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink className='nav-link' to='/' onClick={() => setServiceOpen(false)}>
                  <button>
                    <img src={HomeSvg} alt="HomeImage" style={{ height:30, width:30}}/>
                    Home
                  </button>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink className='nav-link' to='/appointments' onClick={() => setServiceOpen(false)}>
                  <button>
                    <img src={AppointmentSvg} alt="AppointmentImage" style={{ height:30, width:30}}/>
                    Schedule
                  </button>
                </NavLink>
              </NavItem>
              <NavItem
                onMouseEnter={openServices}
              >
                <NavLink className='nav-link' to='/services'>
                  <button>
                    <img src={ServicesSvg} alt="ServicesImage" style={{ height:30, width:30}}/>
                    Services
                  </button>
                </NavLink>
              </NavItem>
              <NavItem>
                <NavLink className='nav-link' to='/news' onClick={() => setServiceOpen(false)}>
                  <button>
                    <img src={NewsSvg} alt="NewsImage" style={{ height:30, width:30}}/>
                    News
                  </button>
                </NavLink>
              </NavItem>
            </div>
          </Nav>
        </Container>
      </Navbar>
    </div>
  )
}

export default SideNavbar