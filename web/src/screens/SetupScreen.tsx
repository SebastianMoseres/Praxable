import { useState } from 'react';
import { GlassCard } from '../components/GlassCard';
import { GradientButton } from '../components/GradientButton';
import { theme } from '../styles/theme';
import { api } from '../services/api';

interface SetupScreenProps {
    onConfigured: () => void;
}

export function SetupScreen({ onConfigured }: SetupScreenProps) {
    const [apiKey, setApiKey] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubmit = async () => {
        if (!apiKey.trim()) {
            setError('Please enter an API key');
            return;
        }

        if (!apiKey.startsWith('AIza')) {
            setError('Invalid API Key format. It should start with "AIza"');
            return;
        }

        setIsLoading(true);
        setError('');

        try {
            await api.setApiKey(apiKey);
            onConfigured();
        } catch (err: any) {
            setError(err.message || 'Failed to save API key');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div style={containerStyle}>
            <div style={contentStyle}>
                <div style={logoContainerStyle}>
                    <h1 style={logoStyle}>Praxable</h1>
                    <p style={subtitleStyle}>First, let's get you set up.</p>
                </div>

                <GlassCard style={cardStyle}>
                    <h2 style={cardTitleStyle}>Enter your Gemini API Key</h2>
                    <p style={cardDescriptionStyle}>
                        Praxable uses Google's Gemini AI to power its features.
                        Your key is stored locally on your machine.
                    </p>

                    <div style={inputGroupStyle}>
                        <input
                            type="password"
                            placeholder="AIzaSy..."
                            value={apiKey}
                            onChange={(e) => setApiKey(e.target.value)}
                            style={inputStyle}
                        />
                        {error && <p style={errorStyle}>{error}</p>}
                    </div>

                    <div style={actionsStyle}>
                        <GradientButton
                            title="Start Using Praxable"
                            onPress={handleSubmit}
                            loading={isLoading}
                            gradient={theme.colors.gradientPrimary}
                        />

                        <a
                            href="https://aistudio.google.com/app/apikey"
                            target="_blank"
                            rel="noreferrer"
                            style={linkStyle}
                        >
                            Get a free API key here ↗
                        </a>
                    </div>
                </GlassCard>
            </div>
        </div>
    );
}

const containerStyle: React.CSSProperties = {
    display: 'flex',
    minHeight: '100vh',
    alignItems: 'center',
    justifyContent: 'center',
    background: `radial-gradient(circle at 50% 50%, #1a2036 0%, #0a0e1a 100%)`,
    padding: theme.spacing.lg,
};

const contentStyle: React.CSSProperties = {
    width: '100%',
    maxWidth: '500px',
    animation: 'fadeIn 0.6s ease-out',
};

const logoContainerStyle: React.CSSProperties = {
    textAlign: 'center',
    marginBottom: theme.spacing.xl,
};

const logoStyle: React.CSSProperties = {
    fontSize: '3rem',
    fontWeight: '900',
    background: `linear-gradient(135deg, ${theme.colors.gradientPrimary.join(', ')})`,
    WebkitBackgroundClip: 'text',
    WebkitTextFillColor: 'transparent',
    marginBottom: theme.spacing.sm,
};

const subtitleStyle: React.CSSProperties = {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.lg,
};

const cardStyle: React.CSSProperties = {
    padding: theme.spacing.xl,
};

const cardTitleStyle: React.CSSProperties = {
    fontSize: theme.typography.sizes.xl,
    fontWeight: '700',
    color: theme.colors.text,
    marginBottom: theme.spacing.sm,
};

const cardDescriptionStyle: React.CSSProperties = {
    color: theme.colors.textSecondary,
    marginBottom: theme.spacing.xl,
    lineHeight: '1.5',
};

const inputGroupStyle: React.CSSProperties = {
    marginBottom: theme.spacing.xl,
};

const inputStyle: React.CSSProperties = {
    width: '100%',
    padding: theme.spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    border: `1px solid ${theme.colors.glassBorder}`,
    borderRadius: theme.borderRadius.md,
    color: theme.colors.text,
    fontSize: theme.typography.sizes.lg,
    outline: 'none',
    transition: 'border-color 0.2s',
};

const errorStyle: React.CSSProperties = {
    color: '#ef4444', // Red for error
    fontSize: theme.typography.sizes.sm,
    marginTop: theme.spacing.xs,
};

const actionsStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: theme.spacing.md,
};

const linkStyle: React.CSSProperties = {
    color: theme.colors.textSecondary,
    fontSize: theme.typography.sizes.sm,
    textDecoration: 'none',
    opacity: 0.8,
    transition: 'opacity 0.2s',
};
