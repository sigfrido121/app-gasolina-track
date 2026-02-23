import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IRefuel extends Document {
    date: Date;
    amount: number;
    liters: number;
    odometer: number;
    pricePerLiter: number;
    evidenceUrl?: string;
    notes?: string;
    tripDistance?: number;
    isFullTank: boolean;
    isEstimated: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const RefuelSchema = new Schema<IRefuel>(
    {
        date: {
            type: Date,
            required: true,
            default: Date.now
        },
        amount: {
            type: Number,
            required: [true, 'El importe es obligatorio'],
            min: 0
        },
        liters: {
            type: Number,
            required: [true, 'Los litros son obligatorios'],
            min: 0
        },
        odometer: {
            type: Number,
            required: [true, 'El kilometraje es obligatorio'],
            min: 0
        },
        pricePerLiter: {
            type: Number,
            required: true
        },
        tripDistance: { type: Number },
        isFullTank: { type: Boolean, default: true },
        isEstimated: { type: Boolean, default: false },
        evidenceUrl: {
            type: String
        },
        notes: {
            type: String
        }
    },
    {
        timestamps: true,
    }
);

const Refuel: Model<IRefuel> = mongoose.models.Refuel || mongoose.model<IRefuel>('Refuel', RefuelSchema);

export default Refuel;
