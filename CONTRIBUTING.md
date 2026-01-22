# Contributing to Sats Connect

Thank you for your interest in contributing to Sats Connect! We welcome contributions from the community.

## How to Contribute

### Reporting Bugs

If you find a bug, please [open an issue](https://github.com/secretkeylabs/sats-connect/issues/new) with:

- A clear, descriptive title
- Steps to reproduce the issue
- Expected vs actual behavior
- Browser/wallet version information
- Any relevant code snippets or error messages

### Suggesting Enhancements

We welcome feature requests! Please open an issue describing:

- The problem you're trying to solve
- Your proposed solution
- Any alternatives you've considered

### Pull Requests

1. **Fork the repository** and create your branch from `develop`.

2. **Set up your development environment:**
   ```bash
   git clone https://github.com/YOUR_USERNAME/sats-connect.git
   cd sats-connect
   npm install
   ```

3. **Build the package:**
   ```bash
   npm run build
   ```

4. **Run the example app for testing:**
   ```bash
   npm run dev:example
   ```

5. **Make your changes:**
   - Write clear, readable TypeScript code
   - Follow the existing code style (Prettier is enforced)
   - Add comments for complex logic

6. **Ensure code quality:**
   ```bash
   npm run lint
   npm test
   ```

7. **Commit your changes:**
   - Use clear, descriptive commit messages
   - Reference any related issues (e.g., "Fixes #123")

8. **Push and create a Pull Request:**
   - Provide a clear description of your changes
   - Link any related issues

## Development Guidelines

### Code Style

- We use Prettier for code formatting (enforced via pre-commit hooks)
- Follow TypeScript best practices
- Use descriptive variable and function names
- Add JSDoc comments for public APIs

### Testing

- Write tests for new functionality
- Ensure all existing tests pass before submitting
- Test with the example app when making changes to the library

### Project Structure

```
sats-connect/
├── src/           # Library source code
├── example/       # Example React application
├── scripts/       # Build and utility scripts
└── .github/       # GitHub Actions workflows
```

## Code of Conduct

Please be respectful and constructive in all interactions. We're building the future of Bitcoin together!

## Getting Help

- Join our [Discord](https://discord.gg/tN84HhSDrz) for questions
- Check the [documentation](https://docs.xverse.app/sats-connect/) for API reference
- Review existing issues for similar problems

## License

By contributing, you agree that your contributions will be licensed under the MIT License.
