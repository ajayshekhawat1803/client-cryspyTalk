import { Container, Form, Col, Button, Card } from "react-bootstrap";
import { useState } from "react";
import logo from "../../logo512.png";
import { toast } from "react-toastify";
import { setUser } from '../../features/auth/authSlice';
import { useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useSelector } from "react-redux";
import { selectApiBaseUrl } from "../../features/config/configSlice";
import { jwtDecode } from 'jwt-decode';
import { hideLoader, showLoader } from "../../features/loader/loaderSlice";



function Login() {
    const [formData, setFormData] = useState({
        email: "",
        password: "",
    });
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const dispatch = useDispatch();
    const apiBaseUrl = useSelector(selectApiBaseUrl);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        let newErrors = {};
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.password) newErrors.password = "Password is required";
        return newErrors;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            dispatch(showLoader());
            return;
        }

        try {
            dispatch(showLoader());
            const response = await fetch(`${apiBaseUrl}/auth/login`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!result.success) {
                if (result.data) {
                    setErrors(result.data);
                }
                toast.error(result.message || "Login failed");
            } else {
                const userData = jwtDecode(result.data.token);;
                const token = result.data.token;
                dispatch(setUser({ user: userData, token }));
                toast.success(result.message || "Login successful!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setTimeout(() => {
                    navigate("/");
                }, 1000);
            }
            dispatch(hideLoader());
        } catch (error) {
            dispatch(hideLoader());
            toast.error("Something went wrong! Please try again.");
            console.error(error);
        }
    };


    return (
        <Container fluid className="vh-100 d-flex flex-column flex-md-row p-0">
            {/* Left Section */}
            <Col
                md={6}
                className="d-flex flex-column justify-content-center align-items-center text-center p-4"
                style={{ backgroundColor: "#eeeefa" }}
            >
                <h1
                    className="fw-bold text-dark text-center mb-4"
                    style={{
                        fontSize: "clamp(1.5rem, 4vw, 2.75rem)",
                        lineHeight: "1.4",
                        letterSpacing: "0.5px",
                    }} >Discover new connections,<br />
                    <span style={{ color: "#5A4FCF" }}>spark conversations</span>,<br />
                    and <span style={{ color: "#5A4FCF" }}>live the Cryspy way.</span>
                </h1>
                <img
                    src={logo}
                    alt="CryspyTalk Logo"
                    className="img-fluid mt-3"
                    style={{ maxWidth: "220px", width: "60%" }}
                />
            </Col>

            {/* Right Section */}
            <Col
                md={6}
                className="d-flex justify-content-center align-items-center p-4"
                style={{ backgroundColor: "#ace" }}
            >
                <Card
                    className="shadow p-4 pt-0 w-100"
                    style={{
                        maxWidth: "420px",
                        width: "100%",
                        borderRadius: "16px",
                    }}
                >
                    <div className="text-center mb-1">
                        <img
                            src={logo}
                            alt="CryspyTalk Logo"
                            className="img-fluid mt-3"
                            style={{ maxWidth: "120px", }}
                        />
                        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                            Welcome back! Please login to your account.</p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <Form.Group className="mb-2">
                            <Form.Label>Email</Form.Label>
                            <Form.Control
                                type="email"
                                name="email"
                                value={formData.email}
                                onChange={handleChange}
                                placeholder="Email"
                                isInvalid={!!errors.email}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.email}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-4">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="password"
                                value={formData.password}
                                onChange={handleChange}
                                placeholder="Password"
                                isInvalid={!!errors.password}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.password}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button type="submit" variant="primary" className="w-100">
                            Login
                        </Button>
                    </Form>
                    <p className="text-center mt-3 mb-0" style={{ fontSize: "0.9rem" }}>
                        Don’t have an account yet?{" "}
                        <a href="/signup" className="text-decoration-none fw-semibold">
                            Create new account!
                        </a>
                    </p>
                </Card>
            </Col>
        </Container>
    );
}

export default Login;
