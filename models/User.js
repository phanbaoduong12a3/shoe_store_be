const mongoose =require("mongoose");

const AddressSchema = mongoose.Schema({
  recipientName: { type: String, required: true },
  phone: { type: String, required: true },
  address: { type: String, required: true },
  ward: { type: String, required: true },
  district: { type: String, required: true },
  city: { type: String, required: true },
  isDefault: { type: Boolean, default: false }
}, { _id: true });

const UserSchema = mongoose.Schema({
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  fullName: { type: String, required: true },
  phone: { type: String },
  avatar: { 
    type: String, 
    default: 'https://media.istockphoto.com/photos/businessman-silhouette-as-avatar-or-default-profile-picture-picture-id476085198?k=20&m=476085198&s=612x612&w=0&h=8J3VgOZab_OiYoIuZfiMIvucFYB8vWYlKnSjKuKeYQM=' 
  },
  role: { type: String, enum: ['customer', 'admin', 'staff'], default: 'customer' },
  addresses: [AddressSchema],
  wishlist: [{ type: mongoose.Schema.Types.ObjectId, ref: 'products' }],
  loyaltyPoints: { type: Number, default: 0 },
  token: String
}, { timestamps: true, collection: 'users' });

const User = mongoose.model('users', UserSchema);

module.exports = User;

/**
 * @swagger
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required:
 *         - email
 *         - password
 *         - fullName
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId of the user
 *           example: 652af9b0e8a45a7b9b3f78a4
 *         email:
 *           type: string
 *           description: User email (unique)
 *           example: user@example.com
 *         password:
 *           type: string
 *           description: Encrypted password
 *           example: "$2a$10$8zBxD1f..."
 *         fullName:
 *           type: string
 *           example: John Doe
 *         phone:
 *           type: string
 *           example: "+84912345678"
 *         avatar:
 *           type: string
 *           description: Avatar URL of the user
 *           example: "https://media.istockphoto.com/...default-profile-picture..."
 *         role:
 *           type: string
 *           enum: [customer, admin, staff]
 *           default: customer
 *           example: customer
 *         addresses:
 *           type: array
 *           description: List of user's saved addresses
 *           items:
 *             $ref: '#/components/schemas/Address'
 *         wishlist:
 *           type: array
 *           items:
 *             type: string
 *             description: Product ID in wishlist
 *             example: 6530e6a2bf82d1b9d8d912c7
 *         loyaltyPoints:
 *           type: number
 *           default: 0
 *           example: 120
 *         token:
 *           type: string
 *           description: JWT token for session or authentication
 *           example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
 *         createdAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-16T08:20:15.000Z"
 *         updatedAt:
 *           type: string
 *           format: date-time
 *           example: "2025-10-16T08:21:40.000Z"
 *
 *     Address:
 *       type: object
 *       required:
 *         - recipientName
 *         - phone
 *         - address
 *         - ward
 *         - district
 *         - city
 *       properties:
 *         _id:
 *           type: string
 *           description: MongoDB ObjectId of the address
 *           example: 6530f45a3b912a7d9f8d8c12
 *         recipientName:
 *           type: string
 *           example: Jane Smith
 *         phone:
 *           type: string
 *           example: "+84988888888"
 *         address:
 *           type: string
 *           example: "123 Nguyễn Trãi, Phường 5"
 *         ward:
 *           type: string
 *           example: "Phường 5"
 *         district:
 *           type: string
 *           example: "Quận 5"
 *         city:
 *           type: string
 *           example: "Hồ Chí Minh"
 *         isDefault:
 *           type: boolean
 *           default: false
 *           example: true
 */

