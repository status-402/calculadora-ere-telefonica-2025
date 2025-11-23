registerStrategy({
    name: 'example1',
    label: 'Example 1',
    defaults: {
        daysPerYear: 50
    },
    isDaysEditable: false,
    showBonus: true,
    showBenefits: false,
    extras: [
        { years: 5, amount: 15000 },
        { years: 10, amount: 20000 },
        { years: 15, amount: 25000 },
        { years: 20, amount: 30000 },
        { years: 25, amount: 35000 }
    ],
    isExtrasEditable: false
});
