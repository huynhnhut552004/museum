# Art Exhibition Website

[![React](https://img.shields.io/badge/React-19-blue?logo=react)](https://react.dev/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Database-blue?logo=postgresql)](https://www.postgresql.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-NoSQL-47A248?logo=mongodb)](https://www.mongodb.com/)
[![Three.js](https://img.shields.io/badge/Three.js-3D-black?logo=three.js)](https://threejs.org/)
[![Google Gemini](https://img.shields.io/badge/AI-Google_Gemini-8E75B2?logo=google)](https://ai.google.dev/)

Website là nền tảng triển lãm nghệ thuật trực tuyến, lấy cảm hứng từ Google Arts & Culture và Pinterest. Dự án kết hợp trải nghiệm trưng bày cổ điển với không gian triển lãm kỹ thuật số 3D, đồng thời cung cấp các chức năng tìm kiếm, tương tác cộng đồng và quản trị nội dung.

**Demo trực tuyến:** https://museum-frontend-relh.onrender.com/

**Tài khoản viewer admin:** `museumdemo2026@gmail.com`

**Mật khẩu:** Museum@Demo2026

> **Lưu ý:** Backend được triển khai trên Render Free Tier. Server có thể mất khoảng 30–50 giây để phản hồi ở lần truy cập đầu tiên sau một khoảng thời gian không hoạt động. Hình ảnh và video cũng có thể tải chậm hơn do giới hạn về hosting và băng thông.

## Tính năng chính

- Hai trải nghiệm trưng bày:
	- **Classic**: bố cục triển lãm truyền thống, animation và hiệu ứng cuộn bằng GSAP.
	- **Digital**: không gian 3D tương tác với cảnh được tự thiết kế bằng Blender, sau đó tích hợp bằng Three.js và React Three Fiber.
- Khám phá tác phẩm theo chủ đề, màu sắc, quốc gia, nghệ sĩ và metadata.
- Tìm kiếm nhanh với Algolia, kết hợp cache và hàng đợi xử lý bằng Redis.
- Xem chi tiết tác phẩm, sự kiện, bộ sưu tập và hồ sơ người dùng.
- Đăng ký, đăng nhập, refresh token, đổi mật khẩu và xác minh email qua OTP.
- Người dùng có thể thích, bình luận, ghim tác phẩm vào bộ sưu tập và gửi phản hồi.
- Quản trị người dùng, tác phẩm, sự kiện, submission và nội dung CMS.
- Phân quyền `user`, `viewer` và `admin`.
- Phân tích tác phẩm bằng Google Gemini ở background job; kết quả được đồng bộ sang PostgreSQL, MongoDB và Algolia.
- Cập nhật một số trạng thái theo thời gian thực qua Socket.IO.
- Upload và lưu trữ media qua Cloudinary.

## Điểm nhấn triển khai

- **Tích hợp AI hoàn chỉnh**: Google Gemini không chỉ được dùng để dịch nội dung CMS, mà còn tự động phân tích metadata và thuộc tính của tác phẩm trong background job. Hệ thống có cơ chế retry, thông báo trạng thái qua Socket.IO và đưa tác phẩm về bản nháp khi xử lý thất bại.
- **Kết hợp thành công ba hệ cơ sở dữ liệu/dịch vụ dữ liệu**:
	- PostgreSQL đóng vai trò là cơ sở dữ liệu chính, lưu dữ liệu nghiệp vụ có quan hệ như người dùng, tác phẩm, sự kiện, bình luận, lượt thích, bộ sưu tập và nội dung CMS.
	- MongoDB lưu dữ liệu chi tiết, thuộc tính và thông tin mở rộng của tác phẩm.
	- Redis đảm nhiệm cache tìm kiếm, hàng đợi BullMQ và worker xử lý AI.
	- Dữ liệu tác phẩm sau khi xử lý còn được đồng bộ lên Algolia để phục vụ tìm kiếm nhanh.
- **Phân chia vai trò rõ ràng**: `user` dành cho người dùng trải nghiệm và tương tác; `viewer` dành cho nhân sự được xem và quản lý một số dữ liệu; `admin` có toàn quyền quản trị, chỉnh sửa và xóa dữ liệu nhạy cảm.
- **Hỗ trợ song ngữ Việt - Anh**: các khu vực Classic, Digital, đăng nhập, nội dung giới thiệu, sự kiện và thông báo được xây dựng để hiển thị bằng tiếng Việt hoặc tiếng Anh. CMS có thể dùng AI để dịch nội dung từ tiếng Việt sang tiếng Anh mà vẫn giữ nguyên cấu trúc JSON.
- **Không gian 3D tự xây dựng**: cảnh triển lãm Digital được tự thiết kế và dựng bằng Blender, sau đó tích hợp vào frontend dưới dạng model 3D để kết hợp với Three.js, React Three Fiber, texture, ánh sáng và tương tác thời gian thực.
- **CMS mạnh cho quản trị viên**: admin có thể chỉnh sửa nhiều block nội dung của trang Home, About, Explore, Contact và Policy cho cả hai trải nghiệm Classic/Digital; nội dung có thể sắp xếp, ẩn/hiện, gắn media và dịch tự động bằng AI mà không cần sửa mã nguồn.

## Ảnh giao diện
### Giao diện người dùng

| Trang home Classic | Trang home Digital |
| :--: | :--: |
| <img src="./Img/HomeClassic.png" width=100%>| <img src="./Img/HomeDigital.png" width=100%> |

| Trang khám phá thêm Classic | Trang khám phá thêm Digital |
| :--: | :--: |
| <img src="./Img/ExploreClassic.png" width=100%>| <img src="./Img/ExploreDigital.png" width=100%> |

| Trang danh sách tác phẩm Classic | Trang danh sách tác phẩm Digital |
| :--: | :--: |
| <img src="./Img/ListClassic.png" width=100%>| <img src="./Img/ListDigital.png" width=100%> |

| Trang chi tiết tác phẩm Classic | Trang chi tiết tác phẩm Digital |
| :--: | :--: |
| <img src="./Img/ArtworkDetailClassic.png" width=100%>| <img src="./Img/ArtworkDetailDigital.png" width=100%> |

| Trang tìm kiếm | Trang event |
| :--: | :--: |
| <img src="./Img/Search.png" width=100%> | <img src="./Img/Event.png" width=100%> |


| Trang đăng nhập | Trang đăng ký |
| :--: | :--: |
| <img src="./Img/Login.png" width=100%> | <img src="./Img/Register.png" width=100%> |


| Trang tài khoản của bạn | Trang tài khoản của người khác |
| :--: | :--: |
| <img src="./Img/YourAccount.png" width=100%> | <img src="./Img/SomeoneAccount.png" width=100%> |

| Trang chỉnh sửa hồ sơ | Trang chỉnh sửa thông tin |
| :--: | :--: |
| <img src="./Img/EditProfile.png" width=100%>| <img src="./Img/EditInfo.png" width=100%> |

| Trang đã tương tác | Trang chi tiết event |
| :--: | :--: |
| <img src="./Img/Interacted.png" width=100%> | <img src="./Img/EventDetail.png" width=100%> |

### Giao diện Admin

| Trang chủ | Trang thống kê tác phẩm |
| :--: | :--: |
| <img src="./Img/AdminIndex.png" width=100%>| <img src="./Img/ArtworkStatistic.png" width=100%> |

| Trang tác phẩm | Trang tạo và chỉnh sửa |
| :--: | :--: |
| <img src="./Img/AdminArtwork.png" width=100%> | <img src="./Img/ArtworkEdit.png" width=100%> |

| Trang chỉnh sửa nội dung web | Trang chỉnh sửa thông tin |
| :--: | :--: |
| <img src="./Img/AdminContent_1.png" width=100%>| <img src="./Img/AdminContent_2.png" width=100%> |

## Công nghệ

### Frontend

- React 19, Vite và React Router
- Tailwind CSS
- Three.js, React Three Fiber, Drei và model 3D được tự dựng bằng Blender
- GSAP và Framer Motion
- Axios, Socket.IO Client và Algolia Search

### Backend

- Node.js 20+, Express 5
- PostgreSQL và Sequelize/`pg` cho dữ liệu quan hệ
- MongoDB và Mongoose cho dữ liệu chi tiết tác phẩm
- Redis, BullMQ và ioredis cho cache, hàng đợi và xử lý nền
- JWT, Helmet, CORS và cookie-parser
- Cloudinary cho upload media
- Google Gemini cho dịch CMS, phân tích tác phẩm và bổ sung metadata bằng AI
- Resend cho email xác minh và khôi phục mật khẩu

## Kiến trúc thư mục

```text
Project/
├── Backend/
│   ├── server.js              # Khởi tạo HTTP server, API và Socket.IO
│   └── src/
│       ├── config/            # Kết nối MongoDB, PostgreSQL, Redis, email
│       ├── controllers/       # Nhận request và trả response
│       ├── middlewares/       # Xác thực, phân quyền, upload, xử lý lỗi
│       ├── models/            # Schema MongoDB và schema PostgreSQL
│       ├── queues/            # BullMQ queue/worker cho tác vụ AI
│       ├── routes/            # Khai báo API endpoint
│       ├── services/          # Nghiệp vụ ứng dụng
│       └── socket/            # Xử lý sự kiện realtime
├── Frontend/
│   ├── src/api/               # Client gọi API backend
│   ├── src/components/        # Component giao diện
│   ├── src/layouts/           # Classic, Digital và Admin layout
│   ├── src/pages/             # Các trang theo từng khu vực
│   └── public/                # Font, model 3D, texture và video
└── ReadMe/
```

## Yêu cầu môi trường

- Node.js 20 trở lên
- npm
- PostgreSQL
- MongoDB
- Redis tương thích với BullMQ
- Tài khoản/dịch vụ tùy theo tính năng:
	- Cloudinary để upload ảnh
	- Algolia để tìm kiếm
	- Google Gemini cho tính năng AI
	- Resend để gửi email

## Cấu hình môi trường

### Backend

Tạo file `Backend/.env`:

```env
PORT=5000
FRONTEND_URL=http://localhost:5173
NODE_ENV=development

MONGO_URI=mongodb://localhost:27017
POSTGRES_URI=postgresql://username:password@localhost:5432
REDIS_URI=redis://localhost:6379

JWT_ACCESS_SECRET=thay-bang-chuoi-bi-mat
JWT_REFRESH_SECRET=thay-bang-chuoi-bi-mat-khac

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

`MONGO_URI`, `POSTGRES_URI`, `REDIS_URI`, hai JWT secret và `FRONTEND_URL` là các biến cần có để backend khởi động đúng. Các khóa dịch vụ cần thiết khi sử dụng chức năng tương ứng. Không commit file `.env` hoặc khóa bí mật lên repository.

### Frontend

Tạo file `Frontend/.env`:

```env
VITE_BACKEND_URL=http://localhost:5000
VITE_ALGOLIA_APP_ID=your-app-id
VITE_ALGOLIA_SEARCH_ONLY_KEY=your-search-only-key
```

Frontend gọi API tại `${VITE_BACKEND_URL}/api` và kết nối Socket.IO tại `VITE_BACKEND_URL`.

## Cài đặt và chạy dự án

Mở hai terminal riêng:

### 1. Cài đặt backend

```bash
cd Backend
npm install
```

Khởi tạo các bảng PostgreSQL:

```bash
node src/models/postgres/migrate.js
```

Chạy backend ở chế độ phát triển:

```bash
npm run dev
```

Hoặc chạy production:

```bash
npm start
```

Backend mặc định chạy tại `http://localhost:5000`.

### 2. Cài đặt frontend

```bash
cd Frontend
npm install
npm run dev
```

Frontend mặc định chạy tại `http://localhost:5173`.

Các lệnh frontend khác:

```bash
npm run build      # Tạo bản build production
npm run preview    # Xem thử bản build
npm run lint       # Kiểm tra ESLint
```

Lệnh lint backend:

```bash
cd Backend
npm run lint
```

## Các khu vực giao diện

- `/`: triển lãm Classic
- `/digital`: triển lãm Digital 3D
- `/explore`: khám phá và lọc tác phẩm
- `/search`: tìm kiếm tác phẩm
- `/event`: danh sách sự kiện
- `/login` và `/digital/login`: đăng nhập
- `/account`: tài khoản người dùng sau khi đăng nhập
- `/admin`: trang quản trị dành cho `admin` và `viewer`
- `/admin/statistics/*`: thống kê người dùng, tác phẩm, sự kiện và submission
- `/admin/cms/*`: quản lý nội dung các trang website

## Nhóm API chính

Backend đăng ký API dưới tiền tố `/api`:

| Nhóm | Mục đích |
| --- | --- |
| `/api/auth` | Đăng ký, đăng nhập, đăng xuất, refresh token, quên và đặt lại mật khẩu |
| `/api/artwork` | CRUD tác phẩm, gợi ý, upload, cấu hình 3D và retry AI |
| `/api/search` | Tìm kiếm và thống kê từ khóa |
| `/api/collection` | Quản lý bộ sưu tập và tác phẩm đã lưu |
| `/api/comment` | Bình luận và tương tác với bình luận |
| `/api/like` | Thích tác phẩm hoặc sự kiện |
| `/api/event` | Quản lý và hiển thị sự kiện |
| `/api/content` | Nội dung CMS |
| `/api/submission` | Feedback, liên hệ và submission từ người dùng |
| `/api/user` | Hồ sơ, người dùng và phân quyền |
| `/api/statistics` | Dữ liệu thống kê cho trang quản trị |
| `/api/ai` | Dịch nội dung CMS bằng Gemini |
| `/api/uploadArray` | Upload nhiều file |

Các endpoint yêu cầu xác thực dùng header:

```http
Authorization: Bearer <access-token>
```

## Luồng dữ liệu AI

1. Quản trị viên tạo hoặc cập nhật tác phẩm.
2. Backend đưa tác vụ `process-artwork` vào BullMQ.
3. AI worker lấy job từ Redis và xử lý bằng Google Gemini.
4. Kết quả được lưu vào PostgreSQL/MongoDB và đồng bộ Algolia.
5. Trạng thái thành công hoặc lỗi được gửi tới giao diện qua Socket.IO.

## Ghi chú phát triển

- Backend phải kết nối được PostgreSQL và MongoDB trước khi bắt đầu lắng nghe cổng HTTP.
- Vite đã cấu hình proxy `/api` và `/socket.io` tới `http://localhost:5000` cho môi trường local.
- Redis được dùng đồng thời cho cache tìm kiếm và worker AI, vì vậy worker cần được chạy cùng backend.
- Chỉ dùng `ALGOLIA_ADMIN_KEY` ở backend. Frontend chỉ được dùng search-only key.
- Các route quản trị kiểm tra role `admin` hoặc `viewer`; thao tác thay đổi dữ liệu nhạy cảm thường yêu cầu role `admin`.

## Đóng góp

1. Tạo branch mới cho thay đổi của bạn.
2. Chạy lint ở cả `Backend` và `Frontend`.
3. Kiểm tra các luồng đăng nhập, upload, tìm kiếm và phân quyền liên quan.
4. Tạo pull request với mô tả rõ thay đổi và cách kiểm thử.
