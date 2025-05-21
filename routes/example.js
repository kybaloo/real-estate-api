import express from 'express';
import { getExamples, getExampleById, createExample } from '../controllers/exampleController.js';

const router = express.Router();

// @route   GET /api/examples
// @desc    Récupérer tous les exemples
// @access  Public
router.get('/', getExamples);

// @route   GET /api/examples/:id
// @desc    Récupérer un exemple par son ID
// @access  Public
router.get('/:id', getExampleById);

// @route   POST /api/examples
// @desc    Créer un nouvel exemple
// @access  Public
router.post('/', createExample);

export default router;
