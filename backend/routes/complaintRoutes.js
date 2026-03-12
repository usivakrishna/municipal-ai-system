const express = require('express');
const { body } = require('express-validator');
const upload = require('../config/multer');
const {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint
} = require('../controllers/complaintController');
const { protect } = require('../middleware/auth');
const validate = require('../middleware/validate');

const router = express.Router();

router.use(protect);

router.post(
  '/',
  upload.single('image'),
  [
    body('title').trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    body('description').trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('category').trim().notEmpty().withMessage('Category is required'),
    body('location').trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters')
  ],
  validate,
  createComplaint
);

router.get('/', getComplaints);
router.get('/:id', getComplaintById);

router.put(
  '/:id',
  upload.single('image'),
  [
    body('title').optional().trim().isLength({ min: 5 }).withMessage('Title must be at least 5 characters'),
    body('description').optional().trim().isLength({ min: 10 }).withMessage('Description must be at least 10 characters'),
    body('location').optional().trim().isLength({ min: 3 }).withMessage('Location must be at least 3 characters'),
    body('status')
      .optional()
      .isIn(['pending', 'in_progress', 'resolved', 'rejected'])
      .withMessage('Invalid status value')
  ],
  validate,
  updateComplaint
);

router.delete('/:id', deleteComplaint);

module.exports = router;
