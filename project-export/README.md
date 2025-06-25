# BetterSPED - IEP Case Management System

A comprehensive special education case management tool built with React, TypeScript, and Tailwind CSS.

## Features

- **Student Dashboard**: Track student progress, goals, and upcoming reviews
- **IEP Meeting Scheduling**: AI-powered scheduling with team availability calculation
- **Goal Writing**: AI-assisted IEP goal creation with guided wizard
- **Report Drafting**: Template-based report generation with custom template support
- **Meeting Management**: Full RSVP system with alternative time proposals
- **Inbox System**: Centralized notifications for all meeting activities

## Getting Started

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd bettersped
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

4. Open [http://localhost:5173](http://localhost:5173) to view it in the browser.

## Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── layout/         # Layout components (Header, Sidebar, etc.)
│   ├── modals/         # Modal components
│   └── scheduling/     # Scheduling-specific components
├── context/            # React Context providers
├── data/              # Mock data and type definitions
├── pages/             # Page components
├── utils/             # Utility functions
└── main.tsx           # Application entry point
```

## Key Technologies

- **React 18** with TypeScript
- **React Router** for navigation
- **Tailwind CSS** for styling
- **Lucide React** for icons
- **Date-fns** for date manipulation
- **React Quill** for rich text editing
- **Mammoth.js** for DOCX file processing

## Features in Detail

### Meeting Scheduling
- Team availability calculation
- Common time slot detection
- Alternative time proposals
- RSVP tracking and management

### Goal Writing
- AI-assisted goal creation wizard
- Template-based goal generation
- Progress tracking

### Report Drafting
- Pre-built report templates
- Custom template creation from DOCX files
- Rich text editing capabilities

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run lint` - Run ESLint
- `npm run preview` - Preview production build

### Code Style

The project uses ESLint with TypeScript rules. Run `npm run lint` to check for issues.

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Run tests and linting
5. Submit a pull request

## License

This project is private and proprietary.