import { Nav, Image, Button } from 'react-bootstrap';
import { FaSearch, FaCog, FaComments, FaStar, FaArchive, FaSun, FaMoon, FaUserFriends } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../features/theme/themeSlice';
import './sidebar.css';
import { selectApiBaseUrl } from '../../features/config/configSlice';
import { logout } from '../../features/auth/authSlice';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';

const Sidebar = ({ onSelect, activeSection }) => {
    const [profilePic, setProfilePic] = useState('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
    const theme = useSelector((state) => state.theme.mode);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const apiBaseUrl = useSelector(selectApiBaseUrl);

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const res = await fetch(`${apiBaseUrl}/user/get-logged-user`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                if (res.status === 401) {
                    toast.error('Session expired');
                    dispatch(logout());
                    return;
                }
                const result = await res.json();
                if (result.success) {
                    setProfilePic(`${apiBaseUrl}/${result?.data?.profilePic}` || 'https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
                } else {
                    toast.error('Failed to fetch user');
                }
            } catch (err) {
                toast.error('Error fetching user');
            }
        };
        fetchUser();
    }, [apiBaseUrl, token, dispatch]);


    return (
        <div
            className="d-flex flex-column text-dark p-3 h-100 space-between sidebar"
            style={{
                width: '250px',
                backgroundColor: 'var(--sidebar-bg)',
                color: 'var(--sidebar-text)',
                boxShadow: '2px 0 6px rgba(0,0,0,0.05)',
                overflowY: 'auto',
            }}
        >
            <div className='flex-grow-1'>
                {/* Top Nav */}
                <Nav className="flex-column mb-4">
                    <Nav.Link
                        className={`sidebar-link ${activeSection === 'search' ? 'active' : ''}`}
                        onClick={() => onSelect('search')}
                    >
                        <FaSearch className="me-2" />
                        Search
                    </Nav.Link>
                    <Nav.Link
                        className={`sidebar-link ${activeSection === 'settings' ? 'active' : ''}`}
                        onClick={() => onSelect('settings')}
                    >
                        <FaCog className="me-2" />
                        Settings
                    </Nav.Link>
                </Nav>

                {/* Chat Section */}
                <div>
                    <strong className="text-uppercase small text-secondary">Chats</strong>
                    <Nav className="flex-column mt-2 mb-4">
                        <Nav.Link
                            className={`sidebar-link ${activeSection === 'all' ? 'active' : ''}`}
                            onClick={() => onSelect('all')}
                        >
                            <FaComments className="me-2" />
                            All Chats
                        </Nav.Link>
                        <Nav.Link
                            className={`sidebar-link ${activeSection === 'favourites' ? 'active' : ''}`}
                            onClick={() => onSelect('favourites')}
                        >
                            <FaStar className="me-2" />
                            Favourites
                        </Nav.Link>
                        <Nav.Link
                            className={`sidebar-link ${activeSection === 'archived' ? 'active' : ''}`}
                            onClick={() => onSelect('archived')}
                        >
                            <FaArchive className="me-2" />
                            Archived
                        </Nav.Link>
                        <Nav.Link
                            className={`sidebar-link ${activeSection === 'requests' ? 'active' : ''}`}
                            onClick={() => onSelect('requests')}
                        >
                            <FaUserFriends className="me-2" />
                            Friend Requests
                        </Nav.Link>
                    </Nav>
                </div>
            </div>
            {/* Footer  */}
            <div className="mt-auto border-top pt-3">
                <div className="d-flex align-items-center mb-3">
                    <Image src={profilePic} roundedCircle width={40} height={40} className="me-2" />
                    <span className="fw-medium" style={{ color: 'var(--sidebar-text)' }}>{user.name}</span>
                </div>

                <div className="d-flex gap-2">
                    <Button
                        variant={theme === 'light' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => dispatch(toggleTheme())}
                    >
                        <FaSun className="me-1" />
                        Light
                    </Button>

                    <Button
                        variant={theme === 'dark' ? 'primary' : 'outline-primary'}
                        size="sm"
                        onClick={() => dispatch(toggleTheme())}
                    >
                        <FaMoon className="me-1" />
                        Dark
                    </Button>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
