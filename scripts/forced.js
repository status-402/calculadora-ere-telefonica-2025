registerStrategy({
    name: 'forced',
    label: 'Forzado TID, TSA TGS',
    defaults: {
        daysPerYear1: 50,
        daysPerYear2: 37,
        endDate: '2026-12-31',
        extras: []
    },
    isDaysEditable: false,
    isEndDateEditable: false,
    showBonus: false,
    showBenefits: false,
    isBenefitsEditable: false,
    isExtrasEditable: false,
    showIdSeniority: true,
    isMaxCompensationMonthsEditable: false
});
