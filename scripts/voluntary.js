registerStrategy({
    name: 'voluntary',
    label: 'Voluntario TID, TSA TGS',
    defaults: {
        daysPerYear1: 50,
        daysPerYear2: 37,
        endDate: '2026-02-28',
        extras: [
            { years: 0, amount: 5000 },
            { years: 8, amount: 7000 },
            { years: 12, amount: 9000 },
            { years: 16, amount: 12000 },
            { years: 20, amount: 15000 },
            { years: 24, amount: 18000 },
        ],
        installmentOptions: [1, 3, 5]
    },
    isDaysEditable: false,
    isEndDateEditable: true,
    showBonus: false,
    showBenefits: false,
    isBenefitsEditable: false,
    isExtrasEditable: false,
    isMaxCompensationMonthsEditable: false
});
