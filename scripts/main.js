function ereCalculator() {
    return {
        grossSalary: null,
        bonus: null,
        benefits: null,
        workedMonths: null,
        daysPerYear1: null,
        daysPerYear2: null,
        daysPerMonth1: null,
        daysPerMonth2: null,
        mode: window.ereStrategies[0].name,
        lastMode: window.ereStrategies[0].name,
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
        payments: [],
        installmentYears: 1,
        allowedInstallmentYears: [],
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

            this.$watch('mode', (newMode) => {
                const strategy = this.strategies.find(s => s.name === newMode);
                if (strategy && strategy.url) {
                    window.open(strategy.url, '_blank');
                    this.mode = this.lastMode;
                } else {
                    this.lastMode = newMode;
                    this.applyStrategy();
                }
            });

            // Watch for date changes
            this.$watch('startDate', () => {
                this.workedMonths = this.calculateMonthsFromDate(this.startDate, this.endDate);
            });
            this.$watch('endDate', () => {
                this.workedMonths = this.calculateMonthsFromDate(this.startDate, this.endDate);
                this.generatePayments();
            });

            this.$watch('daysPerYear1', (newValue) => {
                if (newValue !== null) {
                    this.daysPerMonth1 = newValue / 12;
                }
            });
            this.$watch('daysPerYear2', (newValue) => {
                if (newValue !== null) {
                    this.daysPerMonth2 = newValue / 12;
                }
            });

            this.$watch('installmentYears', () => {
                this.generatePayments();
            });
            this.$watch('endDate', () => {
                this.workedMonths = this.calculateMonthsFromDate(this.startDate, this.endDate);
                this.generatePayments();
            });
        },

        applyStrategy() {
            const strategy = this.strategies.find(s => s.name === this.mode) || this.strategies[0];
            if (!strategy) {
                console.error('Strategy not found:', this.mode);
                return;
            }

            // Handle legacy or single daysPerYear config
            if (strategy.defaults.daysPerYear !== undefined) {
                this.daysPerYear1 = strategy.defaults.daysPerYear;
                this.daysPerYear2 = strategy.defaults.daysPerYear;
            } else {
                if (strategy.defaults.daysPerYear1 !== undefined) this.daysPerYear1 = strategy.defaults.daysPerYear1;
                if (strategy.defaults.daysPerYear2 !== undefined) this.daysPerYear2 = strategy.defaults.daysPerYear2;
            }

            this.daysPerMonth1 = this.daysPerYear1 / 12;
            this.daysPerMonth2 = this.daysPerYear2 / 12;
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

            if (strategy.defaults && strategy.defaults.endDate) {
                this.endDate = strategy.defaults.endDate;
            }

            this.isEndDateEditable = strategy.hasOwnProperty('isEndDateEditable') ? strategy.isEndDateEditable : true;

            if (strategy.defaults && strategy.defaults.hasOwnProperty('maxCompensationMonths')) {
                this.maxCompensationMonths = strategy.defaults.maxCompensationMonths;
            } else {
                this.maxCompensationMonths = null;
            }
            this.isMaxCompensationMonthsEditable = strategy.hasOwnProperty('isMaxCompensationMonthsEditable') ? strategy.isMaxCompensationMonthsEditable : true;

            if (strategy.defaults && strategy.defaults.paymentDates) {
                this.payments = strategy.defaults.paymentDates.map((date, index) => ({
                    label: `Pago ${index + 1}`,
                    date: date
                }));
            } else {
                this.payments = [];
            }

            if (strategy.defaults && strategy.defaults.installmentOptions) {
                this.allowedInstallmentYears = strategy.defaults.installmentOptions;
                this.installmentYears = 1;
                this.generatePayments();
            } else {
                this.allowedInstallmentYears = [];
                this.installmentYears = 1;
            }
        },

        generatePayments() {
            if (!this.endDate || !this.installmentYears) {
                this.payments = [];
                return;
            }

            const newPayments = [];
            const baseDate = new Date(this.endDate);

            for (let i = 0; i < this.installmentYears; i++) {
                const yearDate = new Date(baseDate);
                yearDate.setFullYear(baseDate.getFullYear() + i);
                newPayments.push({
                    label: `Pago año ${i + 1}`,
                    date: yearDate.toISOString().split('T')[0]
                });
            }
            this.payments = newPayments;
        },

        calculateMonthsFromDate(startDate, endDate) {
            if (startDate && endDate) {
                const start = new Date(startDate);
                const end = new Date(endDate);

                if (end < start) {
                    return 0;
                }

                let months = (end.getFullYear() - start.getFullYear()) * 12;
                months += end.getMonth() - start.getMonth();

                if (start.getDate() <= end.getDate()) {
                    months += 1;
                }
                return months;
            }
            return 0;
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
            return Math.max(0, total);
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

        get workedYearsForBonus() {
            if (!this.startDate) return 0;
            const bonusEndDate = '2026-12-31';
            const bonusMonths = this.calculateMonthsFromDate(this.startDate, bonusEndDate);
            return bonusMonths / 12;
        },

        get applicableExtra() {
            if (!this.extras || this.extras.length === 0) return null;
            const sortedExtras = [...this.extras].sort((a, b) => b.years - a.years);
            return sortedExtras.find(extra => this.workedYearsForBonus >= extra.years);
        },

        get totalDaysIndemnity() {
            if (!this.startDate || !this.endDate) return 0;
            const splitDate = new Date('2012-02-12');
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);

            let months1 = 0;
            let months2 = 0;

            if (start < splitDate) {
                const end1 = end < splitDate ? end : new Date('2012-02-11');
                months1 = this.calculateMonthsFromDate(start, end1);
            }

            if (end >= splitDate) {
                const start2 = start > splitDate ? start : splitDate;
                months2 = this.calculateMonthsFromDate(start2, end);
            }

            const days1 = months1 * this.daysPerMonth1;
            const days2 = months2 * this.daysPerMonth2;
            const totalDays = days1 + days2;

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
                const splitDate = new Date('2012-02-12');
                const start = new Date(this.startDate);
                const end = new Date(this.endDate);

                let months1 = 0;
                let months2 = 0;

                if (start < splitDate) {
                    const end1 = end < splitDate ? end : new Date('2012-02-11');
                    months1 = this.calculateMonthsFromDate(start, end1);
                }

                if (end >= splitDate) {
                    const start2 = start > splitDate ? start : splitDate;
                    months2 = this.calculateMonthsFromDate(start2, end);
                }
                const totalRawDays = (months1 * this.daysPerMonth1) + (months2 * this.daysPerMonth2);

                return totalRawDays > this.maxCompensationMonths * 30;
            } else {
                return false;
            }
        },

        get isDateInvalid() {
            if (!this.startDate || !this.endDate) return false;
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            return end < start;
        },

        get calculationExplanation() {
            let explanation = '';
            if (this.isCapped) {
                explanation = `Límite máximo de ${this.maxCompensationMonths} meses (${this.maxCompensationMonths * 30} días) × ${this.formatCurrency(this.dailySalary)}`;
            } else {
                // Breakdown calculation
                const splitDate = new Date('2012-02-12');
                const start = new Date(this.startDate);
                const end = new Date(this.endDate);
                let explanationParts = [];

                if (start < splitDate) {
                    const end1 = end < splitDate ? end : new Date('2012-02-11');
                    let months1 = this.calculateMonthsFromDate(start, end1);
                    if (months1 > 0) {
                        explanationParts.push(`Hasta 11/02/2012: ${months1} meses × ${this.formatDecimal(this.daysPerMonth1)} días/mes = ${this.formatDecimal(months1 * this.daysPerMonth1)} días`);
                    }
                }

                if (end >= splitDate) {
                    const start2 = start > splitDate ? start : splitDate;
                    let months2 = this.calculateMonthsFromDate(start2, end);
                    if (months2 > 0) {
                        explanationParts.push(`Desde 12/02/2012: ${months2} meses × ${this.formatDecimal(this.daysPerMonth2)} días/mes = ${this.formatDecimal(months2 * this.daysPerMonth2)} días`);
                    }
                }
                explanation = explanationParts.join('<br>') + `<br>Total: ${this.formatDecimal(this.totalDaysIndemnity)} × ${this.formatCurrency(this.dailySalary)} = ${this.formatCurrency(this.totalDaysIndemnity * this.dailySalary)}`;
            }

            if (this.applicableExtra) {
                explanation += `<br>+ ${this.formatCurrency(this.applicableExtra.amount)} (prima de voluntariedad > ${this.applicableExtra.years} años)`;
            }

            return explanation;
        },

        get taxExemptIndemnity() {
            if (!this.startDate || !this.endDate || !this.dailySalary) return 0;

            const splitDate1 = new Date('2012-02-11');
            const splitDate2 = new Date('2012-02-12');
            const daysPerMonthPeriod1 = 3.75;
            const daysPerMonthPeriod2 = 2.75;
            const maxMonthsPeriod1 = 42;
            const maxMonthsPeriod2 = 24;
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);

            let months1 = 0;
            let months2 = 0;

            if (start <= splitDate1) {
                const end1 = end < splitDate1 ? end : splitDate1;
                months1 = this.calculateMonthsFromDate(start, end1);
            }

            if (end >= splitDate2) {
                const start2 = start > splitDate2 ? start : splitDate2;
                months2 = this.calculateMonthsFromDate(start2, end);
            }

            const daysPeriod1 = months1 * daysPerMonthPeriod1;
            const daysPeriod2 = months2 * daysPerMonthPeriod2;
            const limitedDays1 = Math.min(daysPeriod1, maxMonthsPeriod1 * 30);
            const limitedDays2 = Math.max(Math.min(daysPeriod1 + daysPeriod2, maxMonthsPeriod2 * 30) - daysPeriod1, 0);

            const amount1 = limitedDays1 * this.dailySalary;
            const amount2 = limitedDays2 * this.dailySalary;

            const total = amount1 + amount2;
            return Math.min(total, 180000);
        },

        get taxExemptExplanation() {
            if (!this.startDate || !this.endDate || !this.dailySalary) return '';

            const splitDate1 = new Date('2012-02-11');
            const splitDate2 = new Date('2012-02-12');
            const daysPerMonthPeriod1 = 3.75;
            const daysPerMonthPeriod2 = 2.75;
            const maxMonthsPeriod1 = 42;
            const maxMonthsPeriod2 = 24;
            const start = new Date(this.startDate);
            const end = new Date(this.endDate);

            let months1 = 0;
            let months2 = 0;
            let explanation = [];
            let limitedDays1 = 0;
            let limitedDays2 = 0;

            if (start <= splitDate1) {
                const end1 = end < splitDate1 ? end : splitDate1;
                months1 = this.calculateMonthsFromDate(start, end1);
                if (months1 > 0) {
                    const daysPeriod1 = months1 * daysPerMonthPeriod1;
                    limitedDays1 = daysPeriod1;
                    let text_explanation = '• Hasta 11/02/2012:';
                    if (daysPeriod1 > maxMonthsPeriod1 * 30) {
                        limitedDays1 = maxMonthsPeriod1 * 30;
                        text_explanation += ` ${limitedDays1} (máximo de meses en días) × ${this.formatCurrency(this.dailySalary)} (diario) = ${this.formatCurrency(limitedDays1 * this.dailySalary)}`;
                        text_explanation += ` (limitado a ${maxMonthsPeriod1} meses)`;
                    }
                    else {
                        text_explanation += ` ${months1} (meses) × ${daysPerMonthPeriod1} (días/mes) × ${this.formatCurrency(this.dailySalary)} (diario) = ${this.formatCurrency(months1 * daysPerMonthPeriod1 * this.dailySalary)}`;
                    }
                    explanation.push(text_explanation);
                }
            }

            if (end >= splitDate2) {
                const start2 = start > splitDate2 ? start : splitDate2;
                months2 = this.calculateMonthsFromDate(start2, end);
                if (months2 > 0) {
                    const daysPeriod2 = months2 * daysPerMonthPeriod2;
                    limitedDays2 = Math.max(Math.min(limitedDays1 + daysPeriod2, maxMonthsPeriod2 * 30) - limitedDays1, 0);

                    let text_explanation = '• Desde 12/02/2012:';
                    if (limitedDays2 < daysPeriod2) {
                        text_explanation += ` ${limitedDays2.toFixed(2)} (días limitados) × ${this.formatCurrency(this.dailySalary)} (diario) = ${this.formatCurrency(limitedDays2 * this.dailySalary)}`;
                        text_explanation += ` (limitado por el máximo total de ${maxMonthsPeriod2} meses)`;
                    } else {
                        text_explanation += ` ${months2} (meses) × ${daysPerMonthPeriod2} (días/mes) × ${this.formatCurrency(this.dailySalary)} (diario) = ${this.formatCurrency(months2 * daysPerMonthPeriod2 * this.dailySalary)}`;
                    }
                    explanation.push(text_explanation);
                }
            }

            const amount1 = limitedDays1 * this.dailySalary;
            const amount2 = limitedDays2 * this.dailySalary;
            const total = amount1 + amount2;

            if (explanation.length > 0) {
                if (total > 180000) {
                    explanation.push(`• Límite legal aplicado: 180.000,00 €`);
                }
            }

            return explanation.join('<br>');
        },

        get installmentPayments() {
            if (!this.payments || this.payments.length === 0) return [];

            if (this.payments.length === 1) {
                return [{
                    label: this.payments[0].label,
                    date: this.payments[0].date,
                    amount: this.totalIndemnity
                }];
            }

            const total = this.totalIndemnity;
            const exempt = this.taxExemptIndemnity;
            const taxable = Math.max(0, total - exempt);

            const numInstallments = this.payments.length;
            // First year gets exempt part
            // Remaining years (N-1) share the taxable part
            const restYears = numInstallments - 1;
            const amountPerRestYear = restYears > 0 ? taxable / restYears : 0;

            return this.payments.map((p, index) => {
                let amount = 0;
                if (index === 0) {
                    amount = exempt;
                } else {
                    amount = amountPerRestYear;
                }
                return {
                    label: p.label,
                    date: p.date,
                    amount: amount
                };
            });
        },

        get paymentYears() {
            if (!this.payments || this.payments.length === 0) return 1;
            const years = new Set(this.payments.map(p => new Date(p.date).getFullYear()));
            return years.size;
        },

        get isIrregularIncome() {
            if (!this.startDate || !this.endDate) return false;

            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            const yearsToAdd = this.paymentYears * 2;

            const targetDate = new Date(start);
            targetDate.setFullYear(targetDate.getFullYear() + yearsToAdd);
            targetDate.setDate(targetDate.getDate() + 1);

            return end >= targetDate;
        },

        get isIrregularIncomeSinglePayment() {
            if (!this.startDate || !this.endDate) return false;

            const start = new Date(this.startDate);
            const end = new Date(this.endDate);
            const yearsToAdd = 2;

            const targetDate = new Date(start);
            targetDate.setFullYear(targetDate.getFullYear() + yearsToAdd);
            targetDate.setDate(targetDate.getDate() + 1);

            return end >= targetDate;
        },

        get lostIrregularIncomeRights() {
            return this.isIrregularIncomeSinglePayment && !this.isIrregularIncome;
        },



        formatCurrency(value) {
            return new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR' }).format(value || 0);
        },

        formatDecimal(value, decimals = 2) {
            return Number(value || 0).toFixed(decimals);
        }
    }
}
