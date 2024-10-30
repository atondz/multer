const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');

const app = express();
const PORT = process.env.PORT || 3000;

// Cấu hình Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});
const upload = multer({
  storage: storage,
  limits: { fileSize: 2 * 1024 * 1024 }, // Giới hạn 2MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf/;
    const ext = path.extname(file.originalname).toLowerCase();
    if (allowedTypes.test(ext)) {
      cb(null, true);
    } else {
      cb(new Error('Chỉ hỗ trợ các định dạng: JPEG, PNG, GIF, PDF'));
    }
  }
});

// Tạo thư mục 'uploads/' nếu chưa có
if (!fs.existsSync('./uploads')) {
  fs.mkdirSync('./uploads');
}

// Route upload một file
app.post('/upload-single', upload.single('singleFile'), (req, res) => {
  console.log('File đã upload:', req.file);
  res.redirect('/upload.html');
});

// Route upload nhiều file
app.post('/upload-multiple', upload.array('multiFiles', 5), (req, res) => {
  console.log('Các file đã upload:', req.files);
  res.redirect('/upload.html');
});

// Route lấy danh sách file đã upload
app.get('/uploaded-files', (req, res) => {
  fs.readdir('./uploads', (err, files) => {
    if (err) {
      return res.status(500).json({ error: 'Lỗi khi lấy danh sách file' });
    }
    res.json(files);
  });
});

// Route tải xuống file
app.get('/download/:filename', (req, res) => {
  const fileName = req.params.filename;
  const filePath = path.join(__dirname, 'uploads', fileName);
  
  // Kiểm tra xem file có tồn tại không
  fs.access(filePath, fs.constants.F_OK, (err) => {
    if (err) {
      return res.status(404).json({ error: 'File không tồn tại' });
    }
    res.download(filePath, (err) => {
      if (err) {
        return res.status(500).json({ error: 'Lỗi khi tải xuống file' });
      }
    });
  });
});

// Phục vụ file HTML từ thư mục 'public'
app.use(express.static('public'));

// Khởi động server
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
