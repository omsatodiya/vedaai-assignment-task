import { Router } from 'express';
import { upload } from '../lib/upload.js';
import {
  getAssignments,
  getAssignment,
  createAssignment,
  deleteAssignment,
  regenerateAssignment,
  regenerateSection,
} from '../controllers/assignment.controller.js';

const router = Router();

router.get('/', getAssignments);
router.get('/:id', getAssignment);
router.post('/create', upload.single('file'), createAssignment);
router.post('/:id/regenerate', regenerateAssignment);
router.post('/:id/sections/:configIndex/regenerate', regenerateSection);
router.delete('/:id', deleteAssignment);

export default router;
