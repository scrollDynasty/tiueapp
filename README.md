# 🎓 TIUE Mobile App

<div align="center">

![TIUE Logo](https://img.shields.io/badge/TIUE-Mobile%20App-blue?style=for-the-badge&logo=react)
[![React Native](https://img.shields.io/badge/React%20Native-0.79.6-61DAFB?style=flat&logo=react)](https://reactnative.dev/)
[![Expo](https://img.shields.io/badge/Expo-~53.0.22-000020?style=flat&logo=expo)](https://expo.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-22.19.0-339933?style=flat&logo=nodedotjs)](https://nodejs.org/)
[![Django](https://img.shields.io/badge/Django-4.2.16-092E20?style=flat&logo=django)](https://djangoproject.com/)
[![Python](https://img.shields.io/badge/Python-3.12.6-3776AB?style=flat&logo=python)](https://python.org/)

**Mobile application for TIUE students and administration**

</div>

## 📱 About the Project

TIUE Mobile App is a comprehensive mobile application for students and administration of Tashkent International University of Education (TIUE). The application provides convenient access to academic information, news, schedules, and other university services.

### ✨ Key Features

- 🔐 **Authentication System** - secure login for students and administrators
- 📰 **University News** - latest news with images and events
- 📅 **Class Schedule** - personalized schedule for each student
- 👥 **User Management** - administrative panel for managing students
- 🌙 **Dark Theme** - support for light and dark themes with toggle
- 📱 **Responsive Design** - optimization for different screen sizes
- 🔄 **Data Synchronization** - automatic information updates

## 🏗️ Technology Stack

### Frontend (React Native)
- **React Native** `0.79.6` - cross-platform mobile development
- **Expo** `~53.0.22` - rapid development platform
- **TypeScript** - typed JavaScript
- **Redux Toolkit** - application state management
- **React Navigation** - screen navigation
- **Expo Router** - file-based routing
- **React Native Reanimated** - smooth animations
- **Expo Linear Gradient** - gradient backgrounds

### Backend (Django)
- **Django** `4.2.16` - Python web framework
- **Django REST Framework** - API for mobile application
- **Python** `3.12.6` - server-side logic
- **MariaDB/MySQL** - database
- **Django CORS Headers** - CORS support

## 🚀 Quick Start

### Prerequisites

Make sure you have installed:

- **Node.js** (version 22.19.0 or higher) - [Download](https://nodejs.org/)
- **npm** (version 11.6.0 or higher) - comes with Node.js
- **Python** (version 3.12.6 or higher) - [Download](https://python.org/)
- **MariaDB/MySQL** - database
- **Git** - [Download](https://git-scm.com/)
- **Expo CLI** (globally):
  ```bash
  npm install -g @expo/cli
  ```

### 📦 Installation

#### 1. Clone the repository
```bash
git clone https://github.com/scrollDynasty/tiueapp.git
cd tiueapp
```

#### 2. Frontend Setup (React Native)
```bash
# Install dependencies
npm install

# Or with yarn
yarn install
```

#### 3. Backend Setup (Django)
```bash
# Navigate to backend folder
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
# On Windows:
venv\Scripts\activate
# On macOS/Linux:
source venv/bin/activate

# Install Python dependencies
pip install -r requirements.txt

# Apply database migrations
python manage.py migrate

# Create superuser (administrator)
python manage.py createsuperuser

# Return to root folder
cd ..
```

## 🎮 Running the Application

### Backend Server (Django)
```bash
# In backend folder with activated venv
cd backend
python manage.py runserver

# Server will be available at: http://localhost:8000
```

### Frontend Application (React Native)
```bash
# In project root folder
npx expo start

# Or to start with cache clearing
npx expo start --clear
```

### 📱 Mobile App Launch Options

After running `npx expo start`, choose one of the options:

1. **📱 Expo Go** (for quick testing):
   - Install [Expo Go](https://expo.dev/go) on your phone
   - Scan the QR code from terminal

2. **🤖 Android emulator**:
   ```bash
   npx expo run:android
   ```

3. **🍎 iOS simulator** (macOS only):
   ```bash
   npx expo run:ios
   ```

4. **🌐 Web version**:
   ```bash
   npx expo start --web
   ```

## 📂 Project Structure

```
tiueapp/
├── 📱 app/                    # React Native application
│   ├── (auth)/               # Authentication screens
│   ├── (tabs)/               # Main app tabs
│   ├── admin/                # Administrative screens
│   ├── news/                 # News screens
│   └── login.tsx             # Login screen
├── 🎨 components/            # Reusable components
├── 🎯 constants/             # Constants (colors, styles)
├── 🔄 contexts/              # React contexts (themes)
├── 🪝 hooks/                 # Custom hooks
├── 🏪 store/                 # Redux store and slices
├── 🔧 services/              # API services
├── 📐 types/                 # TypeScript types
├── 🎨 styles/                # Global styles
├── 🖼️ assets/               # Images, fonts
└── 🗄️ backend/              # Django backend
    ├── authentication/       # Authentication
    ├── users/               # User management
    ├── news/                # News
    ├── schedule/            # Schedule
    ├── groups/              # Study groups
    └── tiuebackend/         # Django settings
```

## 🛠️ Available Commands

### Frontend Commands
```bash
# Start in development mode
npm start

# Run on Android
npm run android

# Run on iOS
npm run ios

# Run in web browser
npm run web

# Code linting
npm run lint

# Reset project to initial state
npm run reset-project
```

### Backend Commands
```bash
# Start development server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Open Django shell
python manage.py shell
```

## 🎨 Design Features

- **🌙 Adaptive Theme** - support for light and dark themes
- **📱 Mobile Design** - mobile device optimization
- **🎭 Smooth Animations** - using React Native Reanimated
- **🎨 Modern UI** - Material Design principles
- **♿ Accessibility** - accessibility features support

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `backend/` folder:

```env
SECRET_KEY=your-secret-key-here
DEBUG=True
ALLOWED_HOSTS=localhost,127.0.0.1
DB_ENGINE=django.db.backends.mysql
DB_NAME=tiueapp_db
DB_USER=your_db_user
DB_PASSWORD=your_db_password
DB_HOST=localhost
DB_PORT=3306
```

### API Endpoints

Backend provides the following API endpoints:

- `POST /api/auth/login/` - Login
- `POST /api/auth/logout/` - Logout
- `GET /api/news/` - News list
- `GET /api/schedule/` - Schedule
- `GET /api/users/` - User management (admin only)

## 🧪 Testing

```bash
# Run React Native tests
npm test

# Run Django tests
cd backend
python manage.py test
```

## 📱 Production Build

### Android APK
```bash
# Build APK
npx expo build:android

# Or create standalone app
eas build --platform android
```

### iOS App Store
```bash
# Build for iOS (requires macOS)
npx expo build:ios

# Or with EAS Build
eas build --platform ios
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## 👥 Team

- **Developer**: scrollDynasty
- **University**: TIUE (Tashkent International University of Education)
- **Contacts**: 
  - 📧 Email: ymarumar502@gmail.com
  - 💬 Telegram: @scroll_be

## 📞 Support

If you have questions or issues:

- 🐛 [Create an Issue](https://github.com/scrollDynasty/tiueapp/issues)
- 📧 Email: ymarumar502@gmail.com
- 💬 Telegram: @scroll_be

---

<div align="center">

**Made with ❤️ for TIUE students**

</div>
