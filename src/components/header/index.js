import React from 'react';
import { FaBars } from 'react-icons/fa';
import appLogo from '../../logo512.png';

const Header = ({ toggleSidebar }) => {
    const styles = {
        header: {
            width: '100%',
            padding: '10px 20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'var(--header-bg)',
            color: 'var(--sidebar-text)',
            borderBottom: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 2px 6px rgba(0, 0, 0, 0.1)',
            zIndex: 99999,
            backdropFilter: 'blur(8px)', 
            WebkitBackdropFilter: 'blur(8px)',
        },
        logo: {
            height: 40,
        },
        hamburger: {
            fontSize: 24,
            cursor: 'pointer',
            display: 'none',
            'margin-right': '20px',
        },
        '@media (max-width: 950px)': {
            hamburger: {
                display: 'block',
            },
        },
    };
    return (
        <header style={styles.header}>
            <img src={appLogo} alt="Logo" style={styles.logo} />

            <FaBars
                className="d-block d-md-block d-lg-none hamburger"
                onClick={toggleSidebar}
                style={styles.hamburger}
            />
        </header>
    );
};

export default Header;
