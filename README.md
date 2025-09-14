Link: https://nek09c.github.io/maimatch_web/

# MaiMatch Web
Connecting maimai players across Hong Kong.

## Features

- Real-time post sharing and matching
- Song database with 1000+ tracks from various rhythm games
- Location-based player connections
- Cyberpunk/Serial Experiments Lain visual theme
- Firebase integration for real-time data

## Setup

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project

### Firebase Configuration

1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com/)
2. Enable Firestore Database
3. Copy `src/firebase-config.example.ts` to `src/firebase-config.ts`
4. Replace the placeholder values in `firebase-config.ts` with your actual Firebase project credentials
5. **Important**: Never commit `firebase-config.ts` to version control as it contains sensitive API keys

### Installation

```bash
# Clone the repository
git clone <repository-url>
cd maimatch_web

# Install dependencies
npm install

# Start development server
npm run serve
```

### Firestore Database Rules

Set up your Firestore database with these security rules:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /posts/{document=**} {
      allow read: if true;
      allow write: if true;
    }
  }
}
```

## Security

- Firebase configuration files are excluded from version control
- API keys should be kept secure and not shared publicly
- Use Firebase security rules to control database access

## Development

```bash
# Start development server
npm run serve

# Build for production
npm run build

# Run linter
npm run lint
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Ensure Firebase config is not committed
5. Submit a pull request

## License

MIT License
