import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { Container, Spinner, Modal, Form, Button } from 'react-bootstrap';
import { toast } from 'react-toastify';
import { logout } from '../../features/auth/authSlice';

const ChatArea = () => {
    const dispatch = useDispatch();
    const { chatId } = useParams();
    const token = useSelector((state) => state.auth.token);
    const currentUserId = useSelector((state) => state.auth.user?._id);
    const theme = useSelector((state) => state.theme.mode);
    const apiBaseUrl = useSelector((state) => state.config.apiBaseUrl);
    const [messages, setMessages] = useState([]);
    const [chatUser, setChatUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showSeenBy, setShowSeenBy] = useState(false);

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                const res = await fetch(`${apiBaseUrl}/messages/get-messages/${chatId}`, {
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                });
                if (res.status === 401) {
                    toast.error("Session expired !! Please log in again.");
                    dispatch(logout({}));
                    return;
                }
                const data = await res.json();
                console.log(data);
                if (!data.success) throw new Error(data.message);
                setMessages(data.data.messages);
                setChatUser(data.data.chatUser);
            } catch (error) {
                toast.error(error.message || 'Failed to fetch messages');
            } finally {
                setLoading(false);
            }
        };


        fetchMessages();
    }, [chatId, token, apiBaseUrl]);

    console.log("messages", messages);
    console.log("chatUser", chatUser);
    const themeStyles = {
        backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa',
        color: theme === 'dark' ? '#f1f1f1' : '#212529',
    };

    const renderMessages = () => {
        return messages?.map((msg, index) => {
            const isCurrentUser = msg.senderId === currentUserId;
            const previous = messages[index - 1];
            const showAvatar = !previous || previous.senderId !== msg.senderId;
            const isLast = index === messages.length - 1;

            return (
                <div key={msg._id} className={`d-flex ${isCurrentUser ? 'justify-content-end' : 'justify-content-start'} mb-2`}>
                    {!isCurrentUser && showAvatar && (
                        <img src={`${apiBaseUrl}/${msg.senderId.profilePic}`} alt="avatar" className="rounded-circle me-2" width={40} height={40} />
                    )}
                    <div className={`p-2 rounded ${isCurrentUser ? 'bg-primary text-white' : 'bg-light text-dark'}`}>
                        {msg.content}
                        {msg.mediaUrl && <img src={msg.mediaUrl} alt="media" style={{ maxWidth: '200px' }} />}
                        {isLast && msg.seenBy?.length > 0 && (
                            <div className="mt-1 d-flex align-items-center">
                                {msg.seenBy.slice(0, 3).map(user => (
                                    <img
                                        key={user._id}
                                        src={`${apiBaseUrl}/${user.profilePic}`}
                                        alt={user.username}
                                        className="rounded-circle me-1"
                                        width={20}
                                        height={20}
                                    />
                                ))}
                                {msg.seenBy.length > 3 && (
                                    <span
                                        className="small text-muted ms-1"
                                        style={{ cursor: 'pointer' }}
                                        onClick={() => setShowSeenBy(true)}
                                    >
                                        +{msg.seenBy.length - 3}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            );
        });
    };

    const handleSendMessage = async (e) => {
        e.preventDefault();
        //  send logic
    };

    if (loading) return <div className="text-center mt-5"><Spinner animation="border" /></div>;

    return (
        <Container fluid style={{ ...themeStyles, minHeight: '100vh', padding: '1rem' }}>
            <div className="d-flex align-items-center mb-3">
                <Button variant="outline-secondary" className="me-3" onClick={() => window.history.back()}>&larr;</Button>
                <img src={`${apiBaseUrl}/${chatUser?.profilePic}`} alt="avatar" className="rounded-circle me-2" width={50} height={50} />
                <div>
                    <div style={{ fontWeight: 'bold' }}>{chatUser?.fullName}</div>
                    <div className="text-muted small">@{chatUser?.username}</div>
                </div>
            </div>

            <div>{renderMessages()}</div>

            <Form onSubmit={handleSendMessage} className="mt-3">
                <Form.Group controlId="messageText">
                    <Form.Control as="textarea" rows={2} placeholder="Type a message..." />
                </Form.Group>
                <div className="d-flex justify-content-between mt-2">
                    <Form.Group>
                        <Form.Control type="file" accept="image/*,video/*" />
                    </Form.Group>
                    <Button type="submit">Send</Button>
                </div>
            </Form>

            <Modal show={showSeenBy} onHide={() => setShowSeenBy(false)}>
                <Modal.Header closeButton>
                    <Modal.Title>Seen By</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    <ul className="list-unstyled">
                        {messages[messages?.length - 1]?.seenBy?.map(user => (
                            <li key={user._id} className="d-flex align-items-center mb-2">
                                <img
                                    src={`${apiBaseUrl}/${user.profilePic}`}
                                    alt={user.username}
                                    className="rounded-circle me-2"
                                    width={30}
                                    height={30}
                                />
                                <span>{user.fullName}</span>
                            </li>
                        ))}
                    </ul>
                </Modal.Body>
            </Modal>
        </Container>
    );
};

export default ChatArea;


