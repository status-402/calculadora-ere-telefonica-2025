registerStrategy({
    name: 'example2',
    label: 'Example 2',
    defaults: {
        daysPerYear: 43
    },
    isDaysEditable: false,
    showBonus: true,
    showBenefits: false,
    extras: [
        { years: 5, amount: 10000 },
        { years: 10, amount: 15000 },
        { years: 15, amount: 20000 },
        { years: 20, amount: 25000 },
        { years: 25, amount: 30000 }
    ],
    isExtrasEditable: false
});
