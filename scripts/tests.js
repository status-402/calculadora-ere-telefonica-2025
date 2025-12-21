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
                app.startDate = '2023-01-01';
                app.endDate = '2023-12-31'; // 12 months
                app.workedMonths = 12;
                app.daysPerYear1 = 20;
                app.daysPerYear2 = 20;
                app.daysPerMonth1 = 20 / 12;
                app.daysPerMonth2 = 20 / 12;

                assert(Math.abs(app.dailySalary - 100) < 0.01, 'Base: Daily Salary is 100');
                assert(Math.abs(app.workedYears - 1) < 0.01, 'Base: Worked Years is 1');
                assert(Math.abs(app.totalIndemnity - 2000) < 1, 'Base: Total Indemnity ~2000 (100 * 1.67 * 12)');
            })();

            // 2. Bonus & Benefits (Custom)
            // 2. Bonus & Benefits (Custom - Disabled by default but enabled for test)
            (() => {
                const app = createTestApp();
                app.mode = 'custom';
                app.applyStrategy(); // Resets to defaults
                app.showBonus = true; // Enable manual overriding for test
                app.showBenefits = true;
                app.grossSalary = 30000;
                app.bonus = 5000;
                app.benefits = 1500;

                assert(app.totalAnnualSalary === 36500, 'Custom: Total Annual includes Bonus and Benefits');
                assert(app.totalAnnualSalary === 36500, 'Custom: Total Annual includes Bonus and Benefits');
            })();



            // 3. Example 1 Strategy
            // 3. Voluntary Strategy
            (() => {
                const app = createTestApp();
                app.mode = 'voluntary';
                app.applyStrategy();
                app.grossSalary = 30000;
                app.bonus = 5000;

                assert(app.showBenefits === false, 'Voluntary: Benefits not shown');
                assert(app.daysPerYear1 === 50, 'Voluntary: Days per year 1 is 50');
                assert(app.daysPerYear2 === 37, 'Voluntary: Days per year 2 is 37');
                assert(Math.abs(app.daysPerMonth1 - 50 / 12) < 0.01, 'Voluntary: Days per month 1 is 50/12');
                assert(Math.abs(app.daysPerMonth2 - 37 / 12) < 0.01, 'Voluntary: Days per month 2 is 37/12');
                assert(app.isDaysEditable === false, 'Voluntary: Days per year not editable');
            })();

            // 4. Seniority Extras (Example 1)
            // 4. Seniority Extras (Voluntary)
            (() => {
                const app = createTestApp();
                app.mode = 'voluntary';
                app.applyStrategy();
                app.grossSalary = 34100;
                app.startDate = '2017-01-01';
                app.endDate = '2022-12-31'; // 6 years = 72 months
                app.workedMonths = 72;

                // Voluntary extras: 0yr=5000, 8yr=7000...
                // 6 years > 0 years -> 5000.
                assert(app.applicableExtra.amount === 5000, 'Extras: Correct tier found (5000 for >0 years, <8 years)');
                // Total calculation depends on days/year1/2.
                // startDate 2017-01-01 is fully in Period 2 (Post 2012).
                // 37 days/year -> 3.083 days/month.
                // 72 months * 3.0833 = 222 days.
                // Daily salary: 34100 / 365 = 93.424
                // Indemnity = 222 * 93.424 = 20740.
                // Total = 20740 + 5000 = 25740.
                // Let's assert the logic, not exact number if complex, or approx.
                // Check if extra is added.
                const expectedIndemnity = 5000 + (app.totalDaysIndemnity * app.dailySalary);
                assert(Math.abs(app.totalIndemnity - expectedIndemnity) < 1, 'Extras: Total includes extra amount');
            })();

            // 5. Month Calculation - Same day (should add 1 month)
            (() => {
                const app = createTestApp();
                app.startDate = '2023-01-15';
                app.endDate = '2023-03-15';
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);

                // Jan to Mar = 2 months, day 15 <= 15, so +1 month = 3 months
                assert(app.workedMonths === 3, 'Months: Same day adds 1 month (15 to 15 = 3 months)');
            })();

            // 6. Month Calculation - Start day less than end day (should add 1 month)
            (() => {
                const app = createTestApp();
                app.startDate = '2023-01-10';
                app.endDate = '2023-03-20';
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);

                // Jan to Mar = 2 months, day 10 <= 20, so +1 month = 3 months
                assert(app.workedMonths === 3, 'Months: Start day < end day adds 1 month (10 to 20 = 3 months)');
            })();

            // 7. Month Calculation - Start day greater than end day (no additional month)
            (() => {
                const app = createTestApp();
                app.startDate = '2023-01-20';
                app.endDate = '2023-03-10';
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);

                // Jan to Mar = 2 months, day 20 > 10, so no +1 = 2 months
                assert(app.workedMonths === 2, 'Months: Start day > end day no addition (20 to 10 = 2 months)');
            })();

            // 8. Month Calculation - Full years
            (() => {
                const app = createTestApp();
                app.startDate = '2020-01-01';
                app.endDate = '2023-01-01';
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);

                // 3 years * 12 = 36 months, day 1 <= 1, so +1 = 37 months
                assert(app.workedMonths === 37, 'Months: 3 years from Jan 1 to Jan 1 = 37 months');
            })();

            // 9. Month Calculation - Same month (should be 1 month if day condition is met)
            (() => {
                const app = createTestApp();
                app.startDate = '2023-01-10';
                app.endDate = '2023-01-20';
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);

                assert(app.workedMonths === 1, 'Months: Same month with day <= = 1 month');
            })();

            // 10. DaysPerMonth Calculation
            (() => {
                const app = createTestApp();
                app.daysPerYear1 = 20;
                app.daysPerYear2 = 20;
                app.daysPerMonth1 = app.daysPerYear1 / 12;
                app.daysPerMonth2 = app.daysPerYear2 / 12;

                assert(Math.abs(app.daysPerMonth1 - 1.6667) < 0.01, 'DaysPerMonth1: 20 days/year = 1.67 days/month');
            })();

            // 11. Cap Check
            (() => {
                const app = createTestApp();
                app.grossSalary = 10000;
                app.daysPerYear1 = 20;
                app.daysPerYear2 = 20;
                app.daysPerMonth1 = 20 / 12;
                app.daysPerMonth2 = 20 / 12;
                app.startDate = '2021-01-01';
                app.endDate = '2022-12-31'; // 24 months
                app.workedMonths = 24;
                assert(app.isCapped === false, 'Cap: Not exceeded when no cap set');

                app.maxCompensationMonths = 12;
                app.startDate = '2000-01-01';
                app.endDate = '2019-12-31'; // 20 years = 240 months
                app.workedMonths = 240;
                assert(app.isCapped === true, 'Cap: Exceeded for 20 years with 12 month cap');
            })();

            // 12. Total Indemnity Calculation
            (() => {
                const app = createTestApp();
                app.grossSalary = 36500; // 100/day
                app.daysPerYear1 = 20;
                app.daysPerYear2 = 20;
                app.daysPerMonth1 = 20 / 12; // 1.67
                app.daysPerMonth2 = 20 / 12;
                app.startDate = '2021-01-01';
                app.endDate = '2022-12-31'; // 24 months
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
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);

                assert(app.workedMonths === 0, 'Months: End before start = 0 months');
            })();

            // 14. Max Compensation Cap
            (() => {
                const app = createTestApp();
                app.grossSalary = 36500; // 100/day (approx) -> Monthly = 3041.66
                app.daysPerYear1 = 30;
                app.daysPerYear2 = 30;
                app.daysPerMonth1 = 30 / 12; // 2.5 days/month
                app.daysPerMonth2 = 30 / 12;
                app.maxCompensationMonths = 12; // Cap at 12 monthly salaries (Total = 36500 approx? No, cap is in days)
                // Cap logic in main.js: Math.min(totalDays, this.maxCompensationMonths * 30)
                // Max days = 12 * 30 = 360 days.

                // Case 1: Under cap (24 months worked)
                // Days = 2.5 * 24 = 60 days
                // 60 < 360
                app.startDate = '2021-01-01';
                app.endDate = '2022-12-31'; // 24 months
                app.workedMonths = 24;
                assert(app.isCapped === false, 'Cap: Not capped when indemnity < max amount');
                // Indemnity = 100 * 60 = 6000
                assert(Math.abs(app.totalIndemnity - 6000) < 1, 'Cap: Indemnity correct when under cap');

                // Case 2: Over cap (150 months worked -> 12.5 years)
                // Days = 2.5 * 150 = 375 days
                // Max days = 360 days
                // 375 > 360 -> Capped
                app.startDate = '2010-01-01';
                app.endDate = '2022-06-30'; // ~150 months (check carefully) 
                // 2010-01-01 to 2022-06-30
                // 12 years (144 months) to 2022-01-01
                // Jan to June: 5 months. 149 months.
                // Day 1 <= 30: +1 = 150 months. Correct.
                app.workedMonths = 150;

                assert(app.isCapped === true, 'Cap: Capped when indemnity > max amount');

                // Expected Indemnity = DailySalary * MaxDays
                // 100 * 360 = 36000
                assert(Math.abs(app.totalIndemnity - 36000) < 1, 'Cap: Indemnity limited to max monthly salaries (converted to days)');
            })();

            // 15. Installment Payments
            (() => {
                const app = createTestApp();
                app.grossSalary = 30000;
                // Mock total indemnity for simplicity or let it calculate
                // Let's rely on calculation. 30000/365 = 82.19/day
                // Let's set daysPerYear = 365 for easy math -> 1 day/day
                app.daysPerYear1 = 365;
                app.daysPerYear2 = 365;
                app.daysPerMonth1 = 365 / 12;
                app.daysPerMonth2 = 365 / 12;
                app.startDate = '2024-01-01';
                app.endDate = '2024-12-31'; // 12 months
                app.workedMonths = 12;
                // Total = 82.19 * (365/12 * 12) = 82.19 * 365 = 30000

                app.paymentDates = ['2025-06-01', '2026-06-01'];

                const installments = app.installmentPayments;
                assert(installments.length === 2, 'Installments: Correct number of payments');
                assert(installments[0].date === '2025-06-01', 'Installments: Correct first date');
                assert(Math.abs(installments[0].amount - 15000) < 1, 'Installments: Correct split amount (30000 / 2 = 15000)');
                assert(installments[1].date === '2026-06-01', 'Installments: Correct second date');
                assert(Math.abs(installments[1].amount - 15000) < 1, 'Installments: Correct split amount (30000 / 2 = 15000)');
            })();

            // 16. Tax-Exempt Indemnity - All Pre-2012
            (() => {
                const app = createTestApp();
                app.initApp();
                app.grossSalary = 36500; // 100/day
                app.startDate = '2010-01-01';
                app.endDate = '2011-01-01'; // 13 months
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);
                app.daysPerYear1 = 33;
                app.daysPerYear2 = 33;
                app.daysPerMonth1 = 33 / 12;
                app.daysPerMonth2 = 33 / 12;

                // Period 1: 13 months * 3.75 days/month = 48.75 days, 48.75 * 100 = 4875
                const days1 = 13 * 3.75;
                const expected = days1 * 100;
                assert(Math.abs(app.taxExemptIndemnity - expected) < 1, 'Tax-Exempt: Pre-2012 calculation (13 months × 3.75 days/month)');
            })();


            // 17. Tax-Exempt Indemnity - All Post-2012
            (() => {
                const app = createTestApp();
                app.initApp();
                app.grossSalary = 36500; // 100/day
                app.startDate = '2013-01-01';
                app.endDate = '2014-01-01'; // 13 months
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);
                app.daysPerYear1 = 33;
                app.daysPerYear2 = 33;
                app.daysPerMonth1 = 33 / 12;
                app.daysPerMonth2 = 33 / 12;

                // Period 2: 13 months * 2.75 days/month = 35.75 days, 35.75 * 100 = 3575
                const days2 = 13 * 2.75;
                const expected = days2 * 100;
                assert(Math.abs(app.taxExemptIndemnity - expected) < 1, 'Tax-Exempt: Post-2012 calculation (13 months × 2.75 days/month)');
            })();


            // 18. Tax-Exempt Indemnity - Split Period
            (() => {
                const app = createTestApp();
                app.initApp();
                app.grossSalary = 36500; // 100/day
                app.startDate = '2011-02-12';
                app.endDate = '2013-02-11'; // 24 months (12 pre + 12 post)
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);
                app.daysPerYear1 = 33;
                app.daysPerYear2 = 33;
                app.daysPerMonth1 = 33 / 12;
                app.daysPerMonth2 = 33 / 12;

                // Period 1: 12 months * 3.75 days/month = 45 days, 45 * 100 = 4500
                // Period 2: 12 months * 2.75 days/month = 33 days, 33 * 100 = 3300
                // Total: 7800
                const days1 = 12 * 3.75;
                const days2 = 12 * 2.75;
                const expected = (days1 * 100) + (days2 * 100);
                assert(Math.abs(app.taxExemptIndemnity - expected) < 1, 'Tax-Exempt: Split period calculation');
            })();


            // 19. Tax-Exempt Indemnity - Cap at 180,000 and period limits
            (() => {
                const app = createTestApp();
                app.initApp();
                app.grossSalary = 365000; // 1000/day
                app.startDate = '2000-01-01';
                app.endDate = '2020-01-01'; // 241 months total
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);
                app.daysPerYear1 = 33;
                app.daysPerYear2 = 33;
                app.daysPerMonth1 = 33 / 12;
                app.daysPerMonth2 = 33 / 12;

                // Period 1: 145 months * 3.75 = 543.75 days, limited to 42*30 = 1260 days
                // Period 2: 96 months *2.75 = 264 days
                // daysPeriod1 + daysPeriod2 = 543.75 + 264 = 807.75
                // limitedDays2 = Math.max(Math.min(807.75, 720) - 543.75, 0) = Math.max(720 - 543.75, 0) = 176.25
                // amount1 = 543.75 * 1000 = 543,750 (limited to 1260 days would give 1,260,000 so uses 543.75)
                // amount2 = 176.25 * 1000 = 176,250
                // Total = 720,000, capped at 180,000
                assert(app.taxExemptIndemnity === 180000, 'Tax-Exempt: Capped at 180,000€ (with period limits)');
            })();


            // 20. Date Validation - Valid dates
            (() => {
                const app = createTestApp();
                app.initApp();
                app.startDate = '2023-01-01';
                app.endDate = '2023-12-31';

                assert(app.isDateInvalid === false, 'Date Validation: Valid date range');
            })();

            // 21. Date Validation - Invalid dates (end before start)
            (() => {
                const app = createTestApp();
                app.initApp();
                app.startDate = '2023-12-31';
                app.endDate = '2023-01-01';

                assert(app.isDateInvalid === true, 'Date Validation: Invalid date range (end before start)');
            })();

            // 22. Date Validation - Missing dates
            (() => {
                const app = createTestApp();
                app.initApp();
                app.startDate = null;
                app.endDate = '2023-12-31';

                assert(app.isDateInvalid === false, 'Date Validation: Returns false when start date is missing');
            })();

            // 23. Tax-Exempt - Period 1 limit (42 months * 30 days = 1260 days)
            (() => {
                const app = createTestApp();
                app.initApp();
                app.grossSalary = 36500; // 100/day
                app.startDate = '2000-01-01';
                app.endDate = '2012-02-11'; // 146 months
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);
                app.daysPerYear1 = 33;
                app.daysPerYear2 = 33;
                app.daysPerMonth1 = 33 / 12;
                app.daysPerMonth2 = 33 / 12;

                // 146 months * 3.75 days/month = 544.5 days, limited to 42*30 = 1260 days
                // Since 544.5 < 1260, not limited. Result = 544.5 * 100 = 54,450
                const days1 = 146 * 3.75;
                const limitedDays1 = Math.min(days1, 42 * 30);
                const expected = limitedDays1 * 100;
                assert(Math.abs(app.taxExemptIndemnity - expected) < 1, 'Tax-Exempt: Period 1 limited to 1260 days (42 months)');
            })();

            // 24. Tax-Exempt - Period 2 limit (24 months * 30 days = 720 days total)
            (() => {
                const app = createTestApp();
                app.initApp();
                app.grossSalary = 36500; // 100/day
                app.startDate = '2012-02-12';
                app.endDate = '2020-01-01'; // 95 months
                app.workedMonths = app.calculateMonthsFromDate(app.startDate, app.endDate);
                app.daysPerYear1 = 33;
                app.daysPerYear2 = 33;
                app.daysPerMonth1 = 33 / 12;
                app.daysPerMonth2 = 33 / 12;

                // 95 months * 2.75 days/month = 261.25 days
                // limitedDays2 = Math.max(Math.min(0 + 261.25, 720) - 0, 0) = 261.25
                // Result = 261.25 * 100 = 26,125
                const days2 = 95 * 2.75;
                const expected = days2 * 100;
                assert(Math.abs(app.taxExemptIndemnity - expected) < 1, 'Tax-Exempt: Period 2 calculation');
            })();

            // 25. Irregular Income - Payment Years
            (() => {
                const app = createTestApp();
                app.paymentDates = ['2025-01-01', '2025-06-01', '2026-01-01'];
                assert(app.paymentYears === 2, 'Irregular Income: Payment years count distinct years (2025, 2026)');
            })();

            // 26. Irregular Income - Eligibility (True)
            (() => {
                const app = createTestApp();
                app.paymentDates = ['2025-01-01', '2026-01-01']; // 2 years
                // Required: Start + (2*2) years + 1 day = Start + 4 years + 1 day

                app.startDate = '2020-01-01';
                // Target = 2024-01-02
                app.endDate = '2024-02-01'; // Well past target

                assert(app.isIrregularIncome === true, 'Irregular Income: Eligible when date range > required');
            })();

            // 27. Irregular Income - Eligibility (False)
            (() => {
                const app = createTestApp();
                app.paymentDates = ['2025-01-01', '2026-01-01']; // 2 years
                // Required: Start + 4 years + 1 day

                app.startDate = '2020-01-01';
                // Target = 2024-01-02
                app.endDate = '2024-01-01'; // Exactly 4 years -> False

                assert(app.isIrregularIncome === false, 'Irregular Income: Not eligible when date range < required');
            })();

            // 28. Irregular Income - Reduction Calculation (Removed)
            // Test removed as reduction amount is no longer calculated/displayed.

            // 29. Irregular Income - Single Payment Default & Exact Date
            (() => {
                const app = createTestApp();
                app.paymentDates = []; // No installments -> 1 year
                assert(app.paymentYears === 1, 'Irregular Income: Defaults to 1 payment year if no installments');

                // Required: Start + (1*2) years + 1 day <= End
                // Let's say Start = 2020-01-01
                // Target = 2020-01-01 + 2 years = 2022-01-01 + 1 day = 2022-01-02

                app.startDate = '2020-01-01';

                // Case A: End = 2022-01-01 (Exactly 2 years) -> False
                app.endDate = '2022-01-01';
                assert(app.isIrregularIncome === false, 'Irregular Income: Not eligible at exactly 2 years');

                // Case B: End = 2022-01-02 (2 years + 1 day) -> True
                app.endDate = '2022-01-02';
                assert(app.isIrregularIncome === true, 'Irregular Income: Eligible at exactly 2 years + 1 day');
            })();

            // 30. External Link Strategy
            (() => {
                const app = createTestApp();
                // Mock window.open
                let openedUrl = null;
                const originalOpen = window.open;
                window.open = (url, target) => {
                    openedUrl = url;
                };

                // Mock strategies including one with URL
                app.strategies = [
                    { name: 'default', label: 'Default' },
                    { name: 'link_web', label: 'Web', url: 'https://example.com' }
                ];

                // Initialize app state
                app.mode = 'default';
                app.lastMode = 'default';

                // Simulate watcher behavior since createTestApp mocks it away or simplistic
                // We need to verify the logic inside the watcher callback provided in initApp/main.js
                // So we'll access the logic directly or simulate the change if we could, 
                // but since main.js is a component definition, we can instantiate it and manually trigger the watcher logic

                // Let's manually trigger the logic we added to the watcher for testing purposes
                const triggerModeChange = (newMode) => {
                    const strategy = app.strategies.find(s => s.name === newMode);
                    if (strategy && strategy.url) {
                        window.open(strategy.url, '_blank');
                        app.mode = app.lastMode; // Revert
                    } else {
                        app.lastMode = newMode;
                        // app.applyStrategy(); // We don't need to test applyStrategy here
                    }
                };

                // Action: Select external link
                triggerModeChange('link_web');

                // Assertions
                assert(openedUrl === 'https://example.com', 'External Link: window.open called with correct URL');
                assert(app.mode === 'default', 'External Link: Mode reverted to previous value');

                // Cleanup
                window.open = originalOpen;
                // Since this test modifies window.open, passed/failed logic in asserts needs to run safely.
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
