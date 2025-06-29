import { useCallback, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import {
    Container,
    Card,
    Form,
    Button,
    Spinner,
    Modal,
    Row,
    Col,
    Image,
} from 'react-bootstrap';
import { toast } from 'react-toastify';
import { logout } from '../../features/auth/authSlice';
import { selectApiBaseUrl } from '../../features/config/configSlice';
import { useNavigate } from 'react-router-dom';

const Settings = () => {
    const dispatch = useDispatch();
    const token = useSelector((state) => state.auth.token);
    const theme = useSelector((state) => state.theme.mode);
    const apiBaseUrl = useSelector(selectApiBaseUrl);
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [editMode, setEditMode] = useState(false);
    const [formData, setFormData] = useState({});
    const [errors, setErrors] = useState({});
    const [usernameCheck, setUsernameCheck] = useState(null);
    const [showPasswordModal, setShowPasswordModal] = useState(false);
    const [passwords, setPasswords] = useState({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
    const [passwordErrors, setPasswordErrors] = useState({});
    const [profilePreview, setProfilePreview] = useState(null);
    const [profilePicFile, setProfilePicFile] = useState(null);

    const fetchUser = useCallback(async () => {
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
                setUser(result.data);
                setFormData(result.data);
            } else {
                toast.error('Failed to fetch user');
            }
        } catch (err) {
            toast.error('Error fetching user');
        } finally {
            setLoading(false);
        }
    }, [apiBaseUrl, token, dispatch]);
    useEffect(() => {
        fetchUser();
    }, [fetchUser]);

    const handleInputChange = async (e) => {
        const { name, value } = e.target;

        setFormData({ ...formData, [name]: value });
        setErrors({ ...errors, [name]: null });

        // Username availability check
        if (name === 'username') {
            if (value === user.username) return setUsernameCheck(null);
            const res = await fetch(`${apiBaseUrl}/user/check-username?username=${value}`, {
                headers: { Authorization: `Bearer ${token}` },
            });
            const result = await res.json();
            console.log("result", result);
            setUsernameCheck(result?.data?.available);
        }
    };


    const handleSave = async () => {
        try {
            const res = await fetch(`${apiBaseUrl}/user/update-profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    firstName: formData.firstName,
                    lastName: formData.lastName,
                    username: formData.username,
                    dateOfBirth: formData.dateOfBirth,
                }),
            });
            if (res.status === 401) {
                toast.error("Session expired !! Please log in again.");
                dispatch(logout({}));
                return;
            }
            const result = await res.json();
            if (result.success) {
                toast.success('Profile updated');
                fetchUser();
                setEditMode(false);
                setErrors({});
            } else {
                setErrors(result.errors || {});
                toast.error(result.message);
            }
        } catch (err) {
            toast.error('Update failed');
        }
    };

    const handlePasswordChange = async () => {
        setPasswordErrors({});
        try {
            const res = await fetch(`${apiBaseUrl}/user/change-password`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify(passwords),
            });
            if (res.status === 401) {
                toast.error("Session expired !! Please log in again.");
                dispatch(logout({}));
                return;
            }
            const result = await res.json();
            if (result.success) {
                toast.success('Password changed');
                setShowPasswordModal(false);
                setPasswords({ oldPassword: '', newPassword: '', confirmNewPassword: '' });
            } else {
                setPasswordErrors(result.data || {});
            }
        } catch (err) {
            toast.error('Error changing password');
        }
    };

    const handleProfilePicChange = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        setProfilePreview(URL.createObjectURL(file));
        setProfilePicFile(file);
    };

    const handleProfilePicUpload = async () => {
        if (!profilePicFile) return;
        const formData = new FormData();
        formData.append('profilePic', profilePicFile);
        try {
            const res = await fetch(`${apiBaseUrl}/user/update-profile-pic`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
                body: formData,
            });
            const result = await res.json();
            if (result.success) {
                toast.success('Profile picture updated');
                setUser((prev) => ({ ...prev, profilePic: result?.data?.profilePic }));
                setProfilePicFile(null);
                setProfilePreview(null);
            } else {
                toast.error(result.message || 'Update failed');
            }
        } catch (err) {
            toast.error('Error uploading profile picture');
        }
    };

    const handleLogout = () => {
        dispatch(logout({}));
        toast.success("Logged out!");
        navigate("/login");
    };

    if (loading) return <Spinner animation="border" className="mt-5 d-block mx-auto" />;

    return (
        <div
            className="h-100"
            style={{
                backgroundColor: theme === 'dark' ? '#121212' : '#f8f9fa',
                padding: '2rem 0',
            }}
        >
            <Container>
                <Card
                    className="p-4 shadow-lg"
                    style={{
                        borderRadius: '1.5rem',
                        backgroundColor: theme === 'dark' ? '#1e1e2f' : '#ffffff',
                        color: theme === 'dark' ? '#f1f1f1' : 'inherit',
                    }}
                >
                    <Row className="align-items-center">
                        <Col md={4} className="text-center mb-4 mb-md-0">
                            <Image
                                src={profilePreview || (user?.profilePic ? `${apiBaseUrl}/${user?.profilePic}` : '/default-avatar.png')}
                                roundedCircle
                                fluid
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    objectFit: 'cover',
                                    border: '4px solid #ccc',
                                    cursor: 'pointer',
                                }}
                                onClick={() => document.getElementById('profilePicInput').click()}
                            />
                            <Form.Control
                                type="file"
                                accept="image/*"
                                id="profilePicInput"
                                className="d-none"
                                onChange={handleProfilePicChange}
                            />
                            {profilePreview && (
                                <Button className="mt-3" variant="success" onClick={handleProfilePicUpload}>
                                    Save Profile Picture
                                </Button>
                            )}
                        </Col>
                        <Col md={8}>
                            <h4 className="mb-3">Account Settings</h4>
                            <Form>
                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>First Name</Form.Label>
                                            <Form.Control
                                                name="firstName"
                                                value={formData.firstName || ''}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                isInvalid={!!errors.firstName}
                                                style={theme === 'dark' && !editMode ? { backgroundColor: '#2a2a3d', color: '#fff' } : {}}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.firstName}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Last Name</Form.Label>
                                            <Form.Control
                                                name="lastName"
                                                value={formData.lastName || ''}
                                                onChange={handleInputChange}
                                                disabled={!editMode}
                                                isInvalid={!!errors.lastName}
                                                style={theme === 'dark' && !editMode ? { backgroundColor: '#2a2a3d', color: '#fff' } : {}}
                                            />
                                            <Form.Control.Feedback type="invalid">{errors.lastName}</Form.Control.Feedback>
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-3">
                                    <Form.Label>Username</Form.Label>
                                    <Form.Control
                                        name="username"
                                        value={formData.username || ''}
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        isInvalid={usernameCheck === false || !!errors.username}
                                        isValid={usernameCheck === true}
                                        style={theme === 'dark' && !editMode ? { backgroundColor: '#2a2a3d', color: '#fff' } : {}}
                                    />
                                    {usernameCheck === false && (
                                        <Form.Text className="text-danger">Username not available</Form.Text>
                                    )}
                                    <Form.Control.Feedback type="invalid">{errors.username}</Form.Control.Feedback>
                                </Form.Group>

                                <Row>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Email</Form.Label>
                                            <Form.Control value={user.email} disabled readOnly />
                                        </Form.Group>
                                    </Col>
                                    <Col md={6}>
                                        <Form.Group className="mb-3">
                                            <Form.Label>Gender</Form.Label>
                                            <Form.Control value={user.gender} disabled readOnly />
                                        </Form.Group>
                                    </Col>
                                </Row>

                                <Form.Group className="mb-4">
                                    <Form.Label>Date of Birth</Form.Label>
                                    <Form.Control
                                        type="date"
                                        name="dateOfBirth"
                                        value={
                                            formData?.dateOfBirth
                                                ? new Date(formData.dateOfBirth).toISOString().split('T')[0]
                                                : ''
                                        }
                                        onChange={handleInputChange}
                                        disabled={!editMode}
                                        isInvalid={!!errors.dateOfBirth}
                                        style={theme === 'dark' && !editMode ? { backgroundColor: '#2a2a3d', color: '#fff' } : {}}
                                    />
                                    <Form.Control.Feedback type="invalid">{errors.dateOfBirth}</Form.Control.Feedback>
                                </Form.Group>

                                <div className="d-flex justify-content-between mt-4">
                                    {!editMode ? (
                                        <>
                                            <Button variant="primary" onClick={() => setEditMode(true)}>
                                                Edit Profile
                                            </Button>
                                            <Button variant="outline-secondary" onClick={() => setShowPasswordModal(true)}>
                                                Change Password
                                            </Button>
                                        </>
                                    ) : (
                                        <>
                                            <Button variant="success" onClick={handleSave}>
                                                Save
                                            </Button>
                                            <Button
                                                variant="secondary"
                                                onClick={() => {
                                                    setEditMode(false);
                                                    setFormData(user);
                                                    setUsernameCheck(null);
                                                    setErrors({});
                                                }}
                                            >
                                                Cancel
                                            </Button>
                                        </>
                                    )}
                                </div>
                                <div className="d-flex justify-content-end mt-3">
                                    <Button variant="danger" onClick={handleLogout}>
                                        Logout
                                    </Button>
                                </div>
                            </Form>
                        </Col>
                    </Row>
                </Card>

                {/* Password Modal */}
                <Modal show={showPasswordModal} onHide={() => setShowPasswordModal(false)} centered>
                    <Modal.Header closeButton>
                        <Modal.Title>Change Password</Modal.Title>
                    </Modal.Header>
                    <Modal.Body>
                        <Form.Group className="mb-3">
                            <Form.Label>Old Password</Form.Label>
                            <Form.Control
                                type="password"
                                isInvalid={!!passwordErrors.oldPassword}
                                onChange={(e) => setPasswords({ ...passwords, oldPassword: e.target.value })}
                            />
                            <Form.Control.Feedback type="invalid">{passwordErrors.oldPassword}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>New Password</Form.Label>
                            <Form.Control
                                type="password"
                                isInvalid={!!passwordErrors.newPassword}
                                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                            />
                            <Form.Control.Feedback type="invalid">{passwordErrors.newPassword}</Form.Control.Feedback>
                        </Form.Group>
                        <Form.Group className="mb-3">
                            <Form.Label>Confirm New Password</Form.Label>
                            <Form.Control
                                type="password"
                                isInvalid={!!passwordErrors.confirmNewPassword}
                                onChange={(e) => setPasswords({ ...passwords, confirmNewPassword: e.target.value })}
                            />
                            <Form.Control.Feedback type="invalid">{passwordErrors.confirmNewPassword}</Form.Control.Feedback>
                        </Form.Group>
                    </Modal.Body>
                    <Modal.Footer>
                        <Button variant="secondary" onClick={() => setShowPasswordModal(false)}>
                            Cancel
                        </Button>
                        <Button variant="primary" onClick={handlePasswordChange}>
                            Update Password
                        </Button>
                    </Modal.Footer>
                </Modal>
            </Container>
        </div>
    );
};

export default Settings;
