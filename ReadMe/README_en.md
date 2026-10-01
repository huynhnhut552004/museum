# Art Exhibition Website

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D-black?logo=three.js)](https://threejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?logo=google)](https://ai.google.dev/)

The website is an online art exhibition platform, inspired by Google Arts & Culture and Pinterest. The project combines a classic exhibition experience with a 3D digital exhibition space, while providing functions for searching, community interaction, and content management.

## Key Features

- Two exhibition experiences:
	- **Classic**: traditional exhibition layout, animation, and scroll effects using GSAP.
	- **Digital**: interactive 3D space with scenes custom-designed using Blender, then integrated using Three.js and React Three Fiber.
- Explore artworks by theme, color, nation, artist, and metadata.
- Fast search with Algolia, combined with caching and processing queues using Redis.
- View details of artworks, events, collections, and user profiles.
- Register, login, refresh token, change password, and verify email via OTP.
- Users can like, comment, pin artworks to collections, and send feedback.
- Manage users, artworks, events, submissions, and CMS content.
- Role authorization for `user`, `viewer`, and `admin`.
- Artwork analysis using Google Gemini in background jobs; results are synchronized to PostgreSQL, MongoDB, and Algolia.
- Real-time updates for certain statuses via Socket.IO.
- Media upload and storage via Cloudinary.

## Deployment Highlights

- **Complete AI integration**: Google Gemini is not only used to translate CMS content, but also to automatically analyze metadata and artwork attributes in background jobs. The system features a retry mechanism, status notifications via Socket.IO, and reverts artworks to draft status upon processing failure.
- **Successful combination of three database/data service systems**:
	- PostgreSQL serves as the primary database, storing relational business data such as users, artworks, events, comments, likes, collections, and CMS content.
	- MongoDB stores detailed data, attributes, and extended information of artworks.
	- Redis handles search caching, BullMQ queues, and AI processing workers.
	- Processed artwork data is also synchronized to Algolia to serve fast searching.
- **Clear role division**: `user` is for users to experience and interact; `viewer` is for personnel to view and manage certain data; `admin` has full administration rights to edit and delete sensitive data.
- **Bilingual Vietnamese - English support**: the Classic, Digital, login, introduction content, events, and notifications areas are built to display in Vietnamese or English. The CMS can use AI to translate content from Vietnamese to English while preserving the JSON structure.
- **Custom-built 3D space**: the Digital exhibition scene is custom-designed and built using Blender, then integrated into the frontend as a 3D model to combine with Three.js, React Three Fiber, textures, lighting, and real-time interactions.
- **Powerful CMS for administrators**: admins can edit multiple content blocks of the Home, About, Explore, Contact, and Policy pages for both Classic/Digital experiences; content can be reordered, hidden/shown, attached with media, and automatically translated by AI without modifying the source code.

## UI Images
### User Interface

| Classic Home Page | Digital Home Page |
| :--: | :--: |
| <img src="./Img/HomeClassic.png" width=100%>| <img src="./Img/HomeDigital.png" width=100%> |

| Classic Explore More Page | Digital Explore More Page |
| :--: | :--: |
| <img src="./Img/ExploreClassic.png" width=100%>| <img src="./Img/ExploreDigital.png" width=100%> |

| Classic Artwork List Page | Digital Artwork List Page |
| :--: | :--: |
| <img src="./Img/ListClassic.png" width=100%>| <img src="./Img/ListDigital.png" width=100%> |

| Classic Artwork Detail Page | Digital Artwork Detail Page |
| :--: | :--: |
| <img src="./Img/ArtworkDetailClassic.png" width=100%>| <img src="./Img/ArtworkDetailDigital.png" width=100%> |

| Search Page | Event Page |
| :--: | :--: |
| <img src="./Img/Search.png" width=100%> | <img src="./Img/Event.png" width=100%> |

| Login Page | Register Page |
| :--: | :--: |
| <img src="./Img/Login.png" width=100%> | <img src="./Img/Register.png" width=100%> |

| Your Account Page | Someone's Account Page |
| :--: | :--: |
| <img src="./Img/YourAccount.png" width=100%> | <img src="./Img/SomeoneAccount.png" width=100%> |

| Edit Profile Page | Edit Information Page |
| :--: | :--: |
| <img src="./Img/EditProfile.png" width=100%>| <img src="./Img/EditInfo.png" width=100%> |

| Interacted Page | Event Detail Page |
| :--: | :--: |
| <img src="./Img/Interacted.png" width=100%> | <img src="./Img/EventDetail.png" width=100%> |

### Admin Interface

| Dashboard | Artwork Statistics Page |
| :--: | :--: |
| <img src="./Img/AdminIndex.png" width=100%>| <img src="./Img/ArtworkStatistic.png" width=100%> |

| Artwork Page | Create and Edit Page |
| :--: | :--: |
| <img src="./Img/AdminArtwork.png" width=100%> | <img src="./Img/ArtworkEdit.png" width=100%> |

| Web Content Edit Page | Edit Information Page |
| :--: | :--: |
| <img src="./Img/AdminContent_1.png" width=100%>| <img src="./Img/AdminContent_2.png" width=100%> |

## Technologies

### Frontend

- React 19, Vite and React Router
- Tailwind CSS
- Three.js, React Three Fiber, Drei and 3D models custom-built using Blender
- GSAP and Framer Motion
- Axios, Socket.IO Client and Algolia Search

### Backend

- Node.js 20+, Express 5
- PostgreSQL and Sequelize/`pg` for relational data
- MongoDB and Mongoose for artwork detail data
- Redis, BullMQ and ioredis for caching, queues, and background processing
- JWT, Helmet, CORS and cookie-parser
- Cloudinary for media upload
- Google Gemini for CMS translation, artwork analysis, and AI metadata enrichment
- Resend for verification and password recovery emails

## Directory Architecture

```text
Project/
├── Backend/
│   ├── server.js              # Initializes HTTP server, API, and Socket.IO
│   └── src/
│       ├── config/            # Connects MongoDB, PostgreSQL, Redis, email
│       ├── controllers/       # Receives requests and returns responses
│       ├── middlewares/       # Authentication, authorization, upload, error handling
│       ├── models/            # MongoDB schemas and PostgreSQL schemas
│       ├── queues/            # BullMQ queue/worker for AI tasks
│       ├── routes/            # Declares API endpoints
│       ├── services/          # Application business logic
│       └── socket/            # Real-time event handling
├── Frontend/
│   ├── src/api/               # Client calls backend API
│   ├── src/components/        # UI components
│   ├── src/layouts/           # Classic, Digital, and Admin layouts
│   ├── src/pages/             # Pages for each area
│   └── public/                # Fonts, 3D models, textures, and videos
└── ReadMe/
```

## Environment Requirements

- Node.js 20 or higher
- npm
- PostgreSQL
- MongoDB
- Redis compatible with BullMQ
- Accounts/services depending on features:
	- Cloudinary to upload images
	- Algolia for searching
	- Google Gemini for AI features
	- Resend to send emails

## Environment Configuration

### Backend

Create a `Backend/.env` file:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017
POSTGRES_URI=postgresql://username:password@localhost:5432
REDIS_URI=redis://localhost:6379

JWT_ACCESS_SECRET=replace-with-secret-string
JWT_REFRESH_SECRET=replace-with-another-secret-string

CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret

ALGOLIA_APP_ID=your-app-id
ALGOLIA_ADMIN_KEY=your-admin-key

GEMINI_API_KEY=your-gemini-api-key

RESEND_API_KEY=your-resend-api-key
EMAIL_FROM=no-reply@example.com
RESEND_TEST_MODE=false
MAIL_USER=your-test-recipient@example.com
```

`MONGO_URI`, `POSTGRES_URI`, `REDIS_URI`, two JWT secrets, and `FRONTEND_URL` are the required variables for the backend to start correctly. The necessary service keys are required when using the corresponding functions. Do not commit the `.env` file or secret keys to the repository.

### Frontend

Create a `Frontend/.env` file:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_ALGOLIA_APP_ID=your-app-id
VITE_ALGOLIA_SEARCH_ONLY_KEY=your-search-only-key
```

The frontend calls the API at `${VITE_BACKEND_URL}/api` and connects to Socket.IO at `VITE_BACKEND_URL`.

## Installation and Running the Project

Open two separate terminals:

### 1. Install backend

```bash
cd Backend
npm install
```

Initialize PostgreSQL tables:

```bash
node src/models/postgres/migrate.js
```

Run the backend in development mode:

```bash
npm run dev
```

Or run in production:

```bash
npm start
```

The backend runs by default at `http://localhost:5000`.

### 2. Install frontend

```bash
cd Frontend
npm install
npm run dev
```

The frontend runs by default at `http://localhost:5173`.

Other frontend commands:

```bash
npm run build      # Create production build
npm run preview    # Preview the build
npm run lint       # Check ESLint
```

Backend lint command:

```bash
cd Backend
npm run lint
```

## Interface Areas

- `/`: Classic exhibition
- `/digital`: Digital 3D exhibition
- `/explore`: explore and filter artworks
- `/search`: search for artworks
- `/event`: event list
- `/login` and `/digital/login`: login
- `/account`: user account after login
- `/admin`: admin page for `admin` and `viewer`
- `/admin/statistics/*`: statistics for users, artworks, events, and submissions
- `/admin/cms/*`: manage website page content

## Main API Groups

The backend registers APIs under the `/api` prefix:

| Group | Purpose |
| --- | --- |
| `/api/auth` | Register, login, logout, refresh token, forgot and reset password |
| `/api/artwork` | Artwork CRUD, suggestions, upload, 3D configuration, and AI retry |
| `/api/search` | Search and keyword statistics |
| `/api/collection` | Manage collections and saved artworks |
| `/api/comment` | Comment and interact with comments |
| `/api/like` | Like an artwork or event |
| `/api/event` | Manage and display events |
| `/api/content` | CMS content |
| `/api/submission` | Feedback, contact, and submissions from users |
| `/api/user` | Profile, users, and role authorization |
| `/api/statistics` | Statistical data for the admin page |
| `/api/ai` | Translate CMS content using Gemini |
| `/api/uploadArray` | Upload multiple files |

Endpoints requiring authentication use the header:

```http
Authorization: Bearer <access-token>
```

## AI Data Flow

1. Administrator creates or updates an artwork.
2. Backend pushes the `process-artwork` task into BullMQ.
3. AI worker picks up the job from Redis and processes it using Google Gemini.
4. The result is saved to PostgreSQL/MongoDB and synchronized to Algolia.
5. Success or error status is sent to the interface via Socket.IO.

## Development Notes

- The backend must be able to connect to PostgreSQL and MongoDB before starting to listen on the HTTP port.
- Vite is configured to proxy `/api` and `/socket.io` to `http://localhost:5000` for the local environment.
- Redis is used simultaneously for search caching and the AI worker, so the worker needs to be run alongside the backend.
- Only use `ALGOLIA_ADMIN_KEY` in the backend. The frontend must only use the search-only key.
- Admin routes check for the `admin` or `viewer` role; operations that modify sensitive data typically require the `admin` role.

## Contribution

1. Create a new branch for your changes.
2. Run lint on both `Backend` and `Frontend`.
3. Test the related login, upload, search, and authorization flows.
4. Create a pull request with a clear description of the changes and how to test them.
