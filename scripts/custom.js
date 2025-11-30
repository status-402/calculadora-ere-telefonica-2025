registerStrategy({
    name: 'custom',
    label: 'Personalizado',
    defaults: {
        daysPerYear: 23,
        maxCompensationMonths: 12,
        extras: []
    },
    isDaysEditable: true,
    showBonus: true,
    showBenefits: true,
    isExtrasEditable: true,
    isMaxCompensationMonthsEditable: true
});
