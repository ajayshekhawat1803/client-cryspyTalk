import { Container, Form, Col, Row, Button, Card } from "react-bootstrap";
import { useState } from "react";
import logo from "../../logo512.png";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { selectApiBaseUrl } from "../../features/config/configSlice";
import { hideLoader, showLoader } from "../../features/loader/loaderSlice";


function Signup() {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        gender: "",
        password: "",
        cPassword: "",
    });
    const dispatch = useDispatch();
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();
    const apiBaseUrl = useSelector(selectApiBaseUrl);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setErrors({ ...errors, [e.target.name]: "" });
    };

    const validate = () => {
        let newErrors = {};
        if (!formData.firstName.trim()) newErrors.firstName = "First name is required";
        if (!formData.email.trim()) {
            newErrors.email = "Email is required";
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = "Invalid email format";
        }
        if (!formData.password) newErrors.password = "Password is required";
        if (formData.password.length < 6) newErrors.password = "Password must be at least 6 characters";
        if (formData.cPassword !== formData.password)
            newErrors.cPassword = "Passwords do not match";
        return newErrors;
    };
    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validate();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        try {
            dispatch(showLoader());
            const response = await fetch(`${apiBaseUrl}/auth/signup`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(formData),
            });

            const result = await response.json();

            if (!result.success) {
                if (result.data) {
                    setErrors(result.data);
                }
                toast.error(result.message || "Registration failed");
            } else {
                toast.success(result.message || "Registration successful!", {
                    position: "top-right",
                    autoClose: 3000,
                });
                setTimeout(() => {
                    navigate("/login");
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
                <h1 className="fw-bold text-dark text-center mb-4"
                    style={{
                        fontSize: "clamp(1.5rem, 4vw, 2.75rem)",
                        lineHeight: "1.4",
                        letterSpacing: "0.5px",
                    }}>Connect with friends,<br />
                    <span style={{ color: "#5A4FCF" }}>share your moments,</span>,<br />
                    and stay Cryspy.
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
                            className="img-fluid"
                            style={{ maxWidth: "120px" }}
                        />
                        <p className="text-muted" style={{ fontSize: "0.9rem" }}>
                            Join CryspyTalk. Create your account now!</p>
                    </div>

                    <Form onSubmit={handleSubmit}>
                        <Row>
                            <Col>
                                <Form.Group className="mb-2">
                                    <Form.Label>First Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        placeholder="First name"
                                        isInvalid={!!errors.firstName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.firstName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                            <Col>
                                <Form.Group className="mb-2">
                                    <Form.Label>Last Name</Form.Label>
                                    <Form.Control
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        placeholder="Last name"
                                        isInvalid={!!errors.lastName}
                                    />
                                    <Form.Control.Feedback type="invalid">
                                        {errors.lastName}
                                    </Form.Control.Feedback>
                                </Form.Group>
                            </Col>
                        </Row>

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

                        <Form.Group className="mb-2">
                            <Form.Label>Gender</Form.Label>
                            <div>
                                <Form.Check
                                    inline
                                    label="Male"
                                    name="gender"
                                    type="radio"
                                    id="gender-male"
                                    value="male"
                                    checked={formData.gender === "male"}
                                    onChange={handleChange}
                                    isInvalid={!!errors.gender}
                                />
                                <Form.Check
                                    inline
                                    label="Female"
                                    name="gender"
                                    type="radio"
                                    id="gender-female"
                                    value="female"
                                    checked={formData.gender === "female"}
                                    onChange={handleChange}
                                    isInvalid={!!errors.gender}
                                />
                                <Form.Check
                                    inline
                                    label="Other"
                                    name="gender"
                                    type="radio"
                                    id="gender-other"
                                    value="other"
                                    checked={formData.gender === "other"}
                                    onChange={handleChange}
                                    isInvalid={!!errors.gender}
                                />
                            </div>
                            <Form.Control.Feedback type="invalid">
                                {errors.gender}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Form.Group className="mb-2">
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

                        <Form.Group className="mb-3">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                name="cPassword"
                                value={formData.cPassword}
                                onChange={handleChange}
                                placeholder="Confirm Password"
                                isInvalid={!!errors.cPassword}
                            />
                            <Form.Control.Feedback type="invalid">
                                {errors.cPassword}
                            </Form.Control.Feedback>
                        </Form.Group>

                        <Button type="submit" variant="primary" className="w-100">
                            Create Account
                        </Button>
                    </Form>

                    <p className="text-center mt-3 mb-0" style={{ fontSize: "0.9rem" }}>
                        Already have an account?{" "}
                        <a href="/login" className="text-decoration-none">
                            Click here to login.
                        </a>
                    </p>
                </Card>
            </Col>
        </Container>
    );
}

export default Signup;
