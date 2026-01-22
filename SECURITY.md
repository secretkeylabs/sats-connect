# Security Policy

## Reporting a Vulnerability

The Sats Connect team takes security vulnerabilities seriously. We appreciate your efforts to responsibly disclose your findings.

### How to Report

**Please do NOT report security vulnerabilities through public GitHub issues.**

Instead, please report them via one of the following methods:

1. **Email**: Send details to the Secret Key Labs security team
2. **Discord**: Contact a team member privately on our [Discord server](https://discord.gg/tN84HhSDrz)

### What to Include

Please include the following information in your report:

- Type of vulnerability (e.g., XSS, injection, authentication bypass)
- Step-by-step instructions to reproduce the issue
- Affected versions
- Potential impact of the vulnerability
- Any suggested fixes (optional but appreciated)

### What to Expect

- **Acknowledgment**: We will acknowledge receipt of your report within 48 hours
- **Updates**: We will keep you informed of our progress
- **Resolution**: We aim to resolve critical vulnerabilities as quickly as possible
- **Credit**: We're happy to credit reporters in our release notes (unless you prefer to remain anonymous)

## Supported Versions

| Version | Supported          |
| ------- | ------------------ |
| 4.x.x   | :white_check_mark: |
| < 4.0   | :x:                |

## Security Best Practices for Users

When integrating Sats Connect into your application:

1. **Always use the latest version** - We regularly release security updates
2. **Verify wallet responses** - Don't blindly trust data returned from wallet interactions
3. **Validate user input** - Sanitize any user-provided data before passing to wallet methods
4. **Use HTTPS** - Always serve your application over HTTPS in production
5. **Review permissions** - Only request the wallet permissions your app actually needs

## Scope

This security policy applies to:

- The `sats-connect` npm package
- The official example application
- Documentation and code samples

Third-party integrations, forks, and applications built with Sats Connect are outside the scope of this policy.
