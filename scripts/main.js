function ereCalculator() {
    return {
        grossSalary: null,
        bonus: null,
        cheques: null,
        workedDays: null,
        daysPerYear: null,
        mode: 'custom',
        isDaysEditable: true,
        showBonus: false,
        showCheques: false,
        extras: [],
        isExtrasEditable: false,
        inputMethod: 'days', // 'days' or 'date'
        startDate: null,

        initApp() {
            // Notify Telegram that the Web App is ready
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand(); // Expand to full screen
            }

            // Apply initial strategy
            this.applyStrategy();

            // Watch for mode changes
            this.$watch('mode', () => this.applyStrategy());

            // Watch for date changes
            this.$watch('startDate', () => this.calculateDaysFromDate());
            this.$watch('inputMethod', () => {
                if (this.inputMethod === 'date') this.calculateDaysFromDate();
            });
        },

        applyStrategy() {
            let strategy;
            if (this.mode === 'tid') {
                strategy = tidStrategy;
            } else {
                strategy = customStrategy;
            }

            this.daysPerYear = strategy.defaults.daysPerYear;
            this.isDaysEditable = strategy.isDaysEditable;
            this.showBonus = strategy.showBonus;
            this.showCheques = strategy.showCheques;

            // Deep copy extras to avoid reference issues
            this.extras = JSON.parse(JSON.stringify(strategy.extras || []));
            this.isExtrasEditable = strategy.isExtrasEditable;

            // Reset hidden fields
            if (!this.showBonus) this.bonus = null;
            if (!this.showCheques) this.cheques = null;
        },

        calculateDaysFromDate() {
            if (this.inputMethod === 'date' && this.startDate) {
                const start = new Date(this.startDate);
                start.setHours(0, 0, 0, 0);

                const end = new Date();
                end.setHours(0, 0, 0, 0);

                const diffTime = Math.abs(end - start);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                this.workedDays = diffDays;
            }
        },

        addExtra() {
            this.extras.push({ years: 0, amount: 0 });
        },

        removeExtra(index) {
            this.extras.splice(index, 1);
        },

        get totalAnnualSalary() {
            let total = (this.grossSalary || 0);
            if (this.showBonus) total += (this.bonus || 0);
            if (this.showCheques) total += (this.cheques || 0);
            return total;
        },

        get dailySalary() { return this.totalAnnualSalary / 365; },

        get dailySalaryExplanation() {
            const parts = [];
            if (this.grossSalary) parts.push(this.formatCurrency(this.grossSalary) + ' bruto');
            if (this.showBonus && this.bonus) parts.push(this.formatCurrency(this.bonus) + ' bonus');
            if (this.showCheques && this.cheques) parts.push(this.formatCurrency(this.cheques) + ' cheques restaurantes');

            if (parts.length === 0) return '';
            const total = parts.join(' + ');
            return `(${total}) / 365`;
        },

        get maxDate() {
            const date = new Date();
            date.setDate(date.getDate() - 1); // Yesterday
            const year = date.getFullYear();
            const month = String(date.getMonth() + 1).padStart(2, '0');
            const day = String(date.getDate()).padStart(2, '0');
            return `${year}-${month}-${day}`;
        },

        get workedYears() { return this.workedDays / 365; },

        get applicableExtra() {
            if (!this.extras || this.extras.length === 0) return null;
            // Sort by years descending to find the highest applicable tier
            const sortedExtras = [...this.extras].sort((a, b) => b.years - a.years);
            return sortedExtras.find(extra => this.workedYears >= extra.years);
        },

        get totalIndemnity() {
            let total = this.dailySalary * this.daysPerYear * this.workedYears;
            if (this.applicableExtra) {
                total += this.applicableExtra.amount;
            }
            return total;
        },

        get exceedsCap() { return this.daysPerYear == 20 && this.totalIndemnity > this.grossSalary; },

        get calculationExplanation() {
            if (!this.grossSalary || !this.workedDays || !this.daysPerYear) return '';
            let explanation = `${this.formatCurrency(this.dailySalary)} (diario) × ${this.daysPerYear} (días/año) × ${this.workedYears.toFixed(2)} (años)`;

            if (this.applicableExtra) {
                explanation += ` + ${this.formatCurrency(this.applicableExtra.amount)} (prima por > ${this.applicableExtra.years} años)`;
            }

            return explanation;
        },

        formatCurrency(value) {
            return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);
        }
    }
}
