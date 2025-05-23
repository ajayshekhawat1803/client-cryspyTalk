import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Card, Button, Spinner, Alert, Container, Row, Col } from 'react-bootstrap';
import { FaUserPlus } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { hideLoader, showLoader } from '../../features/loader/loaderSlice';
import { selectApiBaseUrl } from '../../features/config/configSlice';

const FriendRequests = () => {
    const dispatch = useDispatch();
    const theme = useSelector((state) => state.theme.mode);
    const token = useSelector((state) => state.auth.token);
    const [requests, setRequests] = useState([]);
    const [error, setError] = useState('');
    const apiBaseUrl = useSelector(selectApiBaseUrl);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchFriendRequests = async () => {
            try {
                dispatch(showLoader());
                const response = await fetch(`${apiBaseUrl}/friendship/get-pending-requests`, {
                    method: "GET",
                    headers: {
                        "Content-Type": "application/json",
                        Authorization: `Bearer ${token}`,
                    },
                });

                const result = await response.json();

                if (!result.success) {
                    toast.error(result.message || "Failed to fetch requests");
                    setRequests([]);
                } else {
                    setRequests(result.data || []);
                }
            } catch (err) {
                toast.error("Something went wrong while fetching requests.");
                setError("Could not load friend requests.");
                console.error(err);
            } finally {
                dispatch(hideLoader());
                setLoading(false);
            }
        };

        fetchFriendRequests();
    }, [dispatch, apiBaseUrl, token]);

    const handleAccept = async (id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/friendship/accept-request/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (!result.success) {
                toast.error(result.message || "Failed to accept requests");
            } else {
                toast.success(result.message || "Friend request accepted!");
            }
        } catch (err) {
            toast.error("Something went wrong while accepting requests.");
            console.error(err);
        } finally {
            const updatedRequests = requests.filter(req => req._id !== id);
            setRequests(updatedRequests);
        }
    };

    const handleReject = async (id) => {
        try {
            const response = await fetch(`${apiBaseUrl}/friendship/reject-request/${id}`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${token}`,
                },
            });
            const result = await response.json();
            if (!result.success) {
                toast.error(result.message || "Failed to reject request");
            } else {
                toast.info("Friend request rejected.");
            }
        } catch (err) {
            toast.error("Something went wrong while rejectiing request.");
            console.error(err);
        } finally {
            const updatedRequests = requests.filter(req => req._id !== id);
            setRequests(updatedRequests);
        }
    };

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
        },
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" variant={theme === 'dark' ? 'light' : 'dark'} /></div>;
    if (error) return <Alert variant="danger" className="mt-3">{error}</Alert>;
    if (requests.length === 0) return <Alert variant="info" className="mt-3">No pending friend requests.</Alert>;

    return (
        <Container style={themeStyles.container}>
            <h5 className="mb-4" style={{ color: themeStyles.card.color }}>Pending Friend Requests</h5>
            <Row xs={1} sm={2} md={2} lg={3} xl={4} className="g-3">
                {requests.map(req => (
                    <Col key={req._id}>
                        <Card className="shadow-sm h-100" style={themeStyles.card}>
                            <Card.Body>
                                <Card.Title className="d-flex align-items-center gap-2">
                                    <FaUserPlus />
                                    {req.senderId?.email}
                                </Card.Title>
                                <Card.Text className="small text-muted">
                                    Requested on {new Date(req.createdAt).toLocaleDateString()}
                                </Card.Text>
                                <div className="d-flex justify-content-between mt-3">
                                    <Button variant="success" size="sm" onClick={() => handleAccept(req._id)}>Accept</Button>
                                    <Button variant="outline-danger" size="sm" onClick={() => handleReject(req._id)}>Reject</Button>
                                </div>
                            </Card.Body>
                        </Card>
                    </Col>
                ))}
            </Row>
        </Container>
    );
};

export default FriendRequests;
