import { useState, useRef, useEffect } from 'react';
import { addRefuel, updateRefuel } from '@/actions/refuel-actions';
import { analyzeRefuelImage } from '@/actions/ai-actions';
import { Camera, Loader2, Sparkles, CheckCircle2, AlertCircle, X } from 'lucide-react';

function cn(...inputs: any[]) {
    return inputs.filter(Boolean).join(' ');
}

interface RefuelFormProps {
    initialData?: any;
    onCancel?: () => void;
}

export default function RefuelForm({ initialData, onCancel }: RefuelFormProps) {
    const formRef = useRef<HTMLFormElement>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [status, setStatus] = useState<{ type: 'success' | 'error' | null; message: string }>({ type: null, message: '' });

    const isEditing = !!initialData;

    // States for manual control
    const [formData, setFormData] = useState({
        amount: '',
        liters: '',
        pricePerLiter: '',
        odometer: '',
        tripDistance: '',
        isFullTank: true,
        date: new Date().toISOString().split('T')[0],
        notes: '',
    });

    // Populate form when initialData changes
    useEffect(() => {
        if (initialData) {
            setFormData({
                amount: initialData.amount?.toString() || '',
                liters: initialData.liters?.toString() || '',
                pricePerLiter: initialData.pricePerLiter?.toString() || '',
                odometer: initialData.odometer?.toString() || '',
                tripDistance: initialData.tripDistance?.toString() || '',
                isFullTank: initialData.isFullTank ?? true,
                date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
                notes: initialData.notes || '',
            });
        }
    }, [initialData]);

    const calculateMissing = (data: typeof formData, lastField: string) => {
        const amount = parseFloat(data.amount);
        const liters = parseFloat(data.liters);
        const price = parseFloat(data.pricePerLiter);

        const newData = { ...data };

        if (lastField === 'amount' || lastField === 'liters') {
            if (!isNaN(amount) && !isNaN(liters) && liters !== 0) {
                newData.pricePerLiter = (amount / liters).toFixed(3);
            }
        } else if (lastField === 'pricePerLiter') {
            if (!isNaN(price) && !isNaN(amount) && price !== 0) {
                newData.liters = (amount / price).toFixed(2);
            } else if (!isNaN(price) && !isNaN(liters)) {
                newData.amount = (liters * price).toFixed(2);
            }
        }

        if (lastField === 'liters' && !isNaN(liters) && !isNaN(price)) {
            newData.amount = (liters * price).toFixed(2);
        }

        if (lastField === 'amount' && !isNaN(amount) && !isNaN(price) && price !== 0) {
            newData.liters = (amount / price).toFixed(2);
        }

        return newData;
    };

    const handleInputChange = (field: string, value: any) => {
        // Only update the field being typed — no auto-calculation on keystroke
        setFormData(prev => ({ ...prev, [field]: value }));
    };

    const handleBlurCalculate = (field: string) => {
        if (['amount', 'liters', 'pricePerLiter'].includes(field)) {
            setFormData(prev => calculateMissing(prev, field));
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setIsAnalyzing(true);
        setStatus({ type: null, message: '' });

        const payload = new FormData();
        payload.append('image', file);

        try {
            const result = await analyzeRefuelImage(payload);
            if (result.success && result.data) {
                const aiData = {
                    ...formData,
                    amount: result.data.amount?.toString() || formData.amount,
                    liters: result.data.liters?.toString() || formData.liters,
                    pricePerLiter: result.data.pricePerLiter?.toString() || formData.pricePerLiter,
                    odometer: result.data.odometer?.toString() || formData.odometer,
                };
                setFormData(calculateMissing(aiData, 'amount'));
                setStatus({ type: 'success', message: '¡IA ha extraído los datos con éxito!' });
            } else {
                setStatus({ type: 'error', message: result.message || 'No se pudo analizar la imagen' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Error de conexión con la IA' });
        } finally {
            setIsAnalyzing(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        setStatus({ type: null, message: '' });

        const formDataObj = new FormData(e.currentTarget);
        if (formData.isFullTank) formDataObj.set('isFullTank', 'on');

        try {
            const result = isEditing
                ? await updateRefuel(initialData._id, formDataObj)
                : await addRefuel(formDataObj);

            if (result.success) {
                setStatus({ type: 'success', message: result.message || '¡Datos guardados!' });
                if (!isEditing) {
                    setFormData({ amount: '', liters: '', pricePerLiter: '', odometer: '', tripDistance: '', isFullTank: true, date: new Date().toISOString().split('T')[0], notes: '' });
                    formRef.current?.reset();
                } else if (onCancel) {
                    onCancel(); // Close edit mode
                }
            } else {
                setStatus({ type: 'error', message: result.message || 'Error al guardar' });
            }
        } catch (err) {
            setStatus({ type: 'error', message: 'Error de red' });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto">
            <div className="glass p-8 rounded-2xl space-y-6 relative">
                {isEditing && (
                    <button
                        onClick={onCancel}
                        className="absolute top-4 right-4 p-2 hover:bg-white/10 rounded-full transition-colors"
                        title="Cancelar edición"
                    >
                        <X className="h-5 w-5" />
                    </button>
                )}

                <div className="flex items-center justify-between">
                    <h2 className="text-2xl font-bold tracking-tight">
                        {isEditing ? 'Editar Repostaje' : 'Nuevo Repostaje'}
                    </h2>
                    {!isEditing && <Sparkles className="text-primary h-6 w-6 animate-pulse" />}
                </div>

                {!isEditing && (
                    <div className="relative">
                        <label className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/30 rounded-xl cursor-pointer hover:border-primary/50 hover:bg-primary/5 transition-all">
                            <div className="flex flex-col items-center justify-center pt-5 pb-6">
                                {isAnalyzing ? (
                                    <Loader2 className="h-8 w-8 text-primary animate-spin" />
                                ) : (
                                    <Camera className="h-8 w-8 text-muted-foreground group-hover:text-primary transition-colors" />
                                )}
                                <p className="mt-2 text-sm text-muted-foreground group-hover:text-primary-foreground">
                                    {isAnalyzing ? 'Analizando con IA...' : 'Sube foto del ticket o surtidor'}
                                </p>
                            </div>
                            <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={isAnalyzing} />
                        </label>
                    </div>
                )}

                <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Importe (€)</label>
                            <input
                                name="amount"
                                type="text"
                                value={formData.amount}
                                onChange={e => handleInputChange('amount', e.target.value)}
                                onBlur={() => handleBlurCalculate('amount')}
                                className="w-full bg-secondary/50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="0.00"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Litros (L)</label>
                            <input
                                name="liters"
                                type="text"
                                value={formData.liters}
                                onChange={e => handleInputChange('liters', e.target.value)}
                                onBlur={() => handleBlurCalculate('liters')}
                                className="w-full bg-secondary/50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="0.00"
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Precio por Litro (€/L)</label>
                        <input
                            name="pricePerLiter"
                            type="text"
                            value={formData.pricePerLiter}
                            onChange={e => handleInputChange('pricePerLiter', e.target.value)}
                            onBlur={() => handleBlurCalculate('pricePerLiter')}
                            className="w-full bg-secondary/50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
                            placeholder="1.50"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Odómetro (km)</label>
                            <input
                                name="odometer"
                                type="text"
                                value={formData.odometer}
                                onChange={e => handleInputChange('odometer', e.target.value)}
                                className="w-full bg-secondary/50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="150000"
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Trip (km)</label>
                            <input
                                name="tripDistance"
                                type="text"
                                value={formData.tripDistance}
                                onChange={e => handleInputChange('tripDistance', e.target.value)}
                                className="w-full bg-secondary/50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all placeholder:text-muted-foreground/50"
                                placeholder="450.5"
                            />
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <input
                            type="checkbox"
                            id="isFullTank"
                            checked={formData.isFullTank}
                            onChange={e => handleInputChange('isFullTank', e.target.checked)}
                            className="w-4 h-4 text-primary bg-secondary border-none rounded focus:ring-primary"
                        />
                        <label htmlFor="isFullTank" className="text-sm">Tanque lleno</label>
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Fecha</label>
                        <input
                            name="date"
                            type="date"
                            value={formData.date}
                            onChange={e => handleInputChange('date', e.target.value)}
                            className="w-full bg-secondary/50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all"
                        />
                    </div>

                    <div className="space-y-2">
                        <label className="text-sm font-medium">Notas</label>
                        <textarea
                            name="notes"
                            rows={2}
                            value={formData.notes}
                            onChange={e => handleInputChange('notes', e.target.value)}
                            className="w-full bg-secondary/50 border-none rounded-lg px-4 py-2 focus:ring-2 focus:ring-primary outline-none transition-all resize-none placeholder:text-muted-foreground/50"
                            placeholder="Ej: Repsol..."
                        />
                    </div>

                    {status.type && (
                        <div className={cn(
                            "p-3 rounded-lg flex items-center gap-2 text-sm",
                            status.type === 'success' ? "bg-green-500/10 text-green-500" : "bg-red-500/10 text-red-500"
                        )}>
                            {status.type === 'success' ? <CheckCircle2 className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />}
                            {status.message}
                        </div>
                    )}

                    <button
                        type="submit"
                        disabled={isSubmitting || isAnalyzing}
                        className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold py-3 rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-primary/20"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin mx-auto" /> : (isEditing ? 'Actualizar Repostaje' : 'Guardar Repostaje')}
                    </button>
                </form>
            </div>
        </div>
    );
}
