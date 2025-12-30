# Image Upload Setup Guide

## ✅ What's Implemented:

Your app now has **complete image upload functionality** with:
- Profile picture upload/update/delete
- Automatic image optimization (400x400, face-focused)
- Cloud storage (never stores in database)
- Old image cleanup when uploading new one

## 📦 Required Packages:

```bash
cd backend
npm install cloudinary multer
```

## 🔐 Cloudinary Setup (Free Tier):

1. **Sign up**: https://cloudinary.com/users/register/free
   - Free tier: 25GB storage + 25GB bandwidth/month
   
2. **Get credentials** from dashboard:
   - Cloud Name
   - API Key
   - API Secret

3. **Add to `.env`**:
```env
# Cloudinary (Image Upload)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

## 📡 API Endpoints:

### 1. Upload Avatar
```http
POST /api/users/avatar
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body: avatar (file)
```

### 2. Update Profile (with optional avatar)
```http
PUT /api/users/profile
Authorization: Bearer <token>
Content-Type: multipart/form-data

Body:
  fullName: string
  bio: string
  username: string
  avatar: file (optional)
```

### 3. Delete Avatar
```http
DELETE /api/users/avatar
Authorization: Bearer <token>
```

## 📱 Flutter Usage Example:

```dart
import 'package:image_picker/image_picker.dart';
import 'package:dio/dio.dart';

Future<void> uploadAvatar() async {
  final ImagePicker picker = ImagePicker();
  final XFile? image = await picker.pickImage(
    source: ImageSource.gallery,
    maxWidth: 1024,
    maxHeight: 1024,
    imageQuality: 85,
  );
  
  if (image != null) {
    FormData formData = FormData.fromMap({
      'avatar': await MultipartFile.fromFile(
        image.path,
        filename: 'avatar.jpg',
      ),
    });
    
    final response = await dio.post(
      '/users/avatar',
      data: formData,
    );
    
    // Response: { "success": true, "data": { "avatarUrl": "https://..." } }
  }
}
```

## 🎨 Features:

✅ **Automatic Optimization**:
- Resizes to 400x400px
- Face-focused cropping
- Auto-format conversion (WebP for smaller size)
- Quality optimization

✅ **Smart Storage**:
- Stores in Cloudinary (not database)
- Database only stores URL
- Old images automatically deleted
- Fast CDN delivery worldwide

✅ **Security**:
- Max file size: 5MB
- Only images allowed (JPEG, PNG, GIF, WebP)
- Authentication required
- Malicious file detection

## 🔄 How It Works:

1. **User uploads image** → Frontend sends multipart/form-data
2. **Server validates** → Checks file type, size, authentication
3. **Uploads to Cloudinary** → Optimizes and stores in cloud
4. **Deletes old image** → Removes previous avatar from cloud
5. **Updates database** → Saves new Cloudinary URL
6. **Returns URL** → Frontend displays new avatar

## 🚀 Start Server:

```bash
cd backend
npm install cloudinary multer
npm start
```

## ✨ Benefits:

- ✅ Never stores files on server disk
- ✅ Unlimited users can upload
- ✅ Images load fast (CDN)
- ✅ Automatic backups
- ✅ Free tier is generous
- ✅ Images persist forever
- ✅ No database bloat

Your images are now stored professionally in the cloud! 🎉
