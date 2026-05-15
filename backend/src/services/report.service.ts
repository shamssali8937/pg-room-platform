import { prisma } from "../config/prisma.js";

export const createReportService = async (reporterId: string, data: any) => {
    return prisma.report.create({
        data: {
            reporter_id: reporterId,
            target_type: data.targetType,
            target_id: data.targetId,
            reason_code: data.reasonCode,
            description: data.description,
        }
    });
};

export const getMyReportsService = async (reporterId: string) => {
    return prisma.report.findMany({
        where: { reporter_id: reporterId },
        orderBy: { created_at: "desc" }
    });
};
