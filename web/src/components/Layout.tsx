import { type ReactNode, useState, type CSSProperties } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { theme } from '../styles/theme';

interface LayoutProps {
    children: ReactNode;
}

const navItems = [
    { path: '/', icon: '🏠', label: 'Home' },
    { path: '/planner', icon: '✨', label: 'Planner' },
    { path: '/values', icon: '💎', label: 'Values' },
    { path: '/calendar', icon: '📅', label: 'Calendar' },
    { path: '/analysis', icon: '📊', label: 'Analytics' },
    { path: '/history', icon: '📜', label: 'History' },
    { path: '/predictor', icon: '🔮', label: 'Predictor' },
    { path: '/discover', icon: '🎯', label: 'Discover' },
];

export function Layout({ children }: LayoutProps) {
    const location = useLocation();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div style={containerStyle}>
            {/* Desktop Sidebar Toggle (Visible when closed) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    style={desktopToggleStyle}
                    title="Open Sidebar"
                >
                    ☰
                </button>
            )}

            {/* Desktop Sidebar */}
            <aside style={{
                ...sidebarStyle,
                left: isSidebarOpen ? 0 : '-280px',
                opacity: isSidebarOpen ? 1 : 0,
            }}>
                <div style={logoContainerStyle}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h1 style={logoStyle}>Praxable</h1>
                        <button
                            onClick={() => setIsSidebarOpen(false)}
                            style={collapseButtonStyle}
                            title="Collapse Sidebar"
                        >
                            «
                        </button>
                    </div>
                    <p style={logoSubtitleStyle}>AI Alignment Coach</p>
                </div>
                <nav style={navStyle}>
                    {navItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            style={{
                                ...navItemStyle,
                                ...(location.pathname === item.path ? navItemActiveStyle : {}),
                            }}
                            onMouseEnter={(e) => {
                                if (location.pathname !== item.path) {
                                    e.currentTarget.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
                                }
                            }}
                            onMouseLeave={(e) => {
                                if (location.pathname !== item.path) {
                                    e.currentTarget.style.backgroundColor = 'transparent';
                                }
                            }}
                        >
                            <span style={navIconStyle}>{item.icon}</span>
                            <span>{item.label}</span>
                        </Link>
                    ))}
                </nav>
            </aside>

            {/* Mobile Header */}
            <header style={mobileHeaderStyle}>
                <button
                    style={hamburgerStyle}
                    onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                >
                    ☰
                </button>
                <h1 style={mobileLogoStyle}>Praxable</h1>
            </header>

            {/* Mobile Menu */}
            {isMobileMenuOpen && (
                <div style={mobileMenuStyle} onClick={() => setIsMobileMenuOpen(false)}>
                    <nav style={mobileNavStyle}>
                        {navItems.map((item) => (
                            <Link
                                key={item.path}
                                to={item.path}
                                style={{
                                    ...mobileNavItemStyle,
                                    ...(location.pathname === item.path ? navItemActiveStyle : {}),
                                }}
                                onClick={() => setIsMobileMenuOpen(false)}
                            >
                                <span style={navIconStyle}>{item.icon}</span>
                                <span>{item.label}</span>
                            </Link>
                        ))}
                    </nav>
                </div>
            )}

            {/* Main Content */}
            <main style={{
                ...mainStyle,
                marginLeft: isSidebarOpen ? '280px' : '0',
            }}>
                {children}
            </main>
        </div>
    );
}

const containerStyle: CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    background: `linear-gradient(180deg, ${theme.colors.background} 0%, ${theme.colors.backgroundSecondary} 100%)`,
    position: 'relative',
};

const sidebarStyle: CSSProperties = {
    width: '280px',
    background: 'rgba(255, 255, 255, 0.05)',
    borderRight: `1px solid ${theme.colors.glassBorder}`,
    padding: theme.spacing.lg,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    position: 'fixed',
    height: '100vh',
    // left is controlled dynamically
    top: 0,
    overflowY: 'auto',
    transition: `left ${theme.animation.slow} cubic-bezier(0.4, 0, 0.2, 1), opacity ${theme.animation.normal}`,
    zIndex: 50,
};

const desktopToggleStyle: CSSProperties = {
    position: 'fixed',
    top: theme.spacing.lg,
    left: theme.spacing.lg,
    zIndex: 40,
    background: 'rgba(255, 255, 255, 0.1)',
    border: `1px solid ${theme.colors.glassBorder}`,
    color: theme.colors.text,
    width: '40px',
    height: '40px',
    borderRadius: theme.borderRadius.md,
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontSize: theme.typography.sizes.xl,
    backdropFilter: 'blur(5px)',
    transition: `background ${theme.animation.fast}`,
};

const collapseButtonStyle: CSSProperties = {
    background: 'transparent',
    border: 'none',
    color: theme.colors.textSecondary,
    cursor: 'pointer',
    fontSize: theme.typography.sizes.xl,
    padding: theme.spacing.xs,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: theme.borderRadius.sm,
    transition: 'all 0.2s',
};

const logoContainerStyle: CSSProperties = {
    marginBottom: theme.spacing.xl,
    paddingBottom: theme.spacing.lg,
    borderBottom: `1px solid ${theme.colors.glassBorder}`,
};

const logoStyle: CSSProperties = {
    fontSize: theme.typography.sizes['2xl'],
    fontWeight: '900',
    background: `linear-gradient(135deg, ${theme.colors.gradientPrimary.join(', ')})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing.xs,
};

const logoSubtitleStyle: CSSProperties = {
    fontSize: theme.typography.sizes.sm,
    color: theme.colors.textMuted,
};

const navStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.xs,
};

const navItemStyle: CSSProperties = {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing.md,
    padding: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.base,
    fontWeight: '600',
    transition: `all ${theme.animation.normal}`,
    cursor: 'pointer',
};

const navItemActiveStyle: CSSProperties = {
    background: `linear-gradient(135deg, ${theme.colors.gradientPrimary.join(', ')})`,
    color: theme.colors.text,
    boxShadow: theme.shadows.glow,
};

const navIconStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
};

const mobileHeaderStyle: CSSProperties = {
    display: 'none',
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    height: '60px',
    background: 'rgba(17, 24, 39, 0.95)',
    borderBottom: `1px solid ${theme.colors.glassBorder}`,
    padding: `0 ${theme.spacing.lg}`,
    alignItems: 'center',
    gap: theme.spacing.md,
    zIndex: 1000,
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
};

const hamburgerStyle: CSSProperties = {
    fontSize: theme.typography.sizes['2xl'],
    color: theme.colors.text,
    cursor: 'pointer',
    padding: theme.spacing.sm,
};

const mobileLogoStyle: CSSProperties = {
    fontSize: theme.typography.sizes.lg,
    fontWeight: '700',
    color: theme.colors.text,
};

const mobileMenuStyle: CSSProperties = {
    position: 'fixed',
    top: '60px',
    left: 0,
    right: 0,
    bottom: 0,
    background: 'rgba(10, 14, 26, 0.98)',
    backdropFilter: 'blur(10px)',
    WebkitBackdropFilter: 'blur(10px)',
    zIndex: 999,
    padding: theme.spacing.lg,
    animation: 'fadeIn 0.3s ease-out',
};

const mobileNavStyle: CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    gap: theme.spacing.sm,
};

const mobileNavItemStyle: CSSProperties = {
    ...navItemStyle,
    fontSize: theme.typography.sizes.lg,
    padding: theme.spacing.lg,
};

const mainStyle: CSSProperties = {
    flex: 1,
    // marginLeft is controlled dynamically
    minHeight: '100vh',
    paddingTop: theme.spacing.xl,
    paddingBottom: theme.spacing['3xl'],
    transition: `margin-left ${theme.animation.slow} cubic-bezier(0.4, 0, 0.2, 1)`,
};

// Add media query styles via style tag
const styleElement = document.createElement('style');
styleElement.textContent = `
  @media (max-width: 768px) {
    aside[style*="width: 280px"] {
        display: none !important;
    }
    button[title="Open Sidebar"] {
        display: none !important;
    }
    header[style*="display: none"] {
        display: flex !important;
    }
    main {
        margin-left: 0 !important;
        padding-top: 80px !important;
    }
  }
`;
document.head.appendChild(styleElement);
