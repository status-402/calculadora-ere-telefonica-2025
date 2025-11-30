const tests = {
    async run() {
        const resultsDiv = document.getElementById('results');
        resultsDiv.innerHTML = '';
        let passed = 0;
        let failed = 0;

        const log = (msg, isSuccess) => {
            const div = document.createElement('div');
            div.className = isSuccess ? 'pass' : 'fail';
            div.textContent = (isSuccess ? '✓ ' : '✗ ') + msg;
            resultsDiv.appendChild(div);
        };

        const assert = (condition, msg) => {
            if (condition) {
                passed++;
                log(msg, true);
            } else {
                failed++;
                log(msg + ' (FAILED)', false);
                console.error('Test failed:', msg);
            }
        };

        const createTestApp = () => {
            const app = ereCalculator();
            // Mock Alpine.js $watch
            app.$watch = (property, callback) => {
                // Simple mock: store watchers if needed, or just ignore for basic logic tests
            };
            return app;
        };

        try {
            // --- Test Suite ---

            // 1. Base Calculation with Months
            (() => {
                const app = createTestApp();
                app.initApp();
                app.grossSalary = 36500;
                app.workedMonths = 12;
                app.daysPerYear = 20;
                app.daysPerMonth = 20 / 12;

                assert(Math.abs(app.dailySalary - 100) < 0.01, 'Base: Daily Salary is 100');
                assert(Math.abs(app.workedYears - 1) < 0.01, 'Base: Worked Years is 1');
                assert(Math.abs(app.totalIndemnity - 2000) < 1, 'Base: Total Indemnity ~2000 (100 * 1.67 * 12)');
            })();

            // 2. Bonus & Benefits (Custom)
            (() => {
                const app = createTestApp();
                app.mode = 'custom';
                app.applyStrategy();
                app.grossSalary = 30000;
                app.bonus = 5000;
                app.benefits = 1500;

                assert(app.totalAnnualSalary === 36500, 'Custom: Total Annual includes Bonus and Benefits');
            })();

            // 3. Example 1 Strategy
            (() => {
                const app = createTestApp();
                app.mode = 'example1';
                app.applyStrategy();
                app.grossSalary = 30000;
                app.bonus = 5000;

                assert(app.showBenefits === true, 'Example 1: Benefits shown');
                assert(app.daysPerYear === 50, 'Example 1: Days per year is 50');
                assert(Math.abs(app.daysPerMonth - 50 / 12) < 0.01, 'Example 1: Days per month is 50/12');
                assert(app.isDaysEditable === false, 'Example 1: Days per year not editable');
            })();

            // 4. Seniority Extras (Example 1)
            (() => {
                const app = createTestApp();
                app.mode = 'example1';
                app.applyStrategy();
                app.grossSalary = 34100;
                app.workedMonths = 72;

                assert(app.applicableExtra.amount === 15000, 'Extras: Correct tier found (5 years)');
                assert(Math.abs(app.totalIndemnity - 45000) < 1, app.totalIndemnity + 'Extras: Total includes extra amount');
            })();

            // 5. Month Calculation - Same day (should add 1 month)
            (() => {
                const app = createTestApp();
                app.startDate = '2023-01-15';
                app.endDate = '2023-03-15';
                app.calculateMonthsFromDate();

                // Jan to Mar = 2 months, day 15 <= 15, so +1 month = 3 months
                assert(app.workedMonths === 3, 'Months: Same day adds 1 month (15 to 15 = 3 months)');
            })();

            // 6. Month Calculation - Start day less than end day (should add 1 month)
            (() => {
                const app = createTestApp();
                app.startDate = '2023-01-10';
                app.endDate = '2023-03-20';
                app.calculateMonthsFromDate();

                // Jan to Mar = 2 months, day 10 <= 20, so +1 month = 3 months
                assert(app.workedMonths === 3, 'Months: Start day < end day adds 1 month (10 to 20 = 3 months)');
            })();

            // 7. Month Calculation - Start day greater than end day (no additional month)
            (() => {
                const app = createTestApp();
                app.startDate = '2023-01-20';
                app.endDate = '2023-03-10';
                app.calculateMonthsFromDate();

                // Jan to Mar = 2 months, day 20 > 10, so no +1 = 2 months
                assert(app.workedMonths === 2, 'Months: Start day > end day no addition (20 to 10 = 2 months)');
            })();

            // 8. Month Calculation - Full years
            (() => {
                const app = createTestApp();
                app.startDate = '2020-01-01';
                app.endDate = '2023-01-01';
                app.calculateMonthsFromDate();

                // 3 years * 12 = 36 months, day 1 <= 1, so +1 = 37 months
                assert(app.workedMonths === 37, 'Months: 3 years from Jan 1 to Jan 1 = 37 months');
            })();

            // 9. Month Calculation - Same month (should be 1 month if day condition is met)
            (() => {
                const app = createTestApp();
                app.startDate = '2023-01-10';
                app.endDate = '2023-01-20';
                app.calculateMonthsFromDate();

                assert(app.workedMonths === 1, 'Months: Same month with day <= = 1 month');
            })();

            // 10. DaysPerMonth Calculation
            (() => {
                const app = createTestApp();
                app.daysPerYear = 20;
                app.daysPerMonth = app.daysPerYear / 12;

                assert(Math.abs(app.daysPerMonth - 1.6667) < 0.01, 'DaysPerMonth: 20 days/year = 1.67 days/month');
            })();

            // 11. Cap Check
            (() => {
                const app = createTestApp();
                app.grossSalary = 10000;
                app.daysPerYear = 20;
                app.daysPerMonth = 20 / 12;
                app.workedMonths = 24;
                assert(app.isCapped === false, 'Cap: Not exceeded when no cap set');

                app.maxCompensationMonths = 12;
                app.workedMonths = 240;
                assert(app.isCapped === true, 'Cap: Exceeded for 20 years with 12 month cap');
            })();

            // 12. Total Indemnity Calculation
            (() => {
                const app = createTestApp();
                app.grossSalary = 36500; // 100/day
                app.daysPerYear = 20;
                app.daysPerMonth = 20 / 12; // 1.67
                app.workedMonths = 24; // 2 years

                // Expected: 100 * 1.67 * 24 = 4008
                const expected = 100 * (20 / 12) * 24;
                assert(Math.abs(app.totalIndemnity - expected) < 1, 'Total: Correct calculation for 2 years');
            })();

            // 13. Invalid date range (end before start)
            (() => {
                const app = createTestApp();
                app.startDate = '2023-03-20';
                app.endDate = '2023-01-10';
                app.calculateMonthsFromDate();

                assert(app.workedMonths === 0, 'Months: End before start = 0 months');
            })();

            // 14. Max Compensation Cap
            (() => {
                const app = createTestApp();
                app.grossSalary = 36500; // 100/day (approx) -> Monthly = 3041.66
                app.daysPerYear = 30;
                app.daysPerMonth = 30 / 12; // 2.5 days/month
                app.maxCompensationMonths = 12; // Cap at 12 monthly salaries (Total = 36500 approx? No, cap is in days)
                // Cap logic in main.js: Math.min(totalDays, this.maxCompensationMonths * 30)
                // Max days = 12 * 30 = 360 days.

                // Case 1: Under cap (24 months worked)
                // Days = 2.5 * 24 = 60 days
                // 60 < 360
                app.workedMonths = 24;
                assert(app.isCapped === false, 'Cap: Not capped when indemnity < max amount');
                // Indemnity = 100 * 60 = 6000
                assert(Math.abs(app.totalIndemnity - 6000) < 1, 'Cap: Indemnity correct when under cap');

                // Case 2: Over cap (150 months worked -> 12.5 years)
                // Days = 2.5 * 150 = 375 days
                // Max days = 360 days
                // 375 > 360 -> Capped
                app.workedMonths = 150;

                assert(app.isCapped === true, 'Cap: Capped when indemnity > max amount');

                // Expected Indemnity = DailySalary * MaxDays
                // 100 * 360 = 36000
                assert(Math.abs(app.totalIndemnity - 36000) < 1, 'Cap: Indemnity limited to max monthly salaries (converted to days)');
            })();

            // Summary
            const summary = document.createElement('div');
            summary.className = 'summary';
            summary.textContent = `Total: ${passed + failed} | Pasados: ${passed} | Fallados: ${failed}`;
            summary.style.color = failed > 0 ? 'red' : 'green';
            resultsDiv.appendChild(summary);

        } catch (error) {
            console.error('Critical error running tests:', error);
            const errorDiv = document.createElement('div');
            errorDiv.className = 'fail';
            errorDiv.style.marginTop = '20px';
            errorDiv.textContent = 'CRITICAL ERROR: ' + error.message;
            resultsDiv.appendChild(errorDiv);
        }
    }
};

// Run tests when DOM is ready
document.addEventListener('DOMContentLoaded', tests.run);
