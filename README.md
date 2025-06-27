# AMP - About Me Palette

A modern React application showcasing an interactive "About Me Palette" for community members. Like a color palette displays different hues, this application presents a vibrant collection of member profiles with their unique skills, interests, and personalities in a visually appealing format.

**Currently showcasing:** Singularity Society Bootcamp 003 members
**Future vision:** Expanding to support various organizations and communities worldwide

## 🎨 Concept

The "About Me Palette" concept represents each community member as a unique color in the collective palette. Just as artists select colors from a palette to create something beautiful, this application helps you discover and connect with the diverse talents and personalities within any community or organization.

## 🌟 Features

### Core Functionality
- **Member Palette**: Browse the colorful collection of community participants
- **Advanced Search**: Full-text search across names, roles, teams, specialties, interests, skills, and hobbies
- **Smart Filtering**: Filter by profession, team, specialty, and interests to find your perfect collaboration match
- **Profile Details**: Detailed member profiles with GitHub integration and social links
- **Bilingual Support**: Switch between English and Japanese language interfaces
- **Organization Customization**: Adaptable to different organizations and their specific needs

### User Experience
- **Responsive Design**: Works seamlessly on desktop and mobile devices
- **Collapsible Sidebar**: Expandable filter sidebar for more screen space
- **Full-Screen Profiles**: Detailed profile view with navigation between members
- **Team Color Coding**: Each team has its own distinctive color, reinforcing the palette metaphor
- **GitHub Avatar Integration**: Automatic profile images from GitHub accounts
- **Customizable Branding**: Easily adaptable for different organizations

### Technical Features
- **Modern React**: Built with React 18, TypeScript, and functional components
- **Performance Optimized**: Uses `useMemo` and `useCallback` for optimal rendering
- **Tailwind CSS**: Modern, responsive styling with customizable color palettes
- **Vite**: Fast development and build tooling
- **Scalable Architecture**: Designed for easy expansion to multiple organizations

## 🚀 Getting Started

### Prerequisites
- Node.js (version 16 or higher)
- npm or yarn

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd AMP
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173` to view the application

### Build for Production

```bash
npm run build
```

## 🛠️ Technology Stack

- **Frontend Framework**: React 18 with TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Icons**: Lucide React
- **Language**: TypeScript
- **Linting**: ESLint with React and TypeScript plugins

## 📁 Project Structure

```
src/
├── components/
│   ├── Layout/
│   │   └── Sidebar.tsx          # Collapsible filter sidebar
│   ├── PeopleGrid.tsx           # Main palette grid view of member cards
│   ├── ProfileCard.tsx          # Individual member card component
│   ├── ProfileFullScreen.tsx    # Full-screen profile view
│   └── SearchBar.tsx            # Search input component
├── data/
│   └── people.json              # Member data (bilingual palette)
├── App.tsx                      # Main application component
├── index.tsx                    # Application entry point
└── index.css                    # Global styles with palette theming
```

## 👥 Member Data Structure

Each member in the palette includes:
- **Personal Info**: Name (EN/JA), role, avatar, team affiliation
- **Professional**: Specialty, skills, current projects
- **Social Links**: Profile URLs, GitHub accounts
- **Interests**: Personal interests and hobbies
- **Projects**: Recent activities and ideas

## 🎨 Current Color Palette (Singularity Society Bootcamp 003)

The application features a carefully curated color palette for teams:
- **CommunityRadio EchoLab** (#1E88E5 - Blue)
- **come come club** (#43A047 - Green)
- **altermis** (#F4511E - Orange)
- **Jinarashi** (#8E24AA - Purple)
- **EchoLab** (#FDD835 - Yellow)
- **Gabon** (#00ACC1 - Cyan)
- **TBD** (#D81B60 - Pink)

*Note: Color palettes can be easily customized for different organizations*

## 🌐 Language Support

- **English**: Default language with full member information
- **Japanese**: Complete Japanese translation of all member profiles
- **Dynamic Switching**: Real-time language toggle without page reload
- **Extensible**: Framework ready for additional language support

## 📱 Responsive Design

- **Desktop**: Full sidebar with detailed filtering options
- **Tablet**: Collapsible sidebar for optimal space usage
- **Mobile**: Touch-friendly interface with swipe navigation

## 🔍 Search & Filter Capabilities

- **Text Search**: Search across all member fields
- **Multi-Filter**: Combine multiple filter categories
- **Real-time Results**: Instant filtering as you type or select filters
- **Smart Matching**: Handles both English and Japanese text
- **Customizable Filters**: Adaptable to different organization structures

## 🚀 Future Expansion

This "About Me Palette" is designed to scale and adapt to various organizations:

- **Multi-Organization Support**: Planned architecture for hosting multiple communities
- **Custom Branding**: Easily customizable themes and color schemes
- **Flexible Data Models**: Adaptable member profile structures
- **Organization-Specific Features**: Tailored functionality for different community needs
- **Integration Ready**: APIs for connecting with existing organization systems

## 🏢 Interested Organizations

Are you part of an organization that would benefit from an "About Me Palette"? This system can be adapted for:
- Tech bootcamps and accelerators
- Corporate teams and departments
- Academic institutions
- Professional communities
- Creative collectives
- Startup ecosystems

## 🤝 Contributing

This project started with Singularity Society Bootcamp 003 and is expanding to serve more communities. We welcome contributions that help make the platform more versatile and accessible to various organizations.

## 📄 License

This project is part of the Singularity Society Bootcamp program and is designed for broader community adoption.
