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
                // For these tests, we manually trigger logic so watchers might not be strictly necessary 
                // unless we rely on them for side effects.
                // If we need side effects, we'd need a more complex mock.
                // For now, let's just make it a no-op to prevent crashing.
            };
            return app;
        };

        try {
            // --- Test Suite ---

            // 1. Base Calculation
            (() => {
                const app = createTestApp();
                app.initApp();
                app.grossSalary = 36500;
                app.workedDays = 365;
                app.daysPerYear = 20;

                assert(Math.abs(app.dailySalary - 100) < 0.01, 'Base: Daily Salary is 100');
                assert(Math.abs(app.workedYears - 1) < 0.01, 'Base: Worked Years is 1');
                assert(Math.abs(app.totalIndemnity - 2000) < 0.01, 'Base: Total Indemnity is 2000 (100 * 20 * 1)');
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

            // 3. TID Strategy (No Benefits)
            (() => {
                const app = createTestApp();
                app.mode = 'tid';
                app.applyStrategy();
                app.grossSalary = 30000;
                app.bonus = 5000;
                app.benefits = 1500; // Should be ignored/hidden logic

                // Note: In TID mode, showBenefits is false, so totalAnnualSalary logic excludes it
                assert(app.showBenefits === false, 'TID: Benefits hidden');
                assert(app.totalAnnualSalary === 35000, 'TID: Total Annual excludes Benefits');
                assert(app.daysPerYear === 43, 'TID: Days per year is 43');
                assert(app.isDaysEditable === false, 'TID: Days per year not editable');
            })();

            // 4. Seniority Extras (TID)
            (() => {
                const app = createTestApp();
                app.mode = 'tid';
                app.applyStrategy();
                app.grossSalary = 36500; // Daily 100
                app.workedDays = 365 * 6; // 6 years

                // Base: 100 * 43 * 6 = 25800
                // Extra for > 5 years: 10000
                // Total: 35800

                assert(app.applicableExtra.amount === 10000, 'Extras: Correct tier found (5 years)');
                assert(Math.abs(app.totalIndemnity - 35800) < 0.1, 'Extras: Total includes extra amount');
            })();

            // 5. Date Calculation
            (() => {
                const app = createTestApp();
                app.inputMethod = 'date';
                const yesterday = new Date();
                yesterday.setDate(yesterday.getDate() - 1);
                // Use local time string construction to avoid UTC issues
                const year = yesterday.getFullYear();
                const month = String(yesterday.getMonth() + 1).padStart(2, '0');
                const day = String(yesterday.getDate()).padStart(2, '0');
                app.startDate = `${year}-${month}-${day}`;
                app.calculateDaysFromDate();

                assert(app.workedDays === 1, 'Date: Calculates 1 day for yesterday');
            })();

            // 6. Cap Check
            (() => {
                const app = createTestApp();
                app.grossSalary = 10000;
                app.daysPerYear = 20;
                app.workedDays = 365 * 2; // 2 years
                // Indemnity: (10000/365) * 20 * 2 = ~1095
                // Not exceeding cap
                assert(app.exceedsCap === false, 'Cap: Not exceeded');

                app.workedDays = 365 * 20; // 20 years
                // Indemnity: (10000/365) * 20 * 20 = ~10958 > 10000
                assert(app.exceedsCap === true, 'Cap: Exceeded');
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
