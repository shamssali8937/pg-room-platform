import { Request, Response, NextFunction } from "express";
import * as bookingService from "../services/booking.service.js";
import { logger } from "../config/logger.js";

export const createBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const roomId = req.params.roomId as string;
        const data = await bookingService.createBookingService(req.user!.id, roomId, req.body);
        logger.info("Booking created", { bookingId: data.id, tenantId: req.user!.id, roomId, requestId: req.requestId });
        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getOwnerBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await bookingService.getOwnerBookingsService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getTenantBookings = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await bookingService.getTenantBookingsService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const updateBookingStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await bookingService.updateBookingStatusService(req.user!.id, id, req.body.status, req.body.owner_note);
        logger.info("Booking status updated", { bookingId: id, status: req.body.status, ownerId: req.user!.id, requestId: req.requestId });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const cancelBooking = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await bookingService.cancelBookingService(req.user!.id, id);
        logger.info("Booking cancelled", { bookingId: id, tenantId: req.user!.id, requestId: req.requestId });
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};
