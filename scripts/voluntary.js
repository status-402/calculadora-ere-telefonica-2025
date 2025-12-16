registerStrategy({
    name: 'voluntary',
    label: 'Voluntario TID, TSA TGS',
    defaults: {
        daysPerYear1: 50,
        daysPerYear2: 37,
        endDate: '2026-12-31',
        extras: [
            { years: 0, amount: 5000 },
            { years: 8, amount: 7000 },
            { years: 12, amount: 9000 },
            { years: 16, amount: 12000 },
            { years: 20, amount: 15000 },
            { years: 24, amount: 18000 },
        ]
    },
    isDaysEditable: false,
    isEndDateEditable: false,
    showBonus: false,
    showBenefits: false,
    isBenefitsEditable: false,
    isExtrasEditable: false,
    isMaxCompensationMonthsEditable: false
});
