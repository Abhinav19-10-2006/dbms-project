import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class DateSimulationService {
    private STORAGE_KEY = 'library_virtual_date';
    private virtualDate = signal<string | null>(localStorage.getItem(this.STORAGE_KEY));

    setVirtualDate(date: Date | null) {
        if (date) {
            const d = new Date(date);
            const yr = d.getFullYear();
            const mo = String(d.getMonth() + 1).padStart(2, '0');
            const da = String(d.getDate()).padStart(2, '0');
            const localISOTime = `${yr}-${mo}-${da}`;

            this.virtualDate.set(localISOTime);
            localStorage.setItem(this.STORAGE_KEY, localISOTime);
        } else {
            this.virtualDate.set(null);
            localStorage.removeItem(this.STORAGE_KEY);
        }
    }

    getVirtualDate() {
        return this.virtualDate();
    }

    getVirtualDateAsDate() {
        const val = this.virtualDate();
        return val ? new Date(val) : new Date();
    }
}
