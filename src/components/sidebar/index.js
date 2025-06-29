import { Nav, Image, Button, Badge } from 'react-bootstrap';
import { FaSearch, FaCog, FaComments, FaSun, FaMoon, FaUserFriends } from 'react-icons/fa';
import { useSelector, useDispatch } from 'react-redux';
import { toggleTheme } from '../../features/theme/themeSlice';
import './sidebar.css';
import { selectApiBaseUrl } from '../../features/config/configSlice';
import { logout } from '../../features/auth/authSlice';
import { useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import { SOCKET_EVENTS } from '../../socket/socketEvents';
import socket from '../../socket/socket';

const Sidebar = ({ onSelect, activeSection }) => {
    const [profilePic, setProfilePic] = useState('https://cdn-icons-png.flaticon.com/512/3135/3135715.png');
    const theme = useSelector((state) => state.theme.mode);
    const user = useSelector((state) => state.auth.user);
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const apiBaseUrl = useSelector(selectApiBaseUrl);
    const [unreadCount, setUnreadCount] = useState(0);
    const [friendRequestCount, setFriendRequestCount] = useState(0);


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
        const fetchFriendRequests = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/friendship/get-pending-requests`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (response.status === 401) {
                    toast.error("Session expired !! Please log in again.");
                    dispatch(logout({}));
                    return;
                }
                const result = await response.json();                
                if (!result.success) {
                    setFriendRequestCount(0);
                } else {
                    setFriendRequestCount(result.data?.length || 0);
                }
            } catch (err) {
                toast.error("Something went wrong while fetching requests.");
                console.error(err);
            }
        };
        fetchUser();
        fetchFriendRequests();
    }, [apiBaseUrl, token, dispatch]);

    useEffect(() => {
        const handleNewMessage = (message) => {
            setUnreadCount(prev => prev + 1);
        };
        const handleNewFriendRequest = (request) => {
            setFriendRequestCount(prev => prev + 1);
            toast.info(`You received a new friend request!`);
        };
        socket.on(SOCKET_EVENTS.CHAT.NEW_MESSAGE, handleNewMessage);
        socket.on(SOCKET_EVENTS.FRIEND.REQUEST_RECEIVED, handleNewFriendRequest);
        return () => {
            socket.off(SOCKET_EVENTS.CHAT.NEW_MESSAGE, handleNewMessage);
            socket.off(SOCKET_EVENTS.FRIEND.REQUEST_RECEIVED, handleNewFriendRequest);
        };
    }, []);

    const handleSelect = (section) => {
        if (section === 'all') setUnreadCount(0);
        if (section === 'requests') setFriendRequestCount(0);
        onSelect(section);
    };


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
                            onClick={() => handleSelect('all')}
                            style={{ position: 'relative' }}
                        >
                            <FaComments className="me-2" />
                            All Chats
                            {unreadCount > 0 && (
                                <Badge bg="danger" pill style={{ position: 'absolute', right: 10, top: 8 }}>
                                    {unreadCount}
                                </Badge>
                            )}
                        </Nav.Link>
                        {/* <Nav.Link
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
                        </Nav.Link> */}
                        <Nav.Link
                            className={`sidebar-link ${activeSection === 'requests' ? 'active' : ''}`}
                            onClick={() => handleSelect('requests')}
                            style={{ position: 'relative' }}
                        >
                            <FaUserFriends className="me-2" />
                            Friend Requests
                            {friendRequestCount > 0 && (
                                <Badge bg="danger" pill style={{ position: 'absolute', right: 10, top: 8 }}>
                                    {friendRequestCount}
                                </Badge>
                            )}
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
