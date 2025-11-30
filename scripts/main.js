function ereCalculator() {
    return {
        grossSalary: null,
        bonus: null,
        benefits: null,
        workedMonths: null,
        daysPerYear: null,
        daysPerMonth: null,
        mode: window.ereStrategies[0].name,
        isDaysEditable: true,
        showBonus: false,
        showBenefits: false,
        isBenefitsEditable: true,
        extras: [],
        isExtrasEditable: false,
        isEndDateEditable: true,
        startDate: null,
        endDate: null,
        maxCompensationMonths: null,
        isMaxCompensationMonthsEditable: true,
        strategies: window.ereStrategies || [],

        initApp() {
            // Notify Telegram that the Web App is ready
            if (window.Telegram && window.Telegram.WebApp) {
                window.Telegram.WebApp.ready();
                window.Telegram.WebApp.expand(); // Expand to full screen
            }

            // Set default end date to today
            this.endDate = new Date().toISOString().split('T')[0];

            // Apply initial strategy
            this.applyStrategy();

            // Watch for mode changes
            this.$watch('mode', () => this.applyStrategy());

            // Watch for date changes
            this.$watch('startDate', () => this.calculateMonthsFromDate());
            this.$watch('endDate', () => this.calculateMonthsFromDate());

            this.$watch('daysPerYear', (newValue) => {
                if (newValue !== null) {
                    this.daysPerMonth = newValue / 12;
                }
            });
        },

        applyStrategy() {
            const strategy = this.strategies.find(s => s.name === this.mode) || this.strategies[0];
            console.log(strategy);
            if (!strategy) {
                console.error('Strategy not found:', this.mode);
                return;
            }

            this.daysPerYear = strategy.defaults.daysPerYear;
            this.daysPerMonth = this.daysPerYear / 12;
            this.isDaysEditable = strategy.isDaysEditable;
            this.showBonus = strategy.showBonus;
            this.showBenefits = strategy.showBenefits;
            this.isBenefitsEditable = strategy.hasOwnProperty('isBenefitsEditable') ? strategy.isBenefitsEditable : true;

            // Deep copy extras to avoid reference issues
            this.extras = JSON.parse(JSON.stringify(strategy.defaults?.extras || []));
            this.isExtrasEditable = strategy.isExtrasEditable;

            // Reset hidden fields
            if (!this.showBonus) this.bonus = null;
            if (!this.showBenefits) {
                this.benefits = null;
            } else if (strategy.defaults && strategy.defaults.benefits) {
                this.benefits = strategy.defaults.benefits;
            }

            // Set end date from strategy default or today
            if (strategy.defaults && strategy.defaults.endDate) {
                this.endDate = strategy.defaults.endDate;
            } else {
                this.endDate = new Date().toISOString().split('T')[0];
            }

            this.isEndDateEditable = strategy.hasOwnProperty('isEndDateEditable') ? strategy.isEndDateEditable : true;

            if (strategy.defaults && strategy.defaults.hasOwnProperty('maxCompensationMonths')) {
                this.maxCompensationMonths = strategy.defaults.maxCompensationMonths;
            } else {
                this.maxCompensationMonths = null;
            }
            this.isMaxCompensationMonthsEditable = strategy.hasOwnProperty('isMaxCompensationMonthsEditable') ? strategy.isMaxCompensationMonthsEditable : true;
        },

        calculateMonthsFromDate() {
            if (this.startDate && this.endDate) {
                const start = new Date(this.startDate);
                const end = new Date(this.endDate);

                if (end < start) {
                    this.workedMonths = 0;
                    return;
                }

                this.workedMonths = (end.getFullYear() - start.getFullYear()) * 12;
                this.workedMonths += end.getMonth() - start.getMonth();

                // If start day <= end day, add 1 month
                if (start.getDate() <= end.getDate()) {
                    this.workedMonths += 1;
                }
                return
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
            if (this.showBenefits) total += (this.benefits || 0);
            return total;
        },

        get dailySalary() { return this.totalAnnualSalary / 365; },

        get dailySalaryExplanation() {
            const parts = [];
            if (this.grossSalary) parts.push(this.formatCurrency(this.grossSalary) + ' bruto');
            if (this.showBonus && this.bonus) parts.push(this.formatCurrency(this.bonus) + ' bonus');
            if (this.showBenefits && this.benefits) parts.push(this.formatCurrency(this.benefits) + ' beneficios');

            if (parts.length === 0) return '';
            const total = parts.join(' + ');
            return `(${total}) / 365`;
        },

        get workedYears() { return this.workedMonths / 12; },

        get applicableExtra() {
            if (!this.extras || this.extras.length === 0) return null;
            const sortedExtras = [...this.extras].sort((a, b) => b.years - a.years);
            return sortedExtras.find(extra => this.workedYears >= extra.years);
        },

        get totalDaysIndemnity() {
            const totalDays = this.daysPerMonth * this.workedMonths;
            if (this.maxCompensationMonths && this.maxCompensationMonths > 0) {
                return Math.min(totalDays, this.maxCompensationMonths * 30);
            } else {
                return totalDays;
            }
        },

        get totalIndemnity() {
            let total = this.dailySalary * this.totalDaysIndemnity;
            if (this.applicableExtra) {
                total += this.applicableExtra.amount;
            }
            return total;
        },

        get isCapped() {

            if (this.maxCompensationMonths && this.maxCompensationMonths > 0) {
                return this.daysPerMonth * this.workedMonths > this.maxCompensationMonths * 30;
            } else {
                return false;
            }
        },

        get calculationExplanation() {
            if (!this.grossSalary || !this.workedMonths || !this.daysPerYear) return '';
            let explanation = '';
            if (this.isCapped) {
                explanation = `${this.formatCurrency(this.dailySalary)} (diario) × ${this.maxCompensationMonths * 30} (máximo de meses en días)`;
            } else {
                explanation = `${this.formatCurrency(this.dailySalary)} (diario) × ${this.daysPerMonth.toFixed(2)} (días/mes) × ${this.workedMonths} (meses)`;
            }

            if (this.applicableExtra) {
                explanation += ` + ${this.formatCurrency(this.applicableExtra.amount)} (prima por > ${this.applicableExtra.years} años)`;
            }

            return explanation;
        },

        formatCurrency(value) {
            return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);
        },

        formatDecimal(value, decimals = 2) {
            return Number(value || 0).toFixed(decimals);
        }
    }
}
