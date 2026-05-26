import { Request, Response, NextFunction } from "express";
import { getMeService, updateMeService, getMyNotificationsService, markNotificationReadService, uploadDocumentService, getMyDocumentsService, saveCardService } from "../services/user.service.js";

export const getMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await getMeService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const updateMe = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await updateMeService(req.user!.id, req.body, req.file);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getMyNotifications = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await getMyNotificationsService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const markNotificationRead = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const id = req.params.id as string;
        const data = await markNotificationReadService(req.user!.id, id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const uploadDocument = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const docType = req.body.doc_type ?? req.params.docType;
        if (!req.file) {
            res.status(400).json({ success: false, message: "No file uploaded" });
            return;
        }
        const data = await uploadDocumentService(req.user!.id, docType, req.file);
        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const getMyDocuments = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await getMyDocumentsService(req.user!.id);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};

export const saveCard = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        const data = await saveCardService(req.user!.id, req.body);
        res.json({ success: true, data });
    } catch (error) {
        next(error);
    }
};