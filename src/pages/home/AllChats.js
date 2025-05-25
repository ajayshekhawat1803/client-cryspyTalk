import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Spinner, Alert, Container, ListGroup, Image, Badge } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { selectApiBaseUrl } from '../../features/config/configSlice';
import { logout } from '../../features/auth/authSlice';
import { useNavigate } from 'react-router-dom';

const AllChats = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const token = useSelector((state) => state.auth.token);
    const user = useSelector((state) => state.auth.user);
    const theme = useSelector((state) => state.theme.mode);
    const apiBaseUrl = useSelector(selectApiBaseUrl);
    const [chats, setChats] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        const fetchChats = async () => {
            try {
                const response = await fetch(`${apiBaseUrl}/chats/get-all-chats`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (response.status === 401) {
                    toast.error('Session expired. Please log in again.');
                    dispatch(logout({}));
                    return;
                }

                const result = await response.json();

                if (!result.success) {
                    throw new Error(result.message || 'Failed to fetch chats.');
                }

                setChats(result.data || []);
            } catch (err) {
                console.error(err);
                setError('Unable to load chats.');
                toast.error(err.message || 'Something went wrong.');
            } finally {
                setLoading(false);
            }
        };

        fetchChats();
    }, [dispatch, apiBaseUrl, token]);

    const themeStyles = {
        container: {
            backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa',
            minHeight: '100vh',
            paddingTop: '2rem',
        },
        item: {
            backgroundColor: theme === 'dark' ? '#1e1e1e' : '#fff',
            color: theme === 'dark' ? '#f1f1f1' : '#212529',
            borderColor: theme === 'dark' ? '#333' : '#ddd',
            cursor: 'pointer',
        },
        username: {
            textDecoration: 'underline',
            fontSize: '0.85rem',
            color: theme === 'dark' ? '#bbb' : '#666',
        },
        message: (highlight) => ({
            fontWeight: highlight ? '600' : '400',
            color: highlight ? (theme === 'dark' ? '#fff' : '#000') : (theme === 'dark' ? '#ccc' : '#666'),
            fontSize: '0.9rem',
        }),
        time: {
            fontSize: '0.75rem',
            color: theme === 'dark' ? '#aaa' : '#888',
        },
    };

    const formatTime = (isoString) => {
        const date = new Date(isoString);
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant={theme === 'dark' ? 'light' : 'dark'} /></div>;
    if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;
    if (chats.length === 0) return <Alert variant="info" className="mt-3">No chats found.</Alert>;

    return (
        <Container style={themeStyles.container}>
            <h5 className="mb-4" style={{ color: themeStyles.item.color }}>Your Chats</h5>
            <ListGroup>
                {chats.map(chat => {
                    const otherUser = chat?.members?.find(
                        member => member._id !== user.id
                    );
                    const unread = chat.unreadMessageCount > 0;

                    return (
                        <ListGroup.Item
                            key={chat._id}
                            className="d-flex align-items-center justify-content-between gap-3 py-3 mb-2"
                            style={themeStyles.item}
                            onClick={() => navigate(`/chat/${chat._id}`)}
                        >
                            <div className="d-flex align-items-center gap-3">
                                <Image
                                    src={otherUser?.profilePic ? `${apiBaseUrl}/${otherUser.profilePic}` : '/default-avatar.png'}
                                    roundedCircle
                                    width={50}
                                    height={50}
                                    style={{ objectFit: 'cover' }}
                                />
                                <div>
                                    <div className="fw-bold">
                                        {`${otherUser?.firstName || ''} ${otherUser?.lastName || ''}`.trim()}
                                    </div>
                                    {chat.lastMessage?.text && (
                                        <div style={themeStyles.message(unread)}>
                                            {chat.lastMessage.text}
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="text-end">
                                {chat.lastMessage?.sentAt && (
                                    <div style={themeStyles.time}>
                                        {formatTime(chat.lastMessage.sentAt)}
                                    </div>
                                )}
                                {unread && (
                                    <Badge bg="danger" pill className="mt-1">
                                        {chat.unreadMessageCount}
                                    </Badge>
                                )}
                            </div>
                        </ListGroup.Item>
                    );
                })}
            </ListGroup>
        </Container>
    );
};

export default AllChats;
