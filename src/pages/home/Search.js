import { useCallback, useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Container, Row, Col, Card, Button, Form, Spinner, Alert } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { logout } from '../../features/auth/authSlice';

const UserSearch = () => {
    const dispatch = useDispatch();
    const token = useSelector(state => state.auth.token);
    const theme = useSelector(state => state.theme.mode);
    const apiBaseUrl = useSelector(state => state.config.apiBaseUrl);

    const [query, setQuery] = useState('');
    const [users, setUsers] = useState([]);
    const [searching, setSearching] = useState(false);

    const themeStyles = {
        card: {
            backgroundColor: theme === 'dark' ? '#1f1f1f' : '#ffffff',
            color: theme === 'dark' ? '#f1f1f1' : '#212529',
            border: theme === 'dark' ? '1px solid #444' : '1px solid #ddd',
        },
        container: {
            backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa',
            minHeight: '100vh',
            paddingTop: '2rem',
        }
    };

    const fetchUsers = useCallback(async (searchTerm) => {
        if (!searchTerm.trim()) return;
        setSearching(true);
        try {
            const res = await fetch(`${apiBaseUrl}/user/search?q=${encodeURIComponent(searchTerm)}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
            if (res.status === 401) {
                toast.error("Session expired. Please log in again.");
                dispatch(logout({}));
                return;
            }
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            setUsers(data.data);
        } catch (err) {
            toast.error(err.message || "Failed to fetch users.");
        } finally {
            setSearching(false);
        }
    }, [apiBaseUrl, token, dispatch]); 

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (query.trim()) fetchUsers(query);
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [query, fetchUsers]);

    const handleSendRequest = async (userId) => {
        try {
            const res = await fetch(`${apiBaseUrl}/friendship/send-request/${userId}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`
                }
            });
            const data = await res.json();
            if (!data.success) throw new Error(data.message);
            toast.success("Friend request sent.");
            setUsers(prev => prev.map(u => u._id === userId ? { ...u, requestSent: true } : u));
        } catch (err) {
            toast.error(err.message || "Failed to send request.");
        }
    };

    return (
        <Container style={themeStyles.container}>
            <h5 style={{ color: themeStyles.card.color }}>Search Users</h5>
            <Form.Control
                type="text"
                placeholder="Search by name or username"
                className="mb-4"
                value={query}
                onChange={e => setQuery(e.target.value)}
            />

            {searching && <div className="text-center"><Spinner animation="border" /></div>}
            {!searching && query.trim() && users.length === 0 && (
                <Alert variant="info">No users found.</Alert>
            )}

            <Row xs={1} sm={2} md={2} lg={3} xl={4} className="g-3">
                {users.map(user => (
                    <Col key={user._id}>
                        <Card className="shadow-sm h-100" style={themeStyles.card}>
                            <Card.Body>
                                <Card.Title className="d-flex align-items-center gap-2">
                                    <img
                                        src={user.profilePic ? `${apiBaseUrl}/${user.profilePic}` : '/default-avatar.png'}
                                        alt="avatar"
                                        className="rounded-circle"
                                        width={40}
                                        height={40}
                                        style={{ objectFit: 'cover' }}
                                    />
                                    <div>
                                        <div style={{ textDecoration: 'underline' }}>@{user.username}</div>
                                    </div>
                                </Card.Title>
                                <div>{user.firstName} {user.lastName}</div>
                                <div className="d-flex justify-content-center mt-3">
                                    {user.isFriend ? (
                                        <Button variant="outline-secondary" disabled>Already Friends</Button>
                                    ) : user.requestSent ? (
                                        <Button variant="outline-primary" disabled>Request Sent</Button>
                                    ) : (
                                        <Button variant="primary" onClick={() => handleSendRequest(user._id)}>
                                            Send Request
                                        </Button>
                                    )}
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default UserSearch;
