import { Router } from 'express';
import { upload } from '../lib/upload.js';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  deleteAssignment,
} from '../controllers/assignment.controller.js';

const router = Router();

router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.post('/create', upload.single('file'), createAssignment);
router.delete('/:id', deleteAssignment);

export default router;
