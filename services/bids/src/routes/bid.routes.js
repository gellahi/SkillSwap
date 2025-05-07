import express from 'express';
import * as bidController from '../controllers/bid.controller.js';
import * as counterOfferController from '../controllers/counter-offer.controller.js';
import * as milestoneController from '../controllers/milestone.controller.js';
import * as feedbackController from '../controllers/feedback.controller.js';
import { authenticate, authorize } from '../../../../shared/middlewares/auth-middleware.js';

const router = express.Router();

/**
 * @route POST /api/bids
 * @desc Create a new bid
 * @access Private/Freelancer
 */
router.post('/', authenticate, authorize('freelancer'), bidController.createBid);

/**
 * @route GET /api/bids/project/:projectId
 * @desc Get all bids for a project
 * @access Public
 */
router.get('/project/:projectId', bidController.getBidsByProjectId);

/**
 * @route GET /api/bids/freelancer/:freelancerId
 * @desc Get all bids by a freelancer
 * @access Private
 */
router.get('/freelancer/:freelancerId', authenticate, bidController.getBidsByFreelancerId);

/**
 * @route GET /api/bids/:id
 * @desc Get bid by ID
 * @access Private
 */
router.get('/:id', authenticate, bidController.getBidById);

/**
 * @route PATCH /api/bids/:id
 * @desc Update bid
 * @access Private/Freelancer
 */
router.patch('/:id', authenticate, authorize('freelancer'), bidController.updateBid);

/**
 * @route PATCH /api/bids/:id/withdraw
 * @desc Withdraw bid
 * @access Private/Freelancer
 */
router.patch('/:id/withdraw', authenticate, authorize('freelancer'), bidController.withdrawBid);

/**
 * @route PATCH /api/bids/:id/accept
 * @desc Accept bid
 * @access Private/Client
 */
router.patch('/:id/accept', authenticate, authorize('client'), bidController.acceptBid);

/**
 * @route PATCH /api/bids/:id/reject
 * @desc Reject bid
 * @access Private/Client
 */
router.patch('/:id/reject', authenticate, authorize('client'), bidController.rejectBid);

/**
 * @route POST /api/bids/:id/counter-offer
 * @desc Create a counter offer
 * @access Private
 */
router.post('/:id/counter-offer', authenticate, counterOfferController.createCounterOffer);

/**
 * @route PATCH /api/bids/:id/counter-offer/:counterOfferId/accept
 * @desc Accept counter offer
 * @access Private
 */
router.patch('/:id/counter-offer/:counterOfferId/accept', authenticate, counterOfferController.acceptCounterOffer);

/**
 * @route PATCH /api/bids/:id/counter-offer/:counterOfferId/reject
 * @desc Reject counter offer
 * @access Private
 */
router.patch('/:id/counter-offer/:counterOfferId/reject', authenticate, counterOfferController.rejectCounterOffer);

/**
 * @route POST /api/bids/:id/milestones
 * @desc Add milestone to bid
 * @access Private/Freelancer
 */
router.post('/:id/milestones', authenticate, authorize('freelancer'), milestoneController.addMilestone);

/**
 * @route PATCH /api/bids/:id/milestones/:milestoneId
 * @desc Update milestone
 * @access Private/Freelancer
 */
router.patch('/:id/milestones/:milestoneId', authenticate, authorize('freelancer'), milestoneController.updateMilestone);

/**
 * @route DELETE /api/bids/:id/milestones/:milestoneId
 * @desc Delete milestone
 * @access Private/Freelancer
 */
router.delete('/:id/milestones/:milestoneId', authenticate, authorize('freelancer'), milestoneController.deleteMilestone);

/**
 * @route PATCH /api/bids/:id/milestones/:milestoneId/status
 * @desc Update milestone status
 * @access Private
 */
router.patch('/:id/milestones/:milestoneId/status', authenticate, milestoneController.updateMilestoneStatus);

/**
 * @route POST /api/bids/:id/feedback/client
 * @desc Add client feedback
 * @access Private/Client
 */
router.post('/:id/feedback/client', authenticate, authorize('client'), feedbackController.addClientFeedback);

/**
 * @route POST /api/bids/:id/feedback/freelancer
 * @desc Add freelancer feedback
 * @access Private/Freelancer
 */
router.post('/:id/feedback/freelancer', authenticate, authorize('freelancer'), feedbackController.addFreelancerFeedback);

/**
 * @route GET /api/bids/:id/feedback
 * @desc Get feedback for a bid
 * @access Private
 */
router.get('/:id/feedback', authenticate, feedbackController.getFeedback);

export default router;
