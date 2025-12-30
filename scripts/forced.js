registerStrategy({
    name: 'forced',
    label: 'Forzado TID, TSA TGS',
    defaults: {
        daysPerYear1: 50,
        daysPerYear2: 37,
        endDate: '2026-02-28',
        extras: []
    },
    isDaysEditable: false,
    isEndDateEditable: true,
    showBonus: false,
    showBenefits: false,
    isBenefitsEditable: false,
    isExtrasEditable: false,
    isMaxCompensationMonthsEditable: false
});
